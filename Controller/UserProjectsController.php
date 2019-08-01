<?php
App::uses('AppController', 'Controller');


/**
 * UserProjectsController Controller
 *
 * @property UserProject $UserProject
 */
class UserProjectsController extends AppController {

    public function index() {
        if (@$this->request->params['ext'] == 'json') {
			// If we need keep this association after model reset
			// we will pass a second boolean parameter like this:
			$this->UserProject->bindModel(
				array('hasMany' => array(
						'User' => array(
							'className' => 'User',
							'foreignKey' => 'user_id',
							'associationForeignKey' => 'id',
						)
					)
				),
				false
			);
			$this->UserProject->bindModel(
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
			$user_info = $this->UserProject->find('all',array(
				'conditions' => array(
					'UserProject.user_id' => $this->params->query['user_id'],
					),
				)
			);
			for($i = 0; $i<count($user_info); $i++) {
					$user_info[$i]['UserProject']['project_name'] = $user_info[$i]['Project']['name'];
			};
            // send response
            $this->sendRestResponse($user_info);
			
        } else {
            $this->UserProject->recursive = 0;
            $this->set('user_projects', $this->Paginator->paginate());
        }
    }
	public function loginprojectlist() {
		if (@$this->request->params['ext'] == 'json') {
			
		$user_id = $this->request->query['user_id'];
		
		if($this->Auth->User('is_admin')){
			$projects = $this->UserProject->find('all',array(
				'conditions' => array (
				'UserProject.user_id' => $user_id)));
		}else{
			$projects = $this->UserProject->find('all',array(
				'conditions' => array (
				'UserProject.user_id' => $user_id,
				'Project.active' => true)
			));	
		}
		if(count($projects)== 0) {
			$this->sendRestResponse(array(),false, 'Nessun progetto associato. Ritorno alla schermata di login');
		}else{	
		for($i = 0; $i<count($projects); $i++) {
					$bindedProjects['UserProject'][$i] = $projects[$i]['Project'];
			};
		$this->sendRestResponse($bindedProjects);
		}
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
        $UserProjectModel = ClassRegistry::init('UserProject');
        $params = $this->params->data;
        //controllo se ho tutti i dati
        if ( isset($params['user_id']) AND isset($params['project_id'])) {
            //recupero lo user id
            $user_id = $params['user_id'];
            //recupero il project id
            $project_id = $params['project_id'];
            $arrToSave = array('UserProject' =>
                array(
					'id' => false,
                    'user_id' => $user_id,
                    'project_id' => $project_id,
                ));
            $userProjectData = $this->UserProject->save($arrToSave);
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

        if ($this->UserProject->delete($id)) {
            $success = true;
        } else {
            $success = false;
        }

        $this->sendRestResponse(array());

    }
}