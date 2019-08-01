<?php
App::uses('AppController', 'Controller');

/**
 * Users Controller
 *
 * @property User $User
 */
class UsersController extends AppController {

    public function beforeFilter() {

        parent::beforeFilter();
		
        $this->Auth->allow(
            'login',
            'logout',
            'checksession',
            'changepwd'
        );
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
                case 'town_id':
                    $condition->property = 'UPPER(User.town_name) LIKE';
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

    public function index() {
		
		$users = $this->User->find('all',array());
        if (@$this->request->params['ext'] == 'json') {
            // remove unwanted fields
            $this->Paginator->deniedFields = array('password', 'session_id', 'can_impersonate');

            $this->fixConditions();
            // do the query
            $data = $this->paginate();
            // send response
            $this->sendRestResponse($data);
        } else {
            $this->User->recursive = 0;
            $this->set('users', $this->Paginator->paginate());
        }
    }

    public function checksession() {
			// already logged in -> return configuration
			//var_dump($this->Session->read('project_id'));
			
			//Verifico se ho loggato l'utente
			if ($this->Auth->loggedIn()){
				
				if($this->Session->read('settings.user')){
					$user_id = $this->Session->read('settings.user.id');
					if(!$user_id != $this->request['data']['user_id']){
						$user_id = $this->request['data']['user_id'];
					}
				}else{
					$user_id = $this->request['data']['user_id'];
				}
				if($this->Session->read('project_id')){
					$project_id = $this->Session->read('project_id');
					if(!$project_id != $this->request['data']['project_id']){
						$project_id = $this->request['data']['project_id'];
					}
				}else{
					$project_id = $this->request['data']['project_id'];			
				}
				
				if(!$project_id || !$user_id){
					$this->sendLoginResponse(false);
				}
				
				$msg = '';
				$this->loadModel('Project');
				$is_active = $this->Project->find('first',array(
						'conditions' => array('id' => $project_id),
						'fields' => array('active')
					)
				);
				if(!$is_active['Project']['active']){
					$msg = 'Il progetto non è attivo';
				}
			
				$myFile = APP . "Config/Project/".$project_id.DS."settings.ini";
				$parsed_settings = parse_ini_file($myFile,true);			
				$this->loadModel('OverlayLayer');
				$layers_association = $this->OverlayLayer->find('first', array(
						'conditions' => array('project_id' => $project_id)
					)
				);
					
				$layers_configurations = json_decode($layers_association['OverlayLayer']['layers_configurations'],true);
					for($i=0; $i<count($layers_configurations['Baselayers']); $i++) {
						$tempblayers[$i]['type'] = $layers_configurations['Baselayers'][$i]['type'];
						$tempblayers[$i]['title'] = $layers_configurations['Baselayers'][$i]['title'];
						$tempblayers[$i]['url'] = $layers_configurations['Baselayers'][$i]['url'];
						$tempblayers[$i]['options']['attribution'] = $layers_configurations['Baselayers'][$i]['options_attribution'];
						$tempblayers[$i]['options']['maxZoom'] = $layers_configurations['Baselayers'][$i]['options_maxZoom'];
						if($layers_configurations['Baselayers'][$i]['type'] == 'tms'){
							$tempblayers[$i]['options']['tms'] = true;
						}
					}
				for($i=0; $i<count($layers_configurations['Overlaylayers']); $i++) {
					$tempolayers[$i]['photo'] = $layers_configurations['Overlaylayers'][$i]['photo'];
					$tempolayers[$i]['username'] = $layers_configurations['Overlaylayers'][$i]['username'];
					$tempolayers[$i]['password'] = $layers_configurations['Overlaylayers'][$i]['password'];
					$tempolayers[$i]['code'] = $layers_configurations['Overlaylayers'][$i]['code'];
					$tempolayers[$i]['title'] = $layers_configurations['Overlaylayers'][$i]['title'];
					$tempolayers[$i]['url'] = $layers_configurations['Overlaylayers'][$i]['url'];
					$tempolayers[$i]['options']['layers'] = $layers_configurations['Overlaylayers'][$i]['options_layers'];
					$tempolayers[$i]['options']['format'] = $layers_configurations['Overlaylayers'][$i]['options_format'];
					$tempolayers[$i]['options']['attribution'] = $layers_configurations['Overlaylayers'][$i]['options_attribution'];
					$tempolayers[$i]['active'] = $layers_configurations['Overlaylayers'][$i]['active'];
					if($layers_configurations['Overlaylayers'][$i]['options_transparent'] == 1){
						$tempolayers[$i]['options']['transparent'] = true;
					}else{
						$tempolayers[$i]['options']['transparent'] = false;
					}
				}

				
				$loggedUser = $this->User->find('first',array(
						'conditions' => array('id' => $user_id)
					)
				);
				
				/*if($parsed_settings['general']['submission_enable'] == 'true') {
					$parsed_settings['general']['submission_enable'] = true;
				}else{
					$parsed_settings['general']['submission_enable'] = false;
				} */
				
				if($parsed_settings['geometries']['allow_point'] == 'true') {
					$parsed_settings['geometries']['allow_point'] = true;
				}else{
					$parsed_settings['geometries']['allow_point'] = false;
				}
				
				if($parsed_settings['geometries']['allow_line'] == 'true') {
					$parsed_settings['geometries']['allow_line'] = true;
				}else{
					$parsed_settings['geometries']['allow_line'] = false;
				}

				if($parsed_settings['geometries']['allow_poligon'] == 'true') {
					$parsed_settings['geometries']['allow_poligon'] = true;
				}else{
					$parsed_settings['geometries']['allow_poligon'] = false;
				}

				if($parsed_settings['general']['drawOverLimits'] == 1){
					$parsed_settings['general']['drawOverLimits'] = true;
				}else{
					$parsed_settings['general']['drawOverLimits'] = false;
				}
				$shape_table = $this->User->query("SELECT shape_table FROM projects WHERE id = ".$project_id)[0][0]['shape_table'];
				$shapetable = false;
				if(isset($shape_table)){
					$shapetable = true;
				}
				// import controller
				App::import('Controller', 'Configurations');
				$Configurations = new ConfigurationsController();
				$buffer = (integer) $parsed_settings['map']['draw.buffer'];
				$townData = $Configurations->_loadTownData($loggedUser['User']['town_id'],$buffer, $project_id);
				$submission_enable = $Configurations->_checkSubmissionsPeriodLimit($parsed_settings['general']);
				$configuration = array (
					'loggedin' => true,
					'settings' => array(
						'user' => $loggedUser['User'],
						'shape_table' => $shapetable,
						'title' => $parsed_settings['general']['title'],
						'drawOverLimits' => $parsed_settings['general']['drawOverLimits'],
						'submissions_enable' => $submission_enable,
						'startDate' => $parsed_settings['general']['startDate'],
						'endDate' =>   $parsed_settings['general']['endDate'],
						'x_min' => $parsed_settings['general']['x_min'],
						'y_min' => $parsed_settings['general']['y_min'],
						'x_max' => $parsed_settings['general']['x_max'],
						'y_max' => $parsed_settings['general']['y_max'],
						'geometries' => $parsed_settings['geometries'],
						'map' => array(
							'dataProj' => $parsed_settings['map']['dataProj'],
							'displayProj' => $parsed_settings['map']['displayProj'],
							'town_buffer_geojson' => $townData['buffer'],
							'town_max_bounds' => $townData['bounds'],
							'town_neighbors' => $townData['neighbors'],
							'draw' => array(
								'buffer' => $parsed_settings['map']['draw.buffer']
							),
							'layers' => array(
								'base' => $tempblayers,
								'minimap' => array(
									'url' => $parsed_settings['map']['layers.minimap.url'],
									'options' => array(
										'attribution' => $parsed_settings['map']['layers.minimap.options.attribution'],
										'maxZoom' => $parsed_settings['map']['layers.minimap.options.maxZoom']
									)
								),
								'overlay' => $tempolayers,
							),
						),
					),
					'labels' => null
				);
				$this->Session->write('project_id', $project_id);
				$this->Session->write('settings', array(
					'general' => $parsed_settings['general'],
					'geometries' => $parsed_settings['geometries'],
					'mail' => $parsed_settings['mail'],
					'map' => $parsed_settings['map'],
					'user' => $loggedUser['User'],
					'labels' => null
				));
				
				// send response
				//vecchio metodo
				/*App::import('Controller', 'Configurations');
				$Configurations = new ConfigurationsController();
				$tempconf = $Configurations->get($this->Auth, $this->Session); */
				$this->sendLoginResponse(true, $configuration, $msg);
			} else {
				//Il mio utente non è loggato
				$this->sendLoginResponse(false);
			}
    }

    /**
     * login method
     */
    public function login() {
		//Controllo se è andato a buon fine il login
        if ($this->Auth->login()){
            //inserisco sul db il tentativo di login
            $StatisticModel = ClassRegistry::init('Statistic');
            $arrTosave = array(
              'Statistic' =>array(
                  'id' => false,
                  'user_id' => $this->Auth->user('id'),
                  'statistic_type' => 'access'
              )
            );
            $StatisticModel->save($arrTosave);
            // controllo la validata e se attivo
            $active = $this->Auth->user('active');
            if (!$active) {
                $this->sendLoginResponse(false, array(), "Utenza non attiva");
            }
            // check OTP
            if ($this->Auth->user('otp')) {
				$myFile = APP . 'Config/settings.ini';
				$settings = parse_ini_file($myFile,true);
				$message = $settings['general']['message'];
				
                $this->sendLoginResponse(false, array('otp' => true, 'message' => $message), "Primo accesso, cambia la tua password");
            }
            // update last_login date/time
            $this->User->id = $this->Auth->user( 'id' );
            $this->User->saveField( 'last_login', date( 'Y-m-d H:i:s' ) );
            // update current session id (in user record)
            $this->User->id = $this->Auth->user( 'id' );
            $this->User->saveField( 'session_id', $this->Session->id() );
            // redirect to generic checksession method
			$this->loadModel('UserProject');
			$userProjects = $this->UserProject->find('all',array(
				'conditions' => array(
					'UserProject.user_id' => $this->User->id)
				)
			);
			if(count($userProjects)>0){
				//Se tutto va bene rispondo con user_id
				$this->sendLoginResponse(true,array($this->User->id),"");
			}else{
				$this->sendLoginResponse(false,array(),'Impossibile effettuare l\'accesso, l\'utente corrispondente alle credenziali non è associato a nessun progetto.');
			}
            //$this->checksession();
        }
        // send response
        $this->sendLoginResponse(false, array(), 'Credenziali errate, riprovare.');
    }

    /**
     * logout method
     */
    public function logout() {
        // redirect to login page
        $this->Auth->logout();
		$this->Session->destroy();
        return $this->redirect('/index.html');
    }

    /**
     * renew password, after using OTP
     */
    public function changepwd() {


        // get input
        $input = $this->request->data;
        // 767852d17b8638176563dd75a5d779083248e358
        // password confirmation check
        if ($input['new_password'] == $input['confirm_new_password']) {
            // login check
            if ($this->Auth->login()) {
                // get user record
                $userData = $this->Auth->user();
                // encrypt new password
                $userData['password'] = $input['new_password'];
                // update last renew date
                $userData['last_renew'] = date('Y-m-d H:i:s');
                // update date_otp date
                $userData['date_otp'] = date('Y-m-d H:i:s');
                // reset otp flag
                $userData['otp'] = false;
                // set current user id
                $this->User->id = $userData['id'];
                // set user record
                $userRecord = array('User' => $userData);
                // save/update user record
                if ($this->User->save($userRecord)) {
                    //$this->checksession();
					$this->sendLoginResponse(true,$userData['id']);
                } else {
                    $this->Auth->logout();
                    $this->sendLoginResponse(false, 'Impossibile aggiornare la password in questo momento');
                }
            } else {
                $this->sendLoginResponse(false, 'Password corrente errata');
            }
        } else {
            $this->sendLoginResponse(false, 'Password non coincidenti');
        }
    }

    /**
     * Helper method to all login messages
     *
     * @param $status
     * @param string $message
     */
    private function sendLoginResponse($status, $data = array(), $message="") {
        // action without view
        $this->autoRender = false;
        // status is false, logout Auth component
        if ($status != TRUE) $this->Auth->logout();
        // send response
        echo json_encode(array(
            'success' => $status,
            'message' => $message,
            'data' => $data
        ));
        exit;
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

        $this->User->id = $id;

        //controllo il numero massimo di utenti con quel comune
        $maxUserXtown = $this->Session->read('settings.general.maxUserXtown');
        if (isset($this->request->data['town_id']) AND $this->request->data['town_id'] != 0) { //se non è provincia
            $checkMaxUserNumber = $this->User->find('first',array(
                'conditions'=>array("User.town_id" => $this->request->data['town_id']),
                'fields' => array('COUNT(*) as user_count'),
                'group' => 'User.town_id'
            ));
        }

        if (isset($checkMaxUserNumber) AND $checkMaxUserNumber AND $checkMaxUserNumber[0]['user_count'] >= $maxUserXtown) {
            $this->sendRestResponse(array(), false, 'Raggiunto il numero massimo di utenti per questo comune');
            return;
        }

        //controllo che non ci sia una mail gia inserita di un altro utente
        if (isset($this->request->data['email']) AND $this->request->data['email'] AND $this->request->data['email']!= "") {
            $checkE = $this->User->find('all',
                array('conditions'=>
                    array(
                        'User.id <>' => $id,
                        'User.email' => $this->request->data['email']
                    )
                )
            );

            //email esistente mando errore e esco
            if (isset($checkE) AND $checkE AND count($checkE)>0 ) {
                $this->sendRestResponse(array(), false, 'Email già presente nel Database');
                return;
            }
        }


        if (isset($this->request->data['town_id'])) {
            //recupero il town_name
            //carico il town model
            $TownModel = ClassRegistry::init('Town');

            //recupero il nome del comune
            $townData = $TownModel->find('first',array(
                'conditions' => array(
                    'gid' => $this->request->data['town_id']
                )
            ));

            $this->request->data['town_name'] = $townData['Town']['name'];
        }

        if ($this->User->save($this->request->data)) {
            $message = 'Saved';
        } else {
            $this->sendRestResponse(array(), false, 'Email già presente nel Database');
            return;
        }

        //recupero il dataset
        $dataSet = $this->User->find('first',array(
            'conditions'=>array(
                'User.id' => $id
            )
        ));

        $success = true;
        $this->set(array(
            'result' => array('success' => $success, 'data' => $dataSet['User'], 'msg' => ''),
            '_serialize' => array('result')
        ));
    }

    /**
     * add method
     *
     * @return void
     */
    public function add() {

        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }

        if ($this->request->is('post')) {
            // get input
            $data = array('User' => $this->request->data);
            $success = false;
            // remove null id
            unset($data['User']['id']);
            //check if username exists
            $checkU = $this->User->find('count',
                array('conditions'=>
                    array(
                        'User.username' => trim($data['User']['username'])
                    )
                )
            );
            //controllo se sto rispettando il numero massimo di utenti consentiti
            $maxUserXtown = $this->Session->read('settings.general.maxUserXtown');
            if ($this->request->data['town_id'] != 0) { //se non è provincia
                $checkMaxUserNumber = $this->User->find('first',array(
                   'conditions'=>array("User.town_id" => $this->request->data['town_id']),
                   'fields' => array('COUNT(*) as user_count'),
                   'group' => 'User.town_id'
                ));
            }

            //controllo se esiste un utente con una mail uguale
            /*if (isset($this->request->data['email']) AND $this->request->data['email'] AND $this->request->data['email']!= "") {
                $checkE = $this->User->find('all',
                    array('conditions'=>
                        array(
                            'User.email' => $this->request->data['email']
                        )
                    )
                );
            }*/
            //username esistente mando errore
            if (isset($checkU) AND $checkU AND count($checkU)>0 ) {
                $this->sendRestResponse(array(), false, 'Username già presente');
            }
            else if (isset($checkE) AND $checkE AND count($checkE)>0 ) {
                $this->sendRestResponse(array(), false, 'Email già presente nel Database');
                return;
            }
            else if (isset($checkMaxUserNumber) AND $checkMaxUserNumber AND $checkMaxUserNumber[0]['user_count'] >= $maxUserXtown) {
                $this->sendRestResponse(array(), false, 'Raggiunto il numero massimo di utenti per questo comune');
                return;
            }
            else {

                // create new record
                $this->User->create();
                //creo una password temporanea
                $data['User']['computepassword'] = substr( str_shuffle( 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$' ) , 0 , 8 );
                $data['User']['password'] = $data['User']['computepassword'];

                //carico il town model
                $TownModel = ClassRegistry::init('Town');

                //recupero il nome del comune
                $townData = $TownModel->find('first',array(
                   'conditions' => array(
                       'gid' => $data['User']['town_id']
                   )
                ));

                if (isset($townData) AND count($townData) > 0) {
                    $data['User']['town_name'] = $townData['Town']['name'];
                }
                else {
                    $data['User']['town_name'] = "ADMIN";
                }
                $data['User']['otp'] = true;
				if($data['User']['town_name'] == "ADMIN"){
					$data['User']['is_admin'] = true;
				}
                // try to save the record
                if ($this->User->save($data)) {
                    // set new ID
                    $data['User']['id'] = $this->User->id;
                    $success = true;
                }

                //mando la notifica
                $emailData = array();

                $emailData['computepassword'] = $data['User']['computepassword'];
                $emailData['type'] = 'newUser';
                $emailData['title'] = 'SI.C.L.A.: nuovo utente';
                $emailData['functions'] = '.json';
                $emailData['username'] = $data['User']['username'];

                $userMail = array($data['User']['email'] => $data['User']['surname'].' '.$data['User']['name']);
                //invio la mail
                $this->sendNotificationMail($userMail,$emailData);

                // send response
                $this->set(array(
                    'result' => array('success' => $success, 'data' => $data['User'], 'msg' => ''),
                    '_serialize' => array('result')
                ));
            }
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

        if ($this->User->delete($id)) {
            $success = true;
			$this->loadModel('UserProject');
			$userprojects = $this->UserProject->find('all',array(
				'conditions' => array(
					'UserProject.user_id' => $id)));
			if($userprojects && count($userprojects)>0){
				$this->UserProject->deleteAll(array('UserProject.user_id' => $id),false);
			}
        } else {
            $success = false;
        }

        $this->sendRestResponse(array());

    }

    /**
     * regeneratePassword method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
    public function generatePassword() {

        $data = array();
        $msgError = "";

        $params = $this->params->data;

        $id = $params['id'];

        //recupero il record
        $dataUser = $this->User->find('first',array(
            'conditions' => array(
                'User.id' => $id
            )
        ));


        //non serve rigenerare
        if ($dataUser['User']['otp']) {
            $computepassword = $dataUser['User']['computepassword'];
        }
        else { //rigenero
            $computepassword = substr( str_shuffle( 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$' ) , 0 , 8 );
            $password = $computepassword;

            $arrToUpd = array(
                'User' => array(
                    'id' => $id,
                    'password' => $password,
                    'computepassword' => $computepassword,
                    'otp' => true
                )
            );

            if ($this->User->save($arrToUpd)) {
                $success = true;
                $msg = "";
            } else {
                $success = false;
                $msgError = "Errore del server!";
            }
        }

        $data['computepassword'] = $computepassword;

        $emailData['computepassword'] = $computepassword;
        $emailData['type'] = 'generatePassword';
        $emailData['title'] = 'SI.C.L.A.: nuova password';
        $emailData['functions'] = '/generatePassword';

        $userMail = array($dataUser['User']['email'] => $dataUser['User']['surname'].' '.$dataUser['User']['name']);
        //invio la mail
        $this->sendNotificationMail($userMail,$emailData);
	
        $success = true;
        //send response
        $this->sendJsonResponse($data,$success,$msgError);

    }

    /**
     * send a mail to provincia and all involved towns
     */
    private function sendNotificationMail($emailUsers,$emailData) {

        //load xtemplate class
        require_once ROOT . DS. APP_DIR . DS.'Vendor'.DS.'xtpl'.DS.'xtemplate.class.php';
        $MAILCONF = $this->Session->read('settings.mail');
        //spedisco

        //recupero l'oggetto
        if (isset($MAILCONF['subject']['generatePassword']) AND  $MAILCONF['subject']['generatePassword'] != "") {
            $subject = $MAILCONF['subject'][$emailData['type']];
        }
        else {
            $subject  = "SI.C.L.A. - account password";
        }

        if ($emailData['type'] == 'generatePassword') {
            $bodyMessage = "<p>La password per accedere ai servizi SI.C.L.A. &egrave;:</p>";
            $bodyMessage .= "<p><b>".$emailData['computepassword']."</b></p>";

        }
        else if ($emailData['type'] == 'newUser') {
            $bodyMessage = "<p>Benvenuto nel sistema informativo SI.C.L.A.</p>";
            $bodyMessage .= "<p>I dati per accedere al servizio sono:<br></p>";
            $bodyMessage .= "username: <b>".$emailData['username']."</b><br>";
            $bodyMessage .= "password: <b>".$emailData['computepassword']."</b>";
        }
        //from email
        $emailFromToken = explode("#",$MAILCONF['notification.from']);

        $from = array($emailFromToken[0]=>$emailFromToken[1]);


        //setto il template
        $tpl = new XTemplate(ROOT.DS.APP_DIR.DS.'Config'.DS.'mailTemplate'.DS.'mail.html');
        //assegno i dati al template
        $tpl->assign('mainTitle',$emailData['title']);

        //find pathurl
        App::uses('HtmlHelper', 'View/Helper');
        $html = new HtmlHelper(new View());

        //$imgHeaderPath = str_replace("users".$emailData['functions'],"",$html->url(null,true)).'resources/login/header.png';
		$imgHeaderPath = "http://geodbt.cittametropolitana.mi.it/apps/temporary_headeremail/header_long.jpg"; //provvisorio causa mancanza di permessi per accedere all'header
		$tpl->assign('headerPath',$imgHeaderPath);

        //assegno l'url dell applicazione
        $appUrl = str_replace("users".$emailData['functions'],"",$html->url(null,true));

        $tpl->assign('appUrl',$appUrl);

        //assegno i dati al template
        $tpl->assign('bodyMessage',$bodyMessage);

        $tpl->parse('main');

        $emailMessage = $tpl->text('main');

        //passo anche il disclaimer

        $emailParams = array(
            'subject' => $subject,
            'emailMessage' => $emailMessage,
            'to' => $emailUsers,
            'from' => $from,
            'attachment' => WWW_ROOT.'files'.DS.'disclaimer.pdf'
        );
        //invio la mail
        $this->sendEmail($emailParams, $MAILCONF);
    }

    public function export() {
        // set header array
        $headerLabels = Array();

        $headerLabels['username'] = "Username";
        $headerLabels['email'] = "Email";
        $headerLabels['town_name'] = "Comune";
        $headerLabels['otp'] = "Login";
        $headerLabels['name'] = "Nome";
        $headerLabels['surname'] = "Cognome";


        // get data
        $data = $this->User->find('all',array(
            'conditions' => array('User.town_id <>' => 0),
            'fields' => array('username','email','town_name','otp','name','surname')
        ));

        $data = Set::extract($data, '{n}.User');

        // fix data for output
        // fix output array (removing unwanted fields)
        foreach ($data AS &$row) {
            if ($row['otp']) $row['otp'] = 'NO';
            else $row['otp'] = 'SI';
        }

        $fileNameType = 'Utenti';
        // send to the view
        $this->set('header', array_values($headerLabels));
        $this->set('data', $data);
        $this->set('fileNameType', $fileNameType);
    }

}