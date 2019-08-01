<?php
App::uses('AppController', 'Controller');
App::uses('Folder', 'Utility');
App::uses('File', 'Utility');
/**
 * Configurations Controller
 *
 * @property Configuration $Configuration
 */
class ConfigurationsController extends AppController {

    /**
     * everyone can load login configuration
     */
    public function beforeFilter() {
        parent::beforeFilter();
        $this->Auth->allow('get');
    }

    /**
     * User is authorized for this controller/action?
     * @param $user
     * @return bool
     */
    public function isAuthorized($user) {
        // Admin can do anything
        if ($this->Auth->user('id') == 1) {
            return true;
        }
        return parent::isAuthorized($user);
    }

    /**
     * Load login configuration
     * @return array
     */
    public function get($Auth=false, $Session) {
        $configuration = array('loggedin' => false);
        if ($Auth AND $Auth->loggedIn()) {
            // load and save settings
            $this->_loadSettings($Session);
            // get draw buffer (from ini)
            $buffer = $Session->read('settings.map.draw.buffer');
            // load town data
            $townData = $this->_loadTownData($Auth->user('town_id'), $buffer);
            // build output
            $configuration = array(
                'loggedin' => true,
                'settings' => array(
                    'user' => $Auth->user(),
                    'submissions_enable' => $this->_checkSubmissionsPeriodLimit($Session),
                    'startDate' => $Session->read('settings.general.startDate'),
                    'endDate' => $Session->read('settings.general.endDate'),
                    'map' => array_merge(
                        $Session->read('settings.map'),
                        array(
                            'controls' => array(),
                            'town_buffer_geojson' => $townData['buffer'],
                            'town_max_bounds' => $townData['bounds'],
                            'town_neighbors' => $townData['neighbors']
                        )
                    )
                ),
                'labels' => $Session->read('settings.labels')
            );
        }
        return $configuration;

        /*
        fb($this->Session->read('acl'));
        $configuration = array(
            'general' => Configure::read('general'),
            'login' => Configure::read('login'),
            'user' => $this->Auth->user(),
            'impersonator' => $this->getImpersonator(),
            'icons' => Configure::read('icons'),
            'labels' => Configure::read('labels'),
            'portlets' => $this->getUserPortlets(),
            'maps' => Configure::read('maps'),
            // TODO: fix
            'acl' => $this->Session->read('acl')
        );
        $userData = $this->Auth->user();
        // add defaults
        $configuration['acl'][] = 'admin.portlets.manager';
        $configuration['acl'][] = 'system.utilities.history';
        $configuration['acl'][] = 'system.utilities.bookmarks';
        */
        /*
        if ($userData['username'] == 'superadmin') {
            $configuration['acl'][] = 'admin.system.manager';
            $configuration['acl'][] = 'admin.portlets.manager';
            $configuration['acl'][] = 'admin.sysnotes.manager';
            $configuration['acl'][] = 'admin.groups.manager';
            $configuration['acl'][] = 'admin.functionalities.manager';
            $configuration['acl'][] = 'admin.domines.manager';
        }
        */
    }

    /**
     * Check submissions enabled period
     *
     * @param $Session
     * @return bool
     */
    public function _checkSubmissionsPeriodLimit($general) {
        $startDate = $general['startDate'];
        $startTokens = explode('/', $startDate);
        $startTime = mktime(0, 0, 0, $startTokens[1], $startTokens[0], $startTokens[2]);
        $endDate = $general['endDate'];
        $endTokens = explode('/', $endDate);
        $endTime = mktime(0, 0, 0, $endTokens[1], $endTokens[0], $endTokens[2]);
        $now = time();
        if ($now >= $startTime AND $now <= $endTime) {
            return true;
        }
        return false;
    }

    /*private function _loadSettings($Session) {
        Configure::load('settings', 'ini');
        $Session->write('settings', array(
            'general' => Configure::read('general'),
            'mail' => Configure::read('mail'),
            'map' => Configure::read('map'),
            'labels' => Configure::read('labels')
        ));
    }*/

    public function _loadTownData($town_id, $buffer, $project_id) {
        // init output
        $output = array('buffer' => null, 'bounds' => null, 'neighbors' => null);
        $TownModel = ClassRegistry::init('Town');
        // only for towns
        if ($town_id > 0) {
            // require lib
            require_once APP . 'Vendor' .DS. 'geophp' .DS. 'geoPHP.inc';
            // get buffer geoJson
            $wkt = $TownModel->getTownBufferWKt($town_id, $buffer, $project_id);
            if ($wkt) {
                $wkt = geoPHP::load($wkt);
                // convert
                $geojson = json_decode($wkt->out('json'));
                $output['buffer'] = array($geojson);
            }
            // get neighbors
			$myFile = APP.'Config/Project/'.$project_id.DS."settings.ini";
			$configuration = parse_ini_file($myFile,true);
			$this->loadModel('TownProject');
			if($configuration['general']['drawOverLimits'] == 1) {
				$entities = $this->TownProject->find('all',array(
				'conditions' => array(
					'TownProject.project_id' => $project_id,
					'TownProject.town_id !=' => $town_id
					)));
			}else {
				
				$entities = $this->TownProject->find('all',array(
					'conditions' => array(
						'TownProject.project_id' => $project_id,
						'TownProject.town_id !=' => $town_id,
						'Town.entity' => 'Ente')));
			}					
			if($entities && count($entities)>0){
				foreach($entities as $entity){
					if($entity['Town']['gid'] == $town_id){
						unset($entity['Town']);
					}else{
						$neighbEntities[] = $entity['Town'];
					}
					
				}
				foreach($neighbEntities as $entity){
					$item = array(
						'type' => 'Feature',
						'properties' => array(
							'gid' => $entity['gid'],
							'name' => $entity['name']),
						'geometry' => null
							);
					$output['neighbors'][] = $item;
				}
			}
			$neighbors = $TownModel->getTownNeighbors($town_id,$project_id);
            foreach ($neighbors AS $town) {
                $wkt = geoPHP::load($town['wkt']);
                // convert
                $geojson = json_decode($wkt->out('json'));
                // add id and name
                $geojson = array(
                    'type' => 'Feature',
                    'properties' => array(
                        'gid' => $town['gid'],
                        'name' => $town['name']
                    ),
                    'geometry' => $geojson
                );
                // add to output
                $output['neighbors'][] = $geojson;
            }			
        }
        // get town bounds
        $townExtent = $TownModel->getTownExtent($town_id, $project_id);
        $output['bounds'] = $townExtent;
        return $output;
    }

    // TODO: recuperare da session dopo login...
    private function _getTownExtent($town_id) {

        $town = $TownModel->find('first', array(
            'conditions' => array('id' => $town_id)
        ));
        pr($town);
        if ($town AND count($town) > 0) {
            pr($town);die();
        }
    }

    // TODO: recuperare da session dopo login...
    private function _getTownBufferGeoJson($town_id) {
        $TownModel = ClassRegistry::init('Town');
        $wkt = $TownModel->getTownBufferWKt($town_id, 100);
        if ($wkt) {
            // require lib
            require APP . 'Vendor' .DS. 'geophp' .DS. 'geoPHP.inc';
            $wkt = geoPHP::load($wkt);
            // convert
            $geojson = json_decode($wkt->out('json'));
            return array($geojson);
        }
        return array();
    }

	/**
     * get acl
     *
     * @return array
     */
	private function getAcl() {
		$groupUser = ClassRegistry::init('GroupUser');
		$functionalitygroup = ClassRegistry::init('FunctionalityGroup');
		
		//recupero tutti i gruppi a cui è associato quell'utente
		$allGroups = $groupUser->find('all',array(
			'conditions'=>array(
				'GroupUser.user_id' => $this->Auth->user('id')
			))
		);
		
		$groupids = array();			
		$groupNames = array();
		//recupero gli id di tutti i gruppi
		foreach ($allGroups as $ag) {
			
			$groupids[] = $ag['GroupUser']['group_id'];
			$groupNames[] = $ag['Group']['name'];
			
		}
		
		// get ACL settings
		$resAcl = $functionalitygroup->find('all',array(
			'conditions'=> array(
				'FunctionalityGroup.group_id' => $groupids
			),
			'fields'=>array('DISTINCT FunctionalityGroup.action_path')
		));
		$acls = Set::extract($resAcl, '{n}.FunctionalityGroup.action_path');
		print_r($acls);
		die();
		return $acls;
	}
	
	
	public function testAcl() {
	
		$this->getAcl();
	
	}

    /**
     * Generate a random token
     *
     * @param string $length
     * @return string
     */
    private function createRandomToken($length = ""){
        $code = md5(uniqid(rand(), true));
        if ($length != "")
            return substr($code, 0, $length);
        else
            return $code;
    }

    /**
     * Get impersonator (user) record
     *
     * @return bool
     */
    private function getImpersonator() {
        // return $this->Auth->user();
        // is current user impersonating somebody else?
        if ( $this->Session->check( 'Auth.Impersonator' ) ) {
            return $this->Session->read( 'Auth.Impersonator' );
        }
        return false;
    }

    /**
     * Recupera impstazioni di sistema dai vari file ini
     */
    public function getSystemSettings() {
        // action without view
        $this->autoRender = false;
        // get input
        $input = $this->request->data;
        // fb($input);
        // init output
        $settings = array();
        // loop over fields to get data
		$myFile = APP .'Config/settings.ini';
		$general_settings = parse_ini_file($myFile,true);
        foreach ($input['fields'] AS $fieldName) {
			$exploded = explode('.',$fieldName);
		$settings[$fieldName] = $general_settings[$exploded[0]][$exploded[1]];
        }
        // return output
        echo json_encode(array(
            'status' => count($settings) > 0,
            'settings' => $settings
        ));
    }	
	public function getProjectSettings(){
		$this->autoRender = false;
		$myFile = APP . "Config/Project/".$this->params['data']['id'].DS."settings.ini";
			$parsed_file = parse_ini_file($myFile, true);
			foreach($parsed_file['general'] as $key => $val){
				$finalKey = 'general.'.$key;
				$settings[$finalKey] = $val;
			}
			foreach($parsed_file['mail'] as $key => $val){
			if($key == 'notification.from'){
				$tokens = explode('#', $val);
				$settings['mail.notification.from.address'] = $tokens[0];
				$settings['mail.notification.from.name'] = $tokens[1];
			}else{	
				$finalKey = 'mail.'.$key;
				$settings[$finalKey] = $val;
				}
			}
			foreach($parsed_file['map'] as $key => $val){				
						
				$finalKey = 'map.'.$key;
				$settings[$finalKey] = $val;
			}
			foreach($parsed_file['geometries'] as $key => $val){
				$finalKey = 'geometries.'.$key;
				$settings[$finalKey] = $val;
			}
			$this->loadModel('Project');
			$project = $this->Project->find('first',array(
				'conditions' => array(
					'id' => $this->params['data']['id'])));
			$settings['shape_table'] = $project['Project']['shape_table'];	
			echo json_encode(array(
				'status' => count($settings) > 0,
				'settings' => $settings
        ));
	}

    /**
     * Salva le modifiche alle impostazioni di sistema, diramandole ai vari file ini
     * e facendone una copia di sicurezza
     */
    public function setSystemSettings() {
        // action without view
        $this->autoRender = false;
        // init output
        $status = false;
        // get input
        $input = $this->request->data;
        // loop over values and unpdate configured settings
        foreach ($input['values'] AS $fieldName => $fieldValue) {
                if (is_numeric($fieldValue)) {
                    Configure::write($fieldName, $fieldValue);
                }
                else Configure::write($fieldName, '\''.$fieldValue.'\'');
           
        }
        /*//reinserisco tutti i valori del sezione map
        $mapData = $this->Session->read('settings.map');

        foreach ($mapData as $fieldName => $fieldValue) {
            Configure::write('map.'.$fieldName, $fieldValue);
        }*/

        // write to ini file
        $status = @Configure::dump('settings.ini', 'ini', array('general'));
        // return output
        echo json_encode(array(
            'status' => $status
        ));
    }
	public function setProjectSettings() {
        // action without view
        $this->autoRender = false;
        // init output
        $status = false;
        // get input
		$posGeneral = 'general';
		$posMap = 'map';
		$posEmail = 'mail';
		$posGeometries = 'geometries';
		$dataToSave = $this->request->data['values'];
		foreach($dataToSave as $key => $val){
			
			if(strpos($key,$posGeneral) !== false){
				$explodedKey = explode('.',$key);
				$section = $explodedKey[0];
				$finalKey = '';
				for($i=1; $i<count($explodedKey); $i++){
					if($i==1){
						$finalKey = $explodedKey[$i];
					}else{
					$finalKey = $finalKey.'.'.$explodedKey[$i];
					}
				}
				$finalData[$section][$finalKey] = $val;
			}else if(strpos($key,$posMap) !== false){
				$explodedKey = explode('.',$key);
				$section = $explodedKey[0];
				$finalKey = '';
				for($i=1; $i<count($explodedKey); $i++){
					if($i==1){
						$finalKey = $explodedKey[$i];
					}else{
					$finalKey = $finalKey.'.'.$explodedKey[$i];
					}
				}
				$finalData[$section][$finalKey] = $val;				
			}else if(strpos($key,$posGeometries) !== false){
				$explodedKey = explode('.',$key);
				$section = $explodedKey[0];
				$finalKey = '';
				for($i=1; $i<count($explodedKey); $i++){
					if($i==1){
						$finalKey = $explodedKey[$i];
					}else{
					$finalKey = $finalKey.'.'.$explodedKey[$i];
					}
				}
				$finalData[$section][$finalKey] = $val;					
			}else if(strpos($key,$posEmail) !== false){
				$explodedKey = explode('.',$key);
				$section = $explodedKey[0];
				$finalKey = '';
				for($i=1; $i<count($explodedKey); $i++){
					if($i==1){
						$finalKey = $explodedKey[$i];
					}else{
					$finalKey = $finalKey.'.'.$explodedKey[$i];
					}
				}
				if($finalKey != 'notification.from.address' && $finalKey != 'notification.from.name'){
				$finalData[$section][$finalKey] = $val;
				}else{
					$finalData[$section]['notification.from'] = $dataToSave['mail.notification.from.address'].'#'.$dataToSave['mail.notification.from.name'];
				}
			}
		}
		   if (array_key_exists('notification.from.address', $finalData['mail'])) {
            $notificationMailFrom = $finalData['mail']['notification.from.address'] .'#'. $finalData['mail']['notification.from.name'];
			$finalData['mail']['notification.from'] = $notificationMailFrom;
		   }		
		$myFile = APP . "Config/Project/".$this->request->data['id'].DS."settings.ini";
		$finalData['general']['uploadPath'] = APP . 'attachments';
		$status = $this->write_ini_file($myFile, $finalData);
		
		$this->loadModel('Project');
		$active['active'] = true;
		$this->Project->id = $this->request->data['id'];
		$this->Project->save($active);

		
        echo json_encode(array(
            'status' => $status
        ));
	
    }	
    /**
     * Write an ini configuration file
     * 
     * @param string $file
     * @param array  $array
     * @return bool
     */
    function write_ini_file($file, $array = []) {
        // check first argument is string
        if (!is_string($file)) {
            throw new \InvalidArgumentException('Function argument 1 must be a string.');
        }

        // check second argument is array
        if (!is_array($array)) {
            throw new \InvalidArgumentException('Function argument 2 must be an array.');
        }

        // process array
        $data = array();
        foreach ($array as $key => $val) {
            if (is_array($val)) {
                $data[] = "[$key]";
                foreach ($val as $skey => $sval) {
                    if (is_array($sval)) {
                        foreach ($sval as $_skey => $_sval) {
                            if (is_numeric($_skey)) {
                                $data[] = $skey.'[] = '.(is_numeric($_sval) ? $_sval : (ctype_upper($_sval) ? $_sval : '"'.$_sval.'"'));
                            } else {
                                $data[] = $skey.'['.$_skey.'] = '.(is_numeric($_sval) ? $_sval : (ctype_upper($_sval) ? $_sval : '"'.$_sval.'"'));
                            }
                        }
                    } else {
                        $data[] = $skey.' = '.(is_numeric($sval) ? $sval : (ctype_upper($sval) ? $sval : '"'.$sval.'"'));
                    }
                }
            } else {
                $data[] = $key.' = '.(is_numeric($val) ? $val : (ctype_upper($val) ? $val : '"'.$val.'"'));
            }
            // empty line
            $data[] = null;
        }

        // open file pointer, init flock options
        $fp = fopen($file, 'w');
        $retries = 0;
        $max_retries = 100;

        if (!$fp) {
            return false;
        }

        // loop until get lock, or reach max retries
        do {
            if ($retries > 0) {
                usleep(rand(1, 5000));
            }
            $retries += 1;
        } while (!flock($fp, LOCK_EX) && $retries <= $max_retries);

        // couldn't get the lock
        if ($retries == $max_retries) {
            return false;
        }

        // got lock, write data
        fwrite($fp, implode(PHP_EOL, $data).PHP_EOL);

        // release lock
        flock($fp, LOCK_UN);
        fclose($fp);

        return true;
    }    
}