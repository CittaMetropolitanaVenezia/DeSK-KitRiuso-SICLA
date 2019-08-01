<?php
/**
 * Application level Controller
 *
 * This file is application-wide controller file. You can put all
 * application-wide controller-related methods here.
 *
 * PHP 5
 *
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.Controller
 * @since         CakePHP(tm) v 0.2.9
 */

App::uses('Controller', 'Controller');

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @package		app.Controller
 * @link		http://book.cakephp.org/2.0/en/controllers.html#the-app-controller
 */
class AppController extends Controller {
    /**
     * Common components
     * @var array
     */
    public $components = array(
        'Session',
        'RequestHandler',
        'Paginator' => array('className' => 'RestPaginator'),
        'Auth'
        /*
        'Auth' => array(
            'authenticate' => array('Cas')
        )
        */
    );

    /**
     * Check controller actions authorization
     * @param $user
     * @return bool
     */
    public function isAuthorized($user) {
        return true;
    }

    /**
     * Main beforeFilter hook
     */
    public function beforeFilter() {
        // Add a kml content-type (lib/Cake/Network/CakeResponse.php...)
        $this->response->type(array('kml' => 'application/vnd.google-earth.kml+xml'));
        $this->response->type('kml');
        // TODO: togliere...
        $this->Auth->allow('index');
    }

    /**
     * App main entry point
     */
    public function index() {
        // set main title
        // TODO: sistemare
        // $this->set('title_for_layout', Configure::read('general.title'));
        // choose mode
        if (array_key_exists('DEV', $this->request->query) AND ($this->Auth->user('username') == 'superadmin' OR $this->Auth->user('username') == 'demo')) {
            $this->set('environment', 'DEV');
        } else {
            $this->set('environment', 'PROD'); // PROD
        }
    }

    /**
     * Common method to output rest responses
     *
     * @param $data
     * @param bool $success
     * @param bool $msg
     */
    public function sendRestResponse($data, $success = true, $msg = false) {
		
        if (count($data) > 0) {
            if (isset($data[0])) {
                $data = Set::extract($data, '{n}.' . $this->modelClass);				
            } else {
                $data = $data[$this->modelClass];	
            }			
        }
        $this->set(array(
            'result' => array(
                'success' => $success,
                'data' => $data,
                'count' => $this->request['paging'][$this->modelClass]['count'],
                'error' => $msg,
                'ts' => time()
            ),
            '_serialize' => 'result'
        ));
    }

    /**
     * Common method to output json responses
     *
     * @param $data
     * @param bool $success
     * @param bool $msg
     */
    public function sendJsonResponse($data, $success = true, $msg = false) {
        $this->autoRender = false;
        echo json_encode(array(
            'result' => array(
                'success' => $success,
                'data' => $data,
                'error' => $msg,
                'count' => $this->request['paging'][$this->modelClass]['count'],
                'msg' => $msg
            )
        ));
        die();
    }

    /*
     * elimino tutti le cartelle di sessione che sono più vecchie di un giorno
     */
    public function deleteOldTmpfolder() {

        App::uses('Folder', 'Utility');
        App::uses('File', 'Utility');
        //cancello quelle più vecchie di un giorno che in secondi sono $difference = 86400;
        $differenceOneDay = 86400;
        //recupero il path tmp dove si memorizzano le sessioni
        $uploadPath = $this->Session->read('settings.general.uploadPath');
        $sessionTmpPath = $uploadPath.DS.'tmp'.DS;
        //recupero tutte le soto cartelle
        $dir = new Folder($sessionTmpPath);
        $allData = $dir->read(true, true,true);

        //predno solo el cartelle
        $folderTocheck = $allData[0];

        //cancello solo quelle con data di creazione di un giorno indietro
        $now = time();
        foreach ($folderTocheck as $f) {
            //data di creazione delle cartella di sessione
            $dateCreatedFolder = filectime($f);
            $diff = $now - $dateCreatedFolder;
            //se maggiore di un giorno cancello
            if ($diff > $differenceOneDay) {
                $fToDel = new Folder($f);
                //cancello tutti i file dentro alla cartella
                $fToDel->delete();
            }
        }

    }

    public function sendEmail($params, $MAILCONF) {

        require_once ROOT . DS. APP_DIR . DS.'Vendor'.DS.'swiftmailer'.DS.'swift_required.php';

        //carico le impostazione della mail per l'smtp
        //$MAILCONF = $this->Session->read('settings.mail');  //Prendo la configurazione di volta in volta dal progetto
        //metto l'smtp se necessario
        if (isset($MAILCONF['smtp.host']) AND $MAILCONF['smtp.host'] AND $MAILCONF['smtp.host'] != "" ) {

            $transport = Swift_SmtpTransport::newInstance($MAILCONF['smtp.host'], $MAILCONF['smtp.port'])
                ->setUsername($MAILCONF['smtp.user'])
                ->setPassword($MAILCONF['smtp.pswd']);

        }
        else { //invio con mail normale
            $transport = Swift_MailTransport::newInstance();
        }

        // Create the Mailer using your created Transport
        $mailer = Swift_Mailer::newInstance($transport);
		
        if (!isset($params['cc'])) {
            $params['cc'] = array();
        }

        if (!isset($params['ccn'])) {
            $params['ccn'] = array();
        }
        // Create the message

        if (isset($params['attachment']) AND $params['attachment'] != ""){
            // Optionally add any attachments
            $messageObj = Swift_Message::newInstance()
                // Give the message a subject
                ->setSubject($params['subject'])
                // Set the From address with an associative array
                ->setFrom($params['from'])
                // Set the To addresses with an associative array
                ->setTo($params['to'])
                ->setCc($params['cc'])
                ->setBcc($params['ccn'])
                // Give it a body
                ->setBody($params['emailMessage'],'text/html')
                //add attachments
                ->attach(Swift_Attachment::fromPath($params['attachment']));
        }
        else {

        //send message senza allegati
            $messageObj = Swift_Message::newInstance()
                // Give the message a subject
                ->setSubject($params['subject'])
                // Set the From address with an associative array
                ->setFrom($params['from'])
                // Set the To addresses with an associative array
                ->setTo($params['to'])
                ->setCc($params['cc'])
                ->setBcc($params['ccn'])
                // Give it a body
                ->setBody($params['emailMessage'],'text/html');
        }
		
        // Send the message
		//try{
        $result = $mailer->send($messageObj);
		//}catch(Exception $e){
		//	$result=-1;
		//}
        if ($result > 0){ 			
			return true;
		}
        else{ 
			return false;
		}

    }
}
