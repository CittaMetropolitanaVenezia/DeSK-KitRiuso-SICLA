<?php
App::uses('AppController', 'Controller');


/**
 * TownProjectsController Controller
 *
 * @property TownProject $TownProject
 */
class TownProjectsController extends AppController {

    public function index() {
		if (@$this->request->params['ext'] == 'json') {
			// If we need keep this association after model reset
			// we will pass a second boolean parameter like this:
			$this->TownProject->bindModel(
				array('hasMany' => array(
						'Town' => array(
							'className' => 'Town',
							'foreignKey' => 'town_id',
							'associationForeignKey' => 'id',
						)
					)
				),
				false
			);
			$this->TownProject->bindModel(
				array('hasMany' => array(
						'Project' => array(
							'className' => 'Project',
							'foreignKey' => 'project_id',
							'associationForeignKey' => 'id',
						)
					)
				),
				false
			);
			$user_info = $this->TownProject->find('all',array(
				'conditions' => array(
					'TownProject.town_id' => $this->params->query['town_id'])));

			for($i = 0; $i<count($user_info); $i++) {
					$user_info[$i]['TownProject']['project_name'] = $user_info[$i]['Project']['name'];
			};
            // send response
            $this->sendRestResponse($user_info);
		}else{
			$this->TownProject->recursive = 0;
            $this->set('town_projects', $this->Paginator->paginate());
		}
    }


    /**
     * edit method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
    /**
     * save method
     *
     * @return void
     */
      public function save() {
		$data = array();
        //carico lo UserProject model
        $TownProjectModel = ClassRegistry::init('TownProject');
        $params = $this->params->data;
        //controllo se ho tutti i dati
        if ( isset($params['town_id']) AND isset($params['project_id'])) {
            //recupero il town id
            $town_id = $params['town_id'];
            //recupero il project id
            $project_id = $params['project_id'];
            $arrToSave = array('TownProject' =>
                array(
					'id' => false,
                    'town_id' => $town_id,
                    'project_id' => $project_id,
                ));
            $userProjectData = $this->TownProject->save($arrToSave);
            $success = true;
            $msgError = false;
        }
        else {
            $success = false;
            $msgError = 'Errore del server, riprovare!';
        }
        //mando la risposta al server
        $this->sendJsonResponse($data,$success,$msgError);
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

        if ($this->TownProject->delete($id)) {
            $success = true;
        } else {
            $success = false;
        }

        $this->sendRestResponse(array());

    }
}
