<?php
App::uses('AppController', 'Controller');
/**
 * Submissions Controller
 *
 * @property Configuration $Coniguration
 */
class SubmissionsController extends AppController {

    /**
     * Components
     *
     * @var array
     */
    public $components = array(
        'RequestHandler',
		'Zip',
        'Paginator' => array('className' => 'RestPaginator')
    );

    /**
     * everyone can load login configuration
     */
    public function beforeFilter() {
        parent::beforeFilter();
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
     * Fix client passed conditions
     */
    private function fixConditions() {
        // get request type (GET or POST)
        $reqType = ($this->request->is('post')) ? 'data' : 'query';
        // get conditions
		$conditions = (array_key_exists('conditions', $this->request->{$reqType}) ? json_decode($this->request->{$reqType}['conditions']) : array());
        // loop over conditions (and overwrite)

        $fixedConditions = array();
        // remove province condition
        $addProvinceFilter = true;
        // loop over passed conditions
        foreach ($conditions AS $condition) {
            switch ($condition->property) {
                case 'town_id':
                    $addProvinceFilter = false;
                default:
                    $fixedConditions[] = $condition;
                    break;
            }
        }
        if ($addProvinceFilter) {
            $fixedConditions[] = array(
                'property' => 'is_owner',
                'value' => true
            );
        }
        // encode
        $encodedConditions = json_encode($fixedConditions);
        // save to session
        $this->Session->write('lastConditions', $encodedConditions);
        // reassign modified conditions
        $this->request->{$reqType}['conditions'] = $encodedConditions;
    }

    /**
     * index method
     *
     * @return void
     */
    public function index() {
		$project_id = $this->Session->read('project_id');
        /*
         * recupero submissions (se ho filtro su comune) di un comune (quelle che ha proposto + quelle proposte da altri
        SELECT * FROM (
            SELECT 't'::boolean AS owned, * FROM submissions
            WHERE town_id = 1
            UNION
            SELECT 'f'::boolean, * FROM submissions
            WHERE id IN (SELECT submission_id FROM opinions WHERE town_id = 1 AND last = 't')
        ) AS foo
        --WHERE owned = 't' (per quelle sottoposte dal comune 1)
         */
        $uploadPath = $this->Session->read('settings.general.uploadPath').DS.$project_id;
        $sessionPath = $uploadPath.DS.'tmp'.DS.session_id().DS;

        // require lib
        require APP . 'Vendor' .DS. 'geophp' .DS. 'geoPHP.inc';
        // fix conditions
        $this->fixConditions();
        // do the query
        $data = $this->paginate();
			foreach($data as $key => $val){
			if($val['Submission']['project_id'] != $project_id){
				unset($data[$key]);
				}
			}
        // create geojson
        $geojson = array();
        foreach ($data AS $row) {
            switch ($row['Submission']['geom_type']) {
                case 'Point':
                    $wkt = geoPHP::load($row['Submission']['point_wkt']);
                    break;
                case 'LineString':
                    $wkt = geoPHP::load($row['Submission']['line_wkt']);
                    break;
                case 'Polygon':
					//Configure::write('debug',2);
                    $wkt = geoPHP::load($row['Submission']['poly_wkt']);
                    break;
            }
            // unset unused fields
            unset($row['Submission']['point_wkt']);
            unset($row['Submission']['line_wkt']);
            unset($row['Submission']['poly_wkt']);
            // remove province note (if not province)
            if ($this->Auth->User('town_id') > 0) {
                unset($row['Submission']['province_note']);
            }
            // to geojson
            $feature = json_decode($wkt->out('json'));
		
            // add properties
            $feature = array_merge((array)$feature, array('properties' => $row['Submission']));
            // add to output array
            $geojson[] = $feature;
        }
        // $this->set('_serialize', array('submissions'));
        $this->set(array(
            'result' => array(
                'success' => true,
                'data' => $geojson,
                'count' => count($geojson),
                'error' => '',
                'ts' => time()
            ),
            '_serialize' => 'result'
        ));
        /*
        die();

        // Polygon WKT example
        $polygon = geoPHP::load('POLYGON((1 1,5 1,5 5,1 5,1 1),(2 2,2 3,3 3,3 2,2 2))','wkt');
        echo $polygon->out('json');
        die();

        $data = array(
            array(
                "type" => "Feature",
                "geometry" => array(
                    "type" => "Point",
                    "coordinates" => array(8.987503051757812, 45.50899355954858)
                ),
                'properties' => array(
                    'id' => 1,
                    'town_name' => 'Fossalta di Piave',
                    'town_id' => 5,
                    'status' => 1,
                    'created' => '2015-02-02 12:00:00'
                )
            ),
            array(
                "type" => "Feature",
                "geometry" => array(
                    "type" => "Point",
                    "coordinates" => array(9.125518798828125, 45.368307974372875)
                ),
                'properties' => array(
                    'id' => 2,
                    'town_name' => 'Meolo',
                    'town_id' => 5,
                    'status' => 2,
                    'created' => '2015-12-02 12:00:00'
                )
            ),
            array(
                "type" => "Feature",
                "geometry" => array(
                    "type" => "Point",
                    "coordinates" => array(9.259414672851562, 45.54026282479539)
                ),
                'properties' => array(
                    'id' => 3,
                    'town_name' => 'San Dona di Piave',
                    'town_id' => 1,
                    'status' => 3,
                    'created' => '2015-02-22 12:00:00'
                )
            ),
            array(
                "type" => "Feature",
                "geometry" => array(
                    "type" => "LineString",
                    "coordinates" => array(
                        array(9.359414672851562, 45.54026282479539),
                        array(9.459414672851562, 45.64026282479539),
                        array(9.159414672851562, 45.74026282479539)
                    )
                ),
                'properties' => array(
                    'id' => 4,
                    'town_name' => 'Padova',
                    'town_id' => 1,
                    'status' => 3,
                    'created' => '2015-03-22 12:00:00'
                )
            ),
            array(
                "type" => "Feature",
                "geometry" => array(
                    "type" => "Polygon",
                    "coordinates" => array(
                        array(
                            array(9.125518798828125, 45.368307974372875),
                            array(9.225518798828125, 45.468307974372875),
                            array(9.425518798828125, 45.268307974372875),
                            array(9.125518798828125, 45.368307974372875)
                        )
                    )
                ),
                'properties' => array(
                    'id' => 5,
                    'town_name' => 'Losson',
                    'town_id' => 3,
                    'status' => 2,
                    'created' => '2015-12-07 12:00:00'
                )
            ),
        );
        // $this->set('_serialize', array('submissions'));
        $this->set(array(
            'result' => array(
                'success' => true,
                'data' => $data,
                'count' => count($data),
                'error' => '',
                'ts' => time()
            ),
            '_serialize' => 'result'
        ));
        */
    }

    // TODO: sviluppare parte CSV
    public function export() {
        // pr($this->request->params['ext']);die();
        // get request type (GET or POST)
        $reqType = ($this->request->is('post')) ? 'data' : 'query';
        $this->request->{$reqType}['rest'] = 1;
		$project_id = $this->Session->read('project_id');
        // set header array
		$this->loadModel('Project');
		$project = $this->Project->find('first',array(
			'conditions' => array(
				'id' => $project_id)));
		$project_name = $project['Project']['name'];
        $header = array(
            'id' => 'ID',
            'created' => 'Data',
            'from_town_name' => 'Comune Proponente',
            'description' => 'Note',
            'opinions_needed' => 'Pareri richiesti',
            'opinions_given' => 'Pareri ottenuti',
            'opinions_status' => 'Stato',
            'geom_type' => 'WKT-TYPE',
            'point_wkt' => 'POINT-WKT',
            'line_wkt' => 'LINE-WKT',
            'poly_wkt' => 'POLY-WKT'
        );

        // set (session) last used conditions
        if ($this->Session->check('lastConditions')) {
            $this->request->{$reqType}['conditions'] = $this->Session->read('lastConditions');
        }
        // $this->fixConditions();

        // remove limit and page param
        $this->request->{$reqType}['limit'] = PHP_INT_MAX;
        $this->request->{$reqType}['page'] = null;
        // get data
        $this->Paginator->settings['fields'] = array_keys($header);
        $data = $this->paginate();

        // add towns
        $OpinionModel = ClassRegistry::init('Opinion');
        foreach ($data AS &$row) {
            $towns = $OpinionModel->find('all', array(
                'fields' => array('town_name'),
                'conditions' => array(
                    'submission_id' => $row['Submission']['id'],
                    'last' => true
                ),
                'order' => array('town_name')
            ));
            if ($towns AND count($towns) > 0) {
                $row['Submission']['towns'] = implode(', ', Set::extract($towns, '{n}.Opinion.town_name'));
            } else {
                $row['Submission']['towns'] = "Nessuno";
            }
            // transcode status
            switch ($row['Submission']['opinions_status']) {
                case 1:
                    $row['Submission']['opinions_status'] = 'In discussione';
                    break;
                case 2:
                    $row['Submission']['opinions_status'] = 'Mancato accordo';
                    break;
                case 3:
                    $row['Submission']['opinions_status'] = 'Accordo';
                    break;
            }
						$row['Submission']['project_name'] = $project_name;
        }
        // add to header array
        $header['towns'] = 'Comuni coinvolti';
		$header['project_name'] = 'Progetto';
        // send to the view
        $this->set('header', $header);
        $this->set('data', $data);
    }

    /*
     * salvataggio nuova submission compresi allegati e opinions
     */
    public function save() {
        $data = array();

        //carico il submission model
        $SubmissionModel = ClassRegistry::init('Submission');
		$project_id = $this->Session->read('project_id');
        $params = $this->params->data;
        //controllo se ho tutti i dati
        if ( isset($params['geojson']) AND isset($params['description']) AND $params['description'] != "" ) {
            //recupero il type
            $geometryType = $params['geojson']['geometry']['type'];
            //recupero la description
            $description = $params['description'];
            //recupero il wkt della feature
            require APP . 'Vendor' .DS. 'geophp' .DS. 'geoPHP.inc';
            $geojson = geoPHP::load(json_encode($params['geojson']['geometry']),'json');			
            // convert
            $wkt = $geojson->out('wkt');			
            //trovo il campo geometrico da popolare
            if ($geometryType == 'Point') {
                $geoField = 'point_geom';
            }
            else if ($geometryType == 'LineString'){
                $geoField = 'line_geom';
            }else if ($geometryType == 'Polygon'){
				$geoField = 'poly_geom';
			}
            $displayProj =  $this->Session->read('settings.map.displayProj');
            //trovo la geometria
            $the_geom = 'st_transform( st_geomfromtext(\''.$wkt.'\', 4326), '.$displayProj.') as geom';
            //recupero il wkb con il cambio di proiezione
            $resGeometry = $this->Submission->query('SELECT '.$the_geom);
            $geom = $resGeometry[0][0]['geom'];

            $town_id = $this->Auth->user('town_id');
            $user_id = $this->Auth->user('id');
            $opinions_status = 1;
            $opinions_given = 0;
            $opinions_needed = count($params['towns']);


            //salvo la submission
            $this->Submission->setSource('submissions');

            $arrToSave = array('Submission' =>
                array(
                    'id' => false,
                    $geoField => $geom,
                    'town_id' => $town_id,
                    'user_id' => $user_id,
					'project_id' => $project_id,
                    'geom_type' => $geometryType,
                    'opinions_status' => $opinions_status,
                    'opinions_given' => $opinions_given,
                    'opinions_needed' => $opinions_needed,
                    'description' => $description
                ));

            $submissionData = $this->Submission->save($arrToSave);
            //recupero l'ultimo id

            $submission_id = $submissionData['Submission']['id'];

            //carico opinion model
            $OpinionModel = ClassRegistry::init('Opinion');
            //salvo la submission
            $OpinionModel->setSource('opinions');

            //ciclo su ogni comune selezionato e per ognuno inserisco un'opinione
            if (isset($params['towns']) AND count($params['towns']) > 0) {
                foreach ($params['towns'] as $t_id) {
                    $arrToSave = array(
                      'Opinion' => array(
                          'id' => false,
                          'submission_id' => $submission_id,
                          'town_id' => $t_id,
                          'user_id' => 0,
                          'opinion' => 0,
                          'last' => true
                      )
                    );

                    $OpinionModel->save($arrToSave);
                }
            }

            //inserisco gli allegati
            //recupero gli allegati presenti
            $attachmentsLoaded = json_decode($this->request->data['attachmentsLoaded']);
            if (isset($attachmentsLoaded) AND count($attachmentsLoaded)>0) { //se presenti precedenti allaegati
                //carico attachment model
                $AttachmentModel = ClassRegistry::init('Attachment');

                App::uses('Folder', 'Utility');
                App::uses('File', 'Utility');

                //sposto il file
                $uploadPath = $this->Session->read('settings.general.uploadPath').DS.$project_id;
                foreach($attachmentsLoaded as $aL){
                    $filePath = $uploadPath.DS.'tmp'.DS.session_id().DS.$aL->name;
                    //creo se non presente il nuovo path del file
                    $fileNewPath = $uploadPath.DS.$submission_id.DS;
                    if (!file_exists($fileNewPath)) {
                        mkdir($fileNewPath);
                    }

                    $fileNewPath = $fileNewPath.$aL->name;

                    //sposto il file dentro la nuova cartella
                    if (file_exists($filePath)) {
                        rename($filePath,$fileNewPath);
                    }

                    //salvo nel db
                    $arrToSave = array(
                        'Attachment' => array(
                            'id' => false,
                            'type' => strtolower($aL->type),
                            'name' => $aL->name,
                            'submission_id' => $submission_id,
                            'label' => $aL->label,
							'project_id' => $project_id
                        )
                    );
                    $AttachmentModel->save($arrToSave);
                }//fine foreach

                //cancello tutti file all'interno della cartella di sessione
                $sessionPath = $uploadPath.DS.'tmp'.DS.session_id().DS;

                $f = new Folder($sessionPath);
                $f->delete();

                //cancello tutte le cartelle temporanee che sono la da più di un giorno
                $this->deleteOldTmpfolder();

            }

            $success = true;
            $msgError = false;
        }
        else {
            $success = false;
            $msgError = 'Errore del server, riprovare!';
        }


        //MANDO LE EMAIL NECESSARIE DI NOTIFICA
       $emailDataToSend = array(
            'description' => $description,
            'from_town_name' => $this->Auth->user('town_name')
        );

        $this->sendNotificationMail($params['towns'],$emailDataToSend);

        //mando la risposta al server
        $this->sendJsonResponse($data,$success,$msgError);

    }
	public function export_shapes() {
		//Configure::write('debug',0);
		$type = $this->params['data']['type'];
		//get export view
		$rand = date('YmdHis');
		
		if($type == 'point'){
			$exportTable = 'export_submission_points';
			$table_name = 'points_shape_'.$rand;
		}else if($type == 'line'){
			$exportTable = 'export_submission_linestrings';
			$table_name = 'lines_shape_'.$rand;
		}else if($type == 'polygon'){
			$exportTable = 'export_submission_polygons';
			$table_name = 'polygons_shape_'.$rand;
		}
		
		$definedVar = get_defined_constants();
		$project_id = $this->Session->read('project_id');
		$town_id = $this->Auth->user('town_id');
		$schemadefinition = $this->schema_definition('export_submission_points', false);
		$tableKeys = array_diff(array_keys($schemadefinition), array('town_id','project_id', 'gid','the_geom'));
		$implodedKeys = implode(',',$tableKeys);
		//if admin just filter for project
		if($town_id == 0){
			$submissions = $this->Submission->query("SELECT ".$implodedKeys.",st_asText(the_geom) as the_geom FROM ".$exportTable." WHERE project_id = ".$project_id."");
		}else{
			$submissions = $this->Submission->query("SELECT ".$implodedKeys.",st_asText(the_geom) as the_geom FROM ".$exportTable." WHERE project_id = ".$project_id." AND town_id = ".$town_id."");
		}
		
		if(isset($submissions) && count($submissions) > 0){
			$submissions = Set::extract( $submissions,'{n}.0');
			$i = 0;
			$queries = array();
			$values = array();
			//format data and build queries
			foreach($submissions as $k => $v){
				unset($submissions[$k]['project_id']);
				unset($submissions[$k]['town_id']);
				unset($submissions[$k]['gid']);
				foreach($v as $chiave => $valore){
					if($chiave != 'the_geom'){
						if(is_string($valore)){
							$valore = "'".$valore."'";
							$values[] = $valore;
						}else if(!isset($valore)){
							$values[] = "null";
						}else{
							$values[] = $valore;
						}
					}else if ($chiave == 'the_geom'){
						$geom = $valore;
					}
				}
				$explodedValues = implode(',',$values);
				$query = "INSERT INTO ".$table_name."(".$implodedKeys.") VALUES(".$explodedValues.")";
				$geomQuery = "UPDATE ".$table_name." SET the_geom = st_GeomFromText('".$geom."')";
				array_push($queries,$query);
				array_push($queries,$geomQuery);
				$values = array();
			}
			//create table
			$createQuery[0] = "SELECT * INTO ".$table_name." FROM ".$exportTable."  WHERE 1=0";
			$createQuery[1] = "ALTER TABLE ".$table_name." DROP COLUMN gid";
			$createQuery[2] = "ALTER TABLE ".$table_name." DROP COLUMN town_id";
			$createQuery[3] = "ALTER TABLE ".$table_name." DROP COLUMN project_id";
			$createQuery[4] = "ALTER TABLE ".$table_name." ADD COLUMN id serial";
			$createQuery[5] = "ALTER TABLE ".$table_name." ADD PRIMARY KEY(id)";
			foreach($createQuery as $query){
				$this->Submission->query($query);
			}
			foreach($queries as $query){
				$this->Submission->query($query);
			}
			//shp export
			$shp_folder = realpath('../../tmp');
			$config = ConnectionManager::getDataSource('default')->config;
			$options = "";
			$options .= '-f '.$shp_folder.'/'.$table_name.'.shp ';
			$options .= "-h ".$config['host']." ";
			$options .= "-u ".$config['login']." ";
			$options .= "-P ".$config['password']." ";
			$options .= ' '.$config['database'];
			$options .= ' '.$table_name;
			$cmd = '/usr/bin/pgsql2shp ';
			exec($cmd.$options, $return);
			$files = array(
				"/tmp/".$table_name.".shp" => $table_name.".shp",
				"/tmp/".$table_name.".shx" => $table_name.".shx",
				"/tmp/".$table_name.".dbf" => $table_name.".dbf",
				"/tmp/".$table_name.".cpg" => $table_name.".cpg"
			);
			$zipname = $shp_folder.DS.$table_name.'.zip';
			$zip = new ZipArchive();
			$zip->open($zipname, ZipArchive::CREATE);
			foreach ($files as $file_path => $file_name) {
				$zip->addFile($file_path,$file_name);
			}	
			//build zip
			$zip->close();
			$this->Submission->query("DROP TABLE ".$table_name."");
			$fileUrl= $definedVar['FULL_BASE_URL'].$zipname;
			$this->sendJsonResponse($fileUrl,true,'');			
		}else{
			$this->sendJsonResponse(array(),false,'Nessuna osservazione da esportare');	
		
		}
	}
    public function updatePronviceNote() {
        // get input
        $input = $this->request->data;
        // try to save
        if (array_key_exists('id', $input) AND array_key_exists('province_note', $input) AND !empty($input['id']) AND !empty($input['province_note'])) {
            // set source
            $this->Submission->setSource('submissions');
            // set ID
            $this->Submission->id = $input['id'];
            // save the note
            if ($this->Submission->saveField('province_note', $input['province_note'])) {
                // send fault response
                $this->sendJsonResponse(array(), true);
            }
        }
        // send fault response
        $this->sendJsonResponse(array(), false);
    }
	public function delete(){
		 if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$params = $this->params->data;
        $id = $params['id'];
		$this->Submission->setSource('submissions');
		if($this->Submission->delete($id)){
			$success = true;
			$msgError = '';
			$db = ConnectionManager::getDataSource('default');
			$db->rawQuery("DELETE FROM opinions WHERE submission_id=".$id);
		}else{
			$success = false;
			$msgError = 'Errore del server.';
		}
		$this->sendJsonResponse($data,$success,$msgError);
	}



    /**
     * send a mail to provincia and all involved towns
     */
    private function sendNotificationMail($townIds,$submissionData) {

        //load xtemplate class
        require_once ROOT . DS. APP_DIR . DS.'Vendor'.DS.'xtpl'.DS.'xtemplate.class.php';

        //array che contiene le email a cui inviare
        $emailUsers = array();
        $emailUsersCC = array();
        $emailUsersCCn = array();

        //carico user model
        $userModel = ClassRegistry::init('User');

        //carico town model
        $townModel = ClassRegistry::init('Town');

        $MAILCONF = $this->Session->read('settings.mail');

        //recupero tutti gli utenti coinvolti che sono: utenti dei coumuni coinvolti e la provincia
        //mando email alle provincie e poi ai comuni se presente email nella tabella email
        //recupero le provincie
        $provinciaData = $userModel->find('all',array(
            'conditions' => array(
                'User.town_id' => 0
            )
         ));



        //inserisco tutte le mail delle provincie compreso superadmin
        foreach ($provinciaData as $pData) {
            $provinciaMail = $pData['User']['email'];
            //inserisco sempre email della provincia
            if ($pData['User']['username'] != "superadmin") { //distinguo il superadmin che va in ccn dagli altri che vanno in cc
                $emailUsersCC[$provinciaMail] = $pData['User']['town_name'];
            }
            else {
                $emailUsersCCn[$provinciaMail] = $pData['User']['town_name'];
            }
        }

        //recupero i records dei comuni coinvolti
        $townsData = $townModel->find('all',array(
            'conditions' => array(
                'Town.gid' => $townIds
            )
        ));

        $townNoMail = array();
        $tplInvolvedTowns = array();

        //se ho comuni coinvolti
        if (count($townsData) > 0) {
            //ciclo e controllo che tutti abbiano la mail e recupero la stringa per il body del messaggio dei comuni coinvolti
            foreach ($townsData as $tD) {
                if ($tD['Town']['email'] != "") {
                    $emailUsers[$tD['Town']['email']] = 'Comune di '.strtoupper($tD['Town']['name']); //inserisco la mail tra i destinatari
					$townNoMail[] = $tD['Town']['gid'];
                }
                else { //devo trovare tutti gli utenti di quel comune
                    $townNoMail[] = $tD['Town']['gid'];
                }

                $tplInvolvedTowns[] = $tD['Town']['name'];

            }
        }

        //trovo tutte le mail degli utenti associate ai comuni senza mail
        if (count($townNoMail)>0) {
            //recupero gli utenti dei comuni coinvolti
            $userTownsData = $userModel->find('all',array(
                'conditions' => array(
                    'User.town_id' => $townNoMail
                )
            ));
        }
        else { //tutti i comuni hanno mail comunale
            $userTownsData = array();
        }

        //se ci sono email da comuni coinvolti che non hanno mail comunale
        if (count($userTownsData)>0){
            //ciclo e recupero le email
            foreach ($userTownsData as $uTD) {
                $emailUsers[$uTD['User']['email']] = $uTD['User']['surname']." ".$uTD['User']['name'].", Comune di ".strtoupper($uTD['User']['town_name']);
            }
        }


        //controllo mail
        //spedisco


        //recupero l'oggetto
        if (isset($MAILCONF['subject.newSubmission']) AND  $MAILCONF['subject.newSubmission'] != "") {
            $subject = $MAILCONF['subject.newSubmission'];
        }
        else {
            $subject  = "SI.C.L.A.: Inserimento nuova osservazione";
        }


        $bodyMessage = "<p>&Egrave; stata inserita una nuova osservazione in data ".date("d-m-Y")." alle ore ".date('H:i:s')." con i seguenti dati:</p>";
        $bodyMessage .= "Comune proponente: ".$submissionData['from_town_name']."<br>";
        $bodyMessage .= "Comuni coinvolti: ".implode(",",$tplInvolvedTowns)."<br>";
        $bodyMessage .= "Descrizione: ".$submissionData['description']."<br>";

        //from email
        $emailFromToken = explode("#",$MAILCONF['notification.from']);

        $from = array($emailFromToken[0]=>$emailFromToken[1]);


        //setto il template
        $tpl = new XTemplate(ROOT.DS.APP_DIR.DS.'Config'.DS.'mailTemplate'.DS.'mail.html');
        //assegno i dati al template
        $tpl->assign('mainTitle','SI.C.L.A.: inserimento di una nuova osservazione');

        //find pathurl
        App::uses('HtmlHelper', 'View/Helper');
        $html = new HtmlHelper(new View());

        //$imgHeaderPath = str_replace("submissions/save","",$html->url(null,true)).'/resources/login/header.png';
		$imgHeaderPath = "http://geodbt.cittametropolitana.mi.it/apps/temporary_headeremail/header_long.jpg"; //provvisorio causa mancanza di permessi per accedere all'header
        $tpl->assign('headerPath',$imgHeaderPath);

        //assegno l'url dell applicazione
        $appUrl = str_replace("submissions/save","",$html->url(null,true));
        $tpl->assign('appUrl',$appUrl);

        //assegno i dati al template
        $tpl->assign('bodyMessage',$bodyMessage);

        $tpl->parse('main');

        $emailMessage = $tpl->text('main');

        $emailParams = array(
            'subject' => $subject,
            'emailMessage' => $emailMessage,
            'to' => $emailUsers,
            'cc' => $emailUsersCC,
            'ccn' => $emailUsersCCn,
            'from' => $from
        );

        //invio la mail
        $this->sendEmail($emailParams,$MAILCONF);

    }

    public function testemail() {

        $towns = array();

        App::uses('HtmlHelper', 'View/Helper');
        $html = new HtmlHelper(new View());

        echo $html->url(null,true);



        die();

        $data['description'] = 'vediamo se va, ho cambiatotutto';
        $data['from_town_name'] = 'Casarile';

        $this->sendNotificationMail($towns,$data);

    }

    public function random() {
        $southwest = array(45.1066689276312, 8.58941813299552);
        $northeast = array(45.7969636033166, 9.6682184955477);

        $lngSpan = $northeast[1] - $southwest[1];
		$latSpan = $northeast[0] - $southwest[0];


        for ($i=1; $i<=300; $i++) {
            $lat = (float)$southwest[0] + ((float)$latSpan * (float)rand()/(float)getrandmax());
            $lng = (float)$southwest[1] + ($lngSpan * (float)rand()/(float)getrandmax());
            $needed = rand(1,3);
            $sql = "INSERT INTO submissions
                    (town_id,
                    user_id,
                    active,
                    description,
                    geom_type,
                    opinions_needed,
                    opinions_given,
                    opinions_status,
                    point_geom,
                    created)
                    VALUES
                    (
                    ".rand(1,189).",
                    ".rand(1,3).",
                    1,
                    'Random record n.".$i."',
                    'Point',
                    ".$needed.",
                    ".rand(0, $needed).",
                    ".rand(1,3).",
                    st_transform( st_geomfromtext('POINT($lng $lat)', 4326) , 32632),
                    '2015-03-13 12:00:00'
                    );";
            $this->Submission->query($sql);
        }
    }
		public function schema_definition($table_name=null,$remove_geom=true){
		if($table_name==null){
		return array();
		}
		$_schema_definition = Set::extract($this->Submission->query("SELECT  c.COLUMN_NAME,c.DATA_TYPE as type, c.character_maximum_length as length, c.is_nullable as null
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