<?php
App::uses('AppController', 'Controller');
/**
 * BaselayersController Controller
 *
 * @property Baselayer $Baselayer
 */
class BaselayersController extends AppController {

    public function index() {
		if (@$this->request->params['ext'] == 'json') {
			$project_configuration = $this->Baselayer->find('all',array(
				'conditions' => array(
					'project_id' => $this->params->query['admin_params']
					)
				));			
			if(count($project_configuration)>0){
				$record = $project_configuration[0]['Baselayer'];
				$Layers = json_decode($record['layers_configurations'],true);
				$BaseLayers = $Layers['Baselayers'];
				$this->set(array(
					'result' => array(
						'success' => true,
						'data' => $BaseLayers,
						'count' => count($BaseLayers),
						'error' => false,
						'ts' => time()
					),
					'_serialize' => 'result'
				));
			}else{
				$this->set(array(
					'result' => array(
						'success' => true,
						'data' => null,
						'count' => 0,
						'error' => false,
						'ts' => time()
					),
					'_serialize' => 'result'
				));
			}
		} else {
            die('index');
        }		
	}
	
	/**
     * edit method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
	public function edit($id=null) {
		$project_id = $this->params->query['admin_params'];
		if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$project_configuration = $this->Baselayer->find('all',array(
				'conditions' => array(
					'project_id' => $project_id
					)
				));			
		$tableId = $project_configuration[0]['Baselayer']['id'];
		
		$layers_configurations = json_decode($project_configuration[0]['Baselayer']['layers_configurations'],true);
		$baseLayers = $layers_configurations['Baselayers'];
		
		$editedData = $this->request->data;
		foreach($baseLayers as $key => $val){
			if($val['id'] == $id){
				$layerToModify = $val;
			}
		}
		foreach($layerToModify as $key => $val) {
			if(array_key_exists($key, $editedData)){
				$modifiedLayer[$key] = $editedData[$key];
			}else{
				$modifiedLayer[$key] = $val;
			}
		}
		
		//Controllo se ho openstreetmap
		if($modifiedLayer['type'] == 'osm'){
			//Se lo zoom è minore o uguale a 8 lo porto al massimo
			if($modifiedLayer['options_maxZoom']<=8){
				$modifiedLayer['options_maxZoom'] = 18;
			}
		}

		foreach($baseLayers as $key => $val){
			if($val['id'] == $id){
				$baseLayers[$key] = $modifiedLayer;
			}
		}

		
		$layers_configurations['Baselayers'] = $baseLayers;
		$this->Baselayer->id = $tableId;
		$layers_configuration['Baselayers'] = $baseLayers;
		$dataToSave['Baselayer']['project_id'] = $project_id;
		$dataToSave['Baselayer']['layers_configurations'] = json_encode($layers_configurations); 
			if ($this->Baselayer->save($dataToSave)) {
			// set new ID
			$dataToSave['Baselayer']['id'] = $this->Baselayer->id;
			$success = true;	
		}
		
		$this->set(array(
            'result' => array('success' => $success, 'data' => $dataToSave, 'msg' => ''),
            '_serialize' => array('result')
        ));	
	}
	
	
	//Funzione che salva la configurazione dei layers
	  /**
     * add method
     *
     * @return void
     */
	public function add(){	

		if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$data = array('Baselayer' => $this->request->data);		
		unset($data['Baselayer']['id']);
		unset($data['Baselayer']['created']);
		unset($data['Baselayer']['modified']);	
		$project_id = $this->params->query['admin_params'];
		//Verifico se è già presente un record per il mio progetto
		$project_configuration = $this->Baselayer->find('first',array(
			'conditions' => array(
				'project_id' => $project_id
			),
		));
		$id = $project_configuration['Baselayer']['id'];

		//Controllo se ho openstreetmap
		if($data['Baselayer']['type'] == 'osm'){
			//Se lo zoom è minore o uguale a 8 lo porto al massimo
			if($data['Baselayer']['options_maxZoom']<=8){
				$data['Baselayer']['options_maxZoom'] = 18;
			}
		}
		
		if($id!==null){
			//modifico il record esistente
			$this->Baselayer->id = $id;
			//prendo layers_configurations
			$layers_configurations = json_decode($project_configuration['Baselayer']['layers_configurations'],true);
			array_push($layers_configurations['Baselayers'], $data['Baselayer']);
			
		}else{
			//ne creo uno nuovo (non ho la configurazione dei layers
			$this->Baselayer->create();
			//Creo la configurazione
			$layers_configurations = array(
				'Overlaylayers' => array(),
				'Baselayers' => array(),
			);
			array_push($layers_configurations['Baselayers'], $data['Baselayer']);
			
		}
		for($i=0; $i<(count($layers_configurations['Baselayers'])); $i++) {
			$layers_configurations['Baselayers'][$i]['id'] = $i;
		}
		$BaseLayerModel = ClassRegistry::init('Baselayer');
		$dataToSave['Baselayer']['project_id'] = $project_id;
		$dataToSave['Baselayer']['layers_configurations'] = json_encode($layers_configurations);
		//Save data
		if ($this->Baselayer->save($dataToSave)) {
			// set new ID
			$dataToSave['Baselayer']['id'] = $this->Baselayer->id;
			$success = true;
		}				
		$this->set(array(
            'result' => array('success' => $success, 'data' => $dataToSave, 'msg' => ''),
            '_serialize' => array('result')
        ));				
	}
	

	/**
     * delete method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
	public function delete($id=null) {
		
		if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$project_configuration = $this->Baselayer->find('all',array(
				'conditions' => array(
					'project_id' => $this->params->query['admin_params']
					)
				));			
		$tableId = $project_configuration[0]['Baselayer']['id'];
		$this->Baselayer->id = $tableId;
		$layers_configuration = json_decode($project_configuration[0]['Baselayer']['layers_configurations'],true);
		$baseLayers = $layers_configuration['Baselayers'];
		foreach($baseLayers as $key => $val) {
			if($val['id'] == $id){
				unset($baseLayers[$key]);
			}
		}
		$baseLayers = array_values($baseLayers);
		$BaseLayerModel = ClassRegistry::init('Baselayer');
		$layers_configuration['Baselayers'] = $baseLayers;
		$dataToSave['project_id'] = $this->params->query['admin_params'];
		$dataToSave['layers_configurations'] = json_encode($layers_configuration); 
			if ($this->Baselayer->save($dataToSave)) {
			// set new ID
			$dataToSave['id'] = $this->Baselayer->id;
		}					
	}
}