<?php
App::uses('AppController', 'Controller');
/**
 * Towns Controller
 *
 * @property Configuration $Coniguration
 */
class TownsController extends AppController {

    /**
     * Components
     *
     * @var array
     */
    public $components = array(
		'RequestHandler',
		'Paginator' => array(
			'className' => 'RestPaginator',
			'settings' => array(
				'limit' => 200,
				'maxLimit' => 400
			),
		),
	);

    /**
     * everyone can load login configuration
     */
    public function beforeFilter() {
        parent::beforeFilter();
    }


    private function fixConditions() {
        // get request type (GET or POST)
        $reqType = ($this->request->is('post')) ? 'data' : 'query';
        // get conditions
        $conditions = (array_key_exists('conditions', $this->request->{$reqType}) ? json_decode($this->request->{$reqType}['conditions']) : array());
        // loop over conditions (and overwrite)
        $fixedConditions = array();
        // loop over passed conditions
        foreach ($conditions AS $condition) {
            switch ($condition->property) {
                case 'code':
                    $condition->property = 'UPPER(Town.code) LIKE';
                    $condition->value = '%'.strtoupper($condition->value).'%';
                    $fixedConditions[] = $condition;
                    break;
                default:
                    $fixedConditions[] = $condition;
                    break;
            }
        }
        // encode
        $encodedConditions = json_encode($fixedConditions);
        // reassign modified conditions
        $this->request->{$reqType}['conditions'] = $encodedConditions;
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
     * index method
     *
     * @return void
     */
    public function index() {
        $this->Town->recursive = 0;     
		$this->fixConditions();
		//Configure::write('debug',2);
		$loggedTownGid = $this->Session->read('settings.user.town_id');
		//prendi tutti i campi dallo schema tranne il geom
		$townTable = $this->schema_definition('towns');
		$townColumns = array_keys($townTable);
		//$this->components['Paginator']['settings']['fields'] = $townColumns;
		if($this->Session->read('project_id')){
			$shape_table = $this->Town->query("SELECT shape_table FROM projects WHERE id=".$this->Session->read('project_id'))[0][0]['shape_table'];
		}
		$data = $this->paginate();
		//Configure::write('debug',2);
		if(isset($shape_table) AND array_key_exists('submission_geojson',$this->request->query) AND isset($this->request->query['submission_geojson']) AND  $this->request->query['submission_geojson'] != 'false' ){
				//Recupero la chiave primaria(indice spaziale) della shape table e la sua colonna geometrica				
				$shapeTableStructure = $this->schema_definition($shape_table);
				foreach($shapeTableStructure as $key => $val){
					if($val['key'] == 'primary'){
						$shape_table_primary = $key;
					}					
				}
				$shape_table_geometry = Set::extract($this->Town->query("Select f_geometry_column FROM geometry_columns WHERE f_table_name = '".$shape_table."'"),'0.0.f_geometry_column');
				$towns_table_geometry_projection = $this->Town->query("SELECT srid FROM geometry_columns WHERE f_table_name = 'towns'")[0][0]['srid'];
				//Recupero la geometria della submission inserita e la trasformo
				$geojson = $this->request->query['submission_geojson'];
				$proj = $this->Session->read('settings.map.displayProj');
				require APP . 'Vendor' .DS. 'geophp' .DS. 'geoPHP.inc';		
				$geojson = geoPHP::load($geojson,'json');					
				$wkt = $geojson->out('wkt');
				
				//eseguo le query di intersezione (submission -> tema concertazione, output della prima -> towns)
				$wkt_proj = $this->Town->query("SELECT st_astext(st_snaptogrid(st_transform(ST_SetSRID('".$wkt."'::geometry,4326),".$proj."),0.0001));")[0][0]['st_astext'];
				$geometry_type = $this->Town->query("SELECT GeometryType(st_GeomFromText('".$wkt."'))")[0][0]['geometrytype'];
				if($geometry_type == 'POINT'){
					$intersectionGids = Set::extract($this->Town->query("SELECT  t.".$shape_table_primary." FROM ".$shape_table." as t WHERE st_contains(t.".$shape_table_geometry.",st_buffer(st_setSRID('".$wkt_proj."'::geometry,32632), 3))  ;"),'{n}.0.'.$shape_table_primary.'');
				}else{
					$intersectionGids = Set::extract($this->Town->query("SELECT  t.".$shape_table_primary." FROM ".$shape_table." as t WHERE st_overlaps(st_buffer(st_setSRID('".$wkt_proj."'::geometry,32632), 0.5),t.".$shape_table_geometry.") OR st_contains(st_buffer(st_setSRID('".$wkt_proj."'::geometry,32632), 0.5),t.".$shape_table_geometry.")  ;"),'{n}.0.'.$shape_table_primary.'');
				}
				if($intersectionGids){
					$queryGids = join(',',$intersectionGids);
					$townGids = Set::extract($this->Town->query("SELECT DISTINCT t.gid FROM towns as t JOIN town_projects as tp ON tp.town_id = t.gid JOIN ".$shape_table." as s ON st_intersects(st_buffer(st_setSRID(s.".$shape_table_geometry.",32632),10),st_Transform(st_setSRID(t.the_geom,".$towns_table_geometry_projection." ),32632))  WHERE  tp.project_id = ".$this->Session->read('project_id')." AND s.".$shape_table_primary." IN (".$queryGids.");"),'{n}.0.gid');					
				}
		}
		foreach ($data AS $id => $row) {
				unset($row['Town']['the_geom']);
				if(isset($townGids) AND count($townGids)>0){
					if($row['Town']['gid'] == $loggedTownGid){
						unset($data[$id]);
					}else if(!in_array($row['Town']['gid'],$townGids)){		
						if($row['Town']['entity'] != 'Ente'){
							unset($data[$id]);
						}
					}
				}
			}
			$data = array_values($data);
        // send output
        $this->sendRestResponse($data);
    }
	public function townscomboindex() {
		if(!$this->Auth->User('is_admin')){
			$this->sendRestResponse(array(), true, '');
			return;
		}
		$project_id = $this->Session->read('project_id');
		$this->loadModel('TownProject');
		$data = $this->TownProject->find('all',array(
			'conditions' => array(
				'TownProject.project_id' => $project_id)));
		$this->sendRestResponse($data);
	}
	public function add() {
		//Sono un amministratore?
        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }

        if ($this->request->is('post')) {
            // get input
            $data = array('Town' => $this->request->data);
            $success = false;
            // remove null id
            unset($data['Town']['id']);     
                // create new town
                $this->Town->create();
                // try to save the record
                if ($this->Town->save($data)) {
                    // set new ID
                    $data['Town']['id'] = $this->Town->id;
                    $success = true;
                }
                // send response
                $this->set(array(
                    'result' => array('success' => $success, 'data' => $data['Town'], 'msg' => ''),
                    '_serialize' => array('result')
                ));
        }
	}

    /**
     * edit method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
    public function edit($id = null) {
        

            //controllo che non ci sia una mail gia inserita di un altro utente
            if (isset($this->request->data['email']) AND $this->request->data['email'] AND $this->request->data['email']!= "") {
                $checkE = $this->Town->find('all',
                    array('conditions'=>
                        array(
                            'Town.gid <>' => $id,
                            'Town.email' => $this->request->data['email']
                        )
                    )
                );

                //email esistente mando errore e esco
                if (isset($checkE) AND $checkE AND count($checkE)>0 ) {
                    $this->sendRestResponse(array(), false, 'Email già presente nel Database');
                    return;
                }
            }
			
			
		$this->Town->id = $id;	
		if ($this->Town->save($this->request->data)) {
            $message = 'Saved';
			$success = true;
        } else {
            $this->sendRestResponse(array(), false, 'Città già esistente');
            return;
        }

        //recupero il dataset
        $dataSet = $this->Town->find('first',array(
            'conditions'=>array(
                'gid' => $id
            )
        ));


        
		$response = array(
			'success' => $success,
			'data' => $dataSet['Town'],
			'msg' => ''
		);
		
		
		//Rispondo al server
        $this->set(
			array(
				'result' => $response,
				'_serialize' => array('result')
			)
		);
		
		return $success;


    }
	public function delete($id=null){
		 if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }		
        if ($this->Town->delete($id)) {
            $success = true;
			$this->loadModel('TownProject');
			$userprojects = $this->TownProject->find('all',array(
				'conditions' => array(
					'TownProject.town_id' => $id)));
			if($userprojects && count($userprojects)>0){
				$this->TownProject->deleteAll(array('TownProject.town_id' => $id),false);
			}
        } else {
            $success = false;
        }

        $this->sendRestResponse(array());

	}
	//Custom function per ottenere la descrizione delle colonne di una tabella
public function schema_definition($table_name=null,$remove_geom=true){
	if($table_name==null){
	return array();
	}
	$_schema_definition = Set::extract($this->Town->query("SELECT  c.COLUMN_NAME,c.DATA_TYPE as type, c.character_maximum_length as length, c.is_nullable as null
				,CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'primary' ELSE null END AS key
		FROM INFORMATION_SCHEMA.COLUMNS c
		LEFT JOIN (
		SELECT ku.TABLE_CATALOG,ku.TABLE_SCHEMA,ku.TABLE_NAME,ku.COLUMN_NAME
		FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
		INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ku
		ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
		AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
		)   pk 
		ON  c.TABLE_CATALOG = pk.TABLE_CATALOG
		AND c.TABLE_SCHEMA = pk.TABLE_SCHEMA
		AND c.TABLE_NAME = pk.TABLE_NAME
		AND c.COLUMN_NAME = pk.COLUMN_NAME WHERE c.TABLE_NAME = '".$table_name."'
		ORDER BY c.TABLE_SCHEMA,c.TABLE_NAME, c.ORDINAL_POSITION;"),'{n}.0');
	$schema_definition = array();
	foreach($_schema_definition as $index => $info_field){
	if($info_field['column_name']=='the_geom' and $remove_geom){
		continue;
		}	
		$key = $info_field['column_name'];
		if($info_field['key']==null){
		unset($info_field['key']);
		}
		if($info_field['type']=='character varying' or $info_field['type']=='text'){
		$info_field['type'] = 'string';
		}
		$info_field['null'] = ($info_field['null']=='YES') ? true : false;
		unset($info_field['column_name']);
		$schema_definition[$key] = $info_field;
	}
	return $schema_definition;
}

}