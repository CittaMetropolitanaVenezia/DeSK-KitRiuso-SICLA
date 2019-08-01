<?php

App::uses('PaginatorComponent', 'Controller/Component');

class RestPaginatorComponent extends PaginatorComponent {
    /**
     * A reference to the instantiating controller object.
     * This is setup by the PaginatorComponent itself.
     *
     * @access private
     * @var Controller class
     */
    protected $Controller;

    public $allowedFields = array();
    public $deniedFields = array();

    /**
     * Main execution method. Handles validating of allowed filter constraints.
     *
     * @param Controller $controller A reference to the instantiating controller object
     * @throws BanchaException
     * @return void
     */
    public function startup(Controller $controller) {
        // get request
        $request = ($controller->request->is('post')) ? $controller->request->data : $controller->request->query;
        if(!isset($request['rest']) || !$request['rest']) {
            // this is not a rest request, so nothing for us to do here
            return;
        }
    }

    /**
     * Handles automatic pagination of model records.
     *
     * The RestPaginatorComponents extends the default
     * behavior by supporting remote filtering on Rest
     * requests if the $allowedFilters property allows it.
     *
     * @param mixed $object Model to paginate (e.g: model instance, or 'Model', or 'Model.InnerModel')
     * @param mixed $scope Additional find conditions to use while paginating
     * @param array $whitelist List of allowed fields for ordering.  This allows you to prevent ordering
     *   on non-indexed, or undesirable columns.
     * @return array Model query results
     * @throws MissingModelException
     * @throws BanchaException
     */
    public function paginate($object = null, $scope = array(), $whitelist = array()) {
        // get request
        $request = ($this->Controller->request->is('post')) ? $this->Controller->request->data : $this->Controller->request->query;
        // rest-specific access-restriction logic
		if(array_key_exists('rest', $request) AND $request['rest']) {
            // format client settings (page,limit,sort...)
            $order = $direction = null;
            if (array_key_exists('order', $request)) {
                $clientSortSettings = json_decode($request['order']);
                $this->settings['order']  = array();
                foreach($clientSortSettings AS $clientSortSetting) {
                    $this->settings['order'][$clientSortSetting->property] = $clientSortSetting->direction;
                }
            } else if (array_key_exists('sort', $request)) {
                $clientSortSettings = json_decode($request['sort']);
                $this->settings['order']  = array();
                foreach($clientSortSettings AS $clientSortSetting) {
                    $this->settings['order'][$clientSortSetting->property] = $clientSortSetting->direction;
                }
            }
			else if (array_key_exists('sort', $request)) {
				$clientSortSettings = json_decode($request['sort']);
				$this->settings['order'] = array();
				foreach($clientSortSettings AS $clientSortSetting) {
					$this->settings['order'][$clientSortSetting->property] = $clientSortSetting->direction;
				}
			}

            // add page settings
            if (array_key_exists('page', $request)) $this->settings['page'] = $request['page'];
            if (array_key_exists('limit', $request)) $this->settings['limit'] = $request['limit'];
			
            //$conditionTokens = json_decode($request['conditions']);
            // pr(gettype($conditionTokens[0]->property));die();
            // format client conditions
            $remoteConditions = array();
            if (array_key_exists('conditions', $request)) {
                $conditionTokens = json_decode($request['conditions']);
                // fb($conditionTokens);
				
                foreach ($conditionTokens AS $condition) {
                    if (isset($condition->value)) { //se esiste la proprieta value
                        if (!is_numeric($condition->value)
                            AND (
                                $condition->property == 'username'
                                OR $condition->property == 'email'
								OR $condition->property == 'surname'
                                OR ($condition->property == 'name' AND $this->Controller->name != 'Domines')
                                OR $condition->property == 'description'
                                OR $condition->property == 'org_name'
                            )
                        ) {
                            $scope['UPPER(' .$condition->property. ') LIKE'] = '%'.strtoupper($condition->value).'%';
                        } else {
                            $scope[$condition->property] = $condition->value;
                        }
                    } else if (gettype($condition->property) == 'object') {
                        $scope[] = $condition->property;
                    } else if ($condition->property != 'name') {
                        $scope[] = $condition->property;
                    }
                }
            }
            // fb($request);
            // fb($scope);
			
            // add filters to conditions
            $dateConditions = array();
            if (array_key_exists('filter', $request)) {
                $filters = json_decode($request['filter']);
				
                foreach ($filters AS $filter) {
                    if ($filter->type == 'list') {
                        $scope[$filter->field] = $filter->value;
                    } else if ($filter->type == 'string') {
                        $scope['UPPER(' .$filter->field. ') LIKE'] = strtoupper($filter->value).'%';
                    } else if ($filter->type == 'date') {
                        if (!array_key_exists($filter->field, $dateConditions)) {
                            $dateConditions[$filter->field] = array($filter);
                        } else {
                            $dateConditions[$filter->field][] = $filter;
                        }
                    }
                }
            }
            // process date conditions
            foreach ($dateConditions AS $fieldName => $filters) {
                $fixedFilter = array();
                foreach ($filters AS $filter) {
                    // fix date
                    $tokens = explode('/', $filter->value);
                    $value = $tokens[2].'-'.$tokens[0].'-'.$tokens[1];
                    // comparison
                    if ($filter->comparison == 'lt') {
                        $fixedFilter[$filter->field.' <= '] = $value;
                    } else if ($filter->comparison == 'gt') { // greater
                        $fixedFilter[$filter->field.' >= '] = $value;
                    } else { // eq
                        $fixedFilter[$filter->field] = $value;
                    }
                }
                $scope['AND'] = $fixedFilter;
            }
            // fb($scope);

            // always remove the_geom from pagianted data
            //$this->deniedFields[] = "the_geom";

            // include only allowed fields
            if (count($this->allowedFields) > 0) {
                $this->settings['fields'] = $this->allowedFields;
            }
            // some fields to exclude from the query?
            else if (count($this->deniedFields) > 0) {
                // import the model
                $model = ClassRegistry::init($this->Controller->modelClass);
                // remove deniedFields from model fields
                $fields = array_diff( array_keys($model->schema()), $this->deniedFields);
                // add to paginator settings
                $this->settings['fields'] = $fields;
            }

            $scope = array_merge($remoteConditions, $scope);
            // $this->settings['order'] = array();
            // pr($this->settings);die();
            // fb($scope);
            // set whitelist
            $this->whitelist[] = 'conditions';
            $this->whitelist[] = 'joins';
        }
		/*var_dump($object);
		var_dump($scope);
		var_dump($whitelist);*/
        return parent::paginate($object, $scope, $whitelist);
    }



    public function validateSort(Model $object, array $options, array $whitelist = array()) {
        if (empty($options['order']) && is_array($object->order)) {
            $options['order'] = $object->order;
        }

        if (isset($options['sort'])) {
            $direction = null;
            if (isset($options['direction'])) {
                $direction = strtolower($options['direction']);
            }
            if (!in_array($direction, array('asc', 'desc'))) {
                $direction = 'asc';
            }
            $options['order'] = array($options['sort'] => $direction);
        }

        if (!empty($whitelist) && isset($options['order']) && is_array($options['order'])) {
            $field = key($options['order']);
            $inWhitelist = in_array($field, $whitelist, true);
            if (!$inWhitelist) {
                $options['order'] = null;
            }
            return $options;
        }

        if (!empty($options['order']) && is_array($options['order'])) {
            $order = array();
            foreach ($options['order'] as $key => $value) {
                $field = $key;
                $alias = $object->alias;
                if (strpos($key, '.') !== false) {
                    list($alias, $field) = explode('.', $key);
                }
                $correctAlias = ($object->alias == $alias);

                if ($correctAlias && $object->hasField($field)) {
                    $order[$object->alias . '.' . $field] = $value;
                } elseif ($correctAlias && $object->hasField($key, true)) {
                    $order[$field] = $value;
                } elseif (isset($object->{$alias}) && $object->{$alias}->hasField($field, true)) {
                    $order[$alias . '.' . $field] = $value;
                } else {
                    // aggiunto per compatibilità con campi virtuali (vedi statistiche)
                    $order[$field] = $value;
                }
            }
            $options['order'] = $order;
        }

        return $options;
    }
}