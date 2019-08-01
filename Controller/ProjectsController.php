<?php
App::uses('AppController', 'Controller');
App::uses('Folder', 'Utility');
App::uses('File', 'Utility');
/**
 * Projects Controller
 *
 * @property Project $Project
 */
class ProjectsController extends AppController {

    public function index() {
        if (@$this->request->params['ext'] == 'json') {

            // do the query
            $data = $this->paginate();
            // send response
            $this->sendRestResponse($data);
        } else {
            $this->Project->recursive = 0;
            $this->set('projects', $this->Paginator->paginate());
        }
    }
	public function unbindedprojectsindex() {
		if (@$this->request->params['ext'] == 'json') {						
			$this->loadModel('Project');
			$user_info = $this->Project->find('all',array());
			$x = 0;
			for($i=0; $i<count($user_info); $i++) {
					for($y = 0; $y < count($user_info[$i]['UserProject']); $y++) {
					if($user_info[$i]['UserProject'][$y]['user_id'] == $this->params->query['user_id']) {						
						unset($user_info[$i]['Project']);	
					}										
				}
				if($user_info[$i]['Project'] != null) {
					$filteredInfo['Project'][$x] = $user_info[$i]['Project'];
					$x++;
				}
			}
			$success = true;
			$msg = false;
		$this->sendRestResponse($filteredInfo);
		}else{
			$this->Project->recursive = 0;
			$this->set('projects', $this->Paginator->paginate());
		}
			
	}
	public function unbindedtownprojectsindex() {
		if (@$this->request->params['ext'] == 'json') {						
			$this->loadModel('Project');
			$user_info = $this->Project->find('all',array());
			$x = 0;
			for($i=0; $i<count($user_info); $i++) {
					for($y = 0; $y < count($user_info[$i]['TownProject']); $y++) {
					if($user_info[$i]['TownProject'][$y]['town_id'] == $this->params->query['town_id']) {						
						unset($user_info[$i]['Project']);	
					}										
				}
				if($user_info[$i]['Project'] != null) {
					$filteredInfo['Project'][$x] = $user_info[$i]['Project'];
					$x++;
				}
			}
			$success = true;
			$msg = false;
		$this->sendRestResponse($filteredInfo);
		}else{
			$this->Project->recursive = 0;
			$this->set('projects', $this->Paginator->paginate());
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
        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }

        $this->Project->id = $id;
  
        if ($this->Project->save($this->request->data)) {
            $message = 'Saved';
			$success = true;
        } else {
            $this->sendRestResponse(array(), false, 'Progetto già esistente');
            return;
        }

        //recupero il dataset
        $dataSet = $this->Project->find('first',array(
            'conditions'=>array(
                'Project.id' => $id
            )
        ));


        
		$response = array(
			'success' => $success,
			'data' => $dataSet['Project'],
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

    /**
     * add method
     *
     * @return void
     */
    public function add() {
		//Sono un amministratore?
        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
        if ($this->request->is('post')) {
            // get input
            $data = array('Project' => $this->request->data);
            $success = false;
            // remove null id
            unset($data['Project']['id']);
            //check if username exists
       
                // create new project
                $this->Project->create();
                //carico il project model
                $ProjectModel = ClassRegistry::init('Project');
                // try to save the record

                if ($this->Project->save($data)) {
                    // set new ID
                    $data['Project']['id'] = $this->Project->id;
                    $success = true;
                }
                // send response
                $this->set(array(
                    'result' => array('success' => $success, 'data' => $data['Project'], 'msg' => ''),
                    '_serialize' => array('result')
                ));
				//create project directory and default settings file
				
				//Creo la directory per il progetto e quella per gli attachments
				$dir = APP.'Config/Project/'.$data['Project']['id'];
				mkdir($dir,0777);				
				$dirAtt = APP.'attachments/'.$data['Project']['id'];
				mkdir($dirAtt,0777);
				
				$ini_source = APP."Config/Project/settings.ini";				
				$destination = APP.'Config/Project/'.$data['Project']['id'].DS."settings.ini";				
				$res = copy($ini_source,$destination);
				//Do i permessi di scrittura al file appena copiato
				chmod($destination,0777);
				
				
				
        }
    }

    /**
     * delete method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
    public function delete($id = null) {
        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }		
		$myFile = APP.'Config/Project/'.$id.DS."settings.ini";
		if(file_exists($myFile)!==false){
			unlink($myFile) or die ('Impossibile cancellare il file di impostazioni, problema di permessi.');
		}		
		$myDirectory = APP.'Config/Project/'.$id; 
		$myDirectory2 = $this->Session->read('settings.general.uploadPath').DS.$id;		
        if ($this->Project->delete($id)) {
            $success = true;
			//Se c'è la directory del progetto la cancello
			if(file_exists($myDirectory)!==false){
				rmdir($myDirectory); //cartella del progetto
			}
			//Se c'è la directory degli attachments la cancello
			if(file_exists($myDirectory2)!==false){
				rmdir($myDirectory2); //cartella degli attachments
			}

			$this->loadModel('UserProject');
			$userprojects = $this->UserProject->find('all',array(
				'conditions' => array(
					'UserProject.project_id' => $id)));
			if($userprojects && count($userprojects)>0){
				$this->UserProject->deleteAll(array('UserProject.project_id' => $id),false);
			}
			
			$this->loadModel('TownProject');
			$townprojects = $this->TownProject->find('all',array(
				'conditions' => array(
					'TownProject.project_id' => $id)));
			if($townprojects && count($townprojects)>0){
				$this->TownProject->deleteAll(array('TownProject.project_id' => $id),false);
			}
			
			$this->loadModel('OverlayLayer');
			$layers = $this->OverlayLayer->find('all',array(
				'conditions' => array(
					'project_id' => $id)));
			if($layers && count($layers)>0){
				$this->OverlayLayer->deleteAll(array('project_id' => $id),false);
			}
			
			$this->loadModel('Submission');
			$submissions = $this->Submission->find('all',array(
				'conditions' => array(
					'project_id' => $id)));
			if($submissions && count($submissions)>0){
				$db = ConnectionManager::getDataSource('default');
				$db->rawQuery("DELETE FROM submissions WHERE project_id=".$id);
			}
        } else {
            $success = false;
        }

        $this->sendRestResponse(array());

    }
	function addNewShape(){
		$project_id = (integer) $this->request->data['id'];
		$this->autoRender = false;
		//mi ricavo i nomi senza estensione
		foreach($_FILES['shape']['name'] as $key => $val){
			$tokens = explode('.',$val);
			$fileNames[$key]= $tokens[0];
		}
		
		//controllo se sono stati caricati 3 file
		$fileNum = false;
		if(count($fileNames) == 3){
			$fileNum = true;
		}
		if($fileNum){
			//controllo se i nomi sono uguali		
			if(strcmp($fileNames[0], $fileNames[1]) == 0  && strcmp($fileNames[0],$fileNames[2]) == 0 ){
				$equalNames = true;
			}else{
				$equalNames = false;
			}
			if($equalNames){
				//Ricostruisco i file
				$dimMsg = 0;
				foreach($_FILES['shape'] as $key => $val){			
					if($key == 'name'){
						foreach($val as $k => $v){
							$tokens = explode('.',$v);
							$ext = array_pop($tokens);
							//mi salvo l'id del file shp
							if($ext == 'shp'){
								$index = $k;
							}
							$files[$k][$key] = $v;
						}
					}else if($key == 'type'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
						}
					}else if($key == 'tmp_name'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
							$res = move_uploaded_file($files[$k][$key],"/tmp/".$files[$k]['name']);
							chmod("/tmp/".$files[$k]['name'],0777);
						}
					}else if($key == 'error'){
						foreach($val as $k => $v){
							if($v == 1){
								//se ERRORE = 1 il file è troppo grande
								$dimMsg = 'Il file '.$files[$k]['name'].' supera le dimensioni massime permesse dal server.';
							}
							$files[$k][$key] = $v;
						}
					}else if($key == 'size'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
						}
					}
				}
				// se almeno un file è di dimensioni troppo grandi mi fermo
				if($dimMsg == 0){			
					//controllo se sono stati caricati i file corretti
					$shpExt = false;
					$shxExt = false;
					$dbfExt = false;
					foreach($files as $file) {
						$tokens = explode('.',$file['name']);
						$fileExt = array_pop($tokens);
						if($fileExt == 'shp'){
							$shpExt = true;
						}else if ($fileExt == 'shx'){
							$shxExt = true;
						}else if ($fileExt == 'dbf'){
							$dbfExt = true;
						}
					}
					if($shpExt && $shxExt && $dbfExt ){
						//ricavo la proiezione geometrica del progetto
						$myFile = APP.'Config/Project/'.$project_id.DS."settings.ini";
						$settings = parse_ini_file($myFile,true);
						$proj = $settings['map']['displayProj'];
						$rand_val= date('YmdHis');
						$shpFile = $files[$index];
						$exploded = explode('.',$shpFile['name']);
						$nameWithoutExt = $exploded[0];
						//tabella
						$tableName = strtolower($nameWithoutExt).'_'.$rand_val;
						//file sql
						$sqlPath = '/tmp'.DS. strtolower($nameWithoutExt).'_'.$rand_val.'.sql';
						//eseguo lo script
						$content = "/usr/bin/shp2pgsql -s ".$proj." -g the_geom -W \"LATIN1\" ".DS.'tmp/'.$shpFile['name']." public.".$tableName." > ".$sqlPath;		
						exec($content, $output, $res);
						//ottengo la query generata nel file sql dallo script
						$query = file_get_contents($sqlPath);
						$dbConf = ConnectionManager::getDataSource('default')->config;
						//eseguo la query
						$dbi = pg_connect('host='.$dbConf['host'].' port='.$dbConf['port'].' dbname='.$dbConf['database'].' user='.$dbConf['login'].' password='.$dbConf['password']);
						$res = pg_query($dbi,$query);
						$success = ($res === FALSE) ? false : true;
						
						if($success){
							//controllo se la geometria inserita è di tipo POLYGON o MULTIPOLYGON, se non lo è elimino la tabella
							$table = $this->Project->query("SELECT * FROM geometry_columns WHERE f_table_name = '".$tableName."'");
							if($table[0][0]['type'] != 'MULTIPOLYGON' && $table[0][0]['type'] != 'POLYGON'){
								$db = ConnectionManager::getDataSource('default');
								$db->rawQuery('DROP TABLE '. $table_name);
								$success = false;								
								$msg = 'File shape non valido. Sono accettati solo shape poligonali e multi-poligonali.';
							}else{
								$this->Project->id = $project_id;
								$this->Project->saveField('shape_table',$tableName);
								$msg = 'Shape caricata correttamente!';
							}
						}else{
							$msg = 'Impossibile caricare il file di shape. Riprovare più tardi.';
						}
						echo json_encode(array(				
							'success' => $success,
							'data' => $tableName,
							'msgError' => $msg
						));
					}else{
						//errore mancanza file
						$msg = 'Mancano i seguenti file: ';
						if(!$shpExt && $shxExt && $dbfExt){
							$msg .='SHP';
						}else if(!$shpExt && !$shxExt && $dbfExt){
							$msg .='SHP,SHX';
						}else if(!$shpExt && !$shxExt && !$dbfExt){
							$msg .='SHP,SHX,DBF';
						}else if(!$shpExt && $shxExt && !$dbfExt){
							$msg .='SHP,DBF';
						}else if($shpExt && $shxExt && !$dbfExt){
							$msg .='SHX,DBF';
						}
						echo json_encode(array(
							'success' => false,
							'data' => '',
							'msgError' => $msg
						));
					}
					
				}else{
						//Errore dimensione file
						echo json_encode(array(				
						'success' => false,
						'data' => '',
						'msgError' => $dimMsg
					));
				}
			}else{
				//errore nome file
				 echo json_encode(array(
					'success' => false,
					'data' => '',
					'msgError' => "Attenzione! Il nome dei file deve essere uguale!"
				));
			}
		}else{
			//errore numero file
			echo json_encode(array(
				'success' => false,
				'data' => '',
				'msgError' => "Attenzione! I file devono essere 3! SHP, SHX e DBF"
			));
		}
	}
	public function deleteShape(){
		//Configure::write('debug',2);
	   if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$data = array();
		$params = $this->params->data;
        $id = $params['id'];
		$table_name = $params['table_name'];
		if($table_name == ''){
			$this->sendJsonResponse(array(),false,'Nessun shape da eliminare.');
			return;
		}
		$this->Project->id = $id;
		if($this->Project->saveField('shape_table', null)){
			$success = true;
			$msgError = '';
			$db = ConnectionManager::getDataSource('default');
			$db->rawQuery('DROP TABLE '. $table_name);
			$data['shape_table'] = '';
		}else{
			$success = false;
			$msgError = 'Errore del server';
		}
		
		$this->sendJsonResponse(array(),$success,$msgError);
	}
}