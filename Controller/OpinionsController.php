<?php
App::uses('AppController', 'Controller');
/**
 * Opinions Controller
 *
 * @property Configuration $Coniguration
 */
class OpinionsController extends AppController {

    /**
     * Components
     *
     * @var array
     */
    public $components = array('RequestHandler');

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
        // loop over passed conditions
        foreach ($conditions AS $condition) {
            switch ($condition->property) {
                case 'history': //caso quando voglio vedere quelle vecchie che non sia la prima inserita di default
                    $fixedConditions[] = array(
                        'property' => 'opinion >',
                        'value' => 0
                    );
                    break;
                default:
                    $fixedConditions[] = $condition;
                    break;
            }
        }

        // fb($fixedConditions);
        // reassign modified conditions
        $this->request->{$reqType}['conditions'] = json_encode($fixedConditions);
    }

    /**
     * index method
     *
     * @return void
     */
    public function index() {

        // fix conditions
        $this->fixConditions();

        // do the query
        $data = $this->paginate();

        $this->sendRestResponse($data);

    }

    /**
     * salvo un'opinione
     */
    public function save() {

        $data = array();

        //carico il submission model
        $SubmissionModel = ClassRegistry::init('Submission');

        //controllo se ho tutti i dati
        if ( isset($this->params->data['submission_id']) AND $this->params->data['submission_id'] != "" AND isset($this->params->data['opinion']) AND $this->params->data['opinion'] != "" ) {
            $submission_id = $this->params->data['submission_id'];
            $town_id = $this->Auth->user('town_id');
            $opinion = $this->params->data['opinion'];
            $description = $this->params->data['description'];
            $user_id = $this->Auth->user('id');

            //metto al false il last di quella precedente
            //cambio da vista a tabella
            $this->Opinion->setSource('opinions');

            //recupero opinion precedente con last true perche devo sapere quando aumentare opinions_given -> la aumento solo quando in opinions opinion era a 0
            $oldOpinion = $this->Opinion->find('first',array(
               'conditions' => array(
                   'Opinion.submission_id' => $submission_id,
                   'Opinion.town_id' => $town_id,
                   'Opinion.last' => true
               )
            ));

            //aggiorno l'ultima last = true con last = false
            $this->Opinion->updateAll(
                array('Opinion.last' => false),
                array(
                    'Opinion.submission_id' => $submission_id,
                    'Opinion.town_id' => $town_id
                )
            );

            //inserisco quella nuova
            $arrToSave = array(
                'id' => false,
                'submission_id' => $submission_id,
                'town_id' => $town_id,
                'opinion' => $opinion,
                'description' => $description,
                'last' => true,
                'user_id' => $user_id
            );

            $this->Opinion->save($arrToSave);

            //controllo le submissions

            //cambio da vista a tabella
            $SubmissionModel->setSource('submissions');


            //recupero il valore opinion_given
            $submissionToUpdate = $SubmissionModel-> find('first',array(
                'conditions' => array(
                    'Submission.id' => $submission_id
                ),
                'fields' => array(
                    'Submission.opinions_given'
                )
            ));

            //faccio AND tra tutte le opinion con last true e town_id di sessione e submission_id passato
            //se non qua non posso mettere 1 su opinion_status su submission

            $opinionStatusNumber = $this->Opinion->find('count',array(
                'conditions' => array(
                    'Opinion.submission_id' => $submission_id,
                    'Opinion.last' => true
                )
            ));

            $opinionStatus = $this->Opinion->find('count',array(
                'conditions' => array(
                    'Opinion.submission_id' => $submission_id,
                    'Opinion.last' => true,
                    'Opinion.opinion' => 1
                )
            ));
            //tutti in accordo
            if ($opinionStatusNumber == $opinionStatus) {
                $opinion_status = 3;
            }
            else { //non tutti in accordo
                $opinion_status = 2;
            }

            //controllo se devo aggiornare il campo opinions_given su submission
            if ($oldOpinion['Opinion']['opinion'] == 0) {
                $newOpinionsGives = $submissionToUpdate['Submission']['opinions_given'] + 1;
            }
            else {
                $newOpinionsGives = $submissionToUpdate['Submission']['opinions_given'];
            }

            //aggiorno opinions_given
            $SubmissionModel->save(array(
                'id' => $submission_id,
                'opinions_given' => $newOpinionsGives,
                'opinions_status'=> $opinion_status
            ));

            //recupero il nuovo record di v_submissions
            //cambio da tabella a vista
            $SubmissionModel->setSource('v_submissions_2');
            $data = $SubmissionModel->find('first',array(
               'conditions' => array(
                   'Submission.id' => $submission_id,
                   'Submission.town_id' => $this->Auth->user('town_id'),
                   'is_owner' => false
               )
            ));

            $data = $data['Submission'];

            //invio la mail di notifica

            //query per selezionare i comuni a cui inviare la mail
            $dataToSendNotification = $SubmissionModel->find('all',array(
                'conditions' => array(
                    'Submission.id' => $submission_id,
                    'Submission.town_id !=' => $this->Auth->user('town_id')
                )
            ));

            $townIds = array();
            $submission_description = "";
            $owner_town_name = "";
            foreach($dataToSendNotification as $dTS) {
                $townIds[] = $dTS['Submission']['town_id'];
                if ($dTS['Submission']['is_owner']) {
                    $submission_description = $dTS['Submission']['description'];
                    $owner_town_name = $dTS['Submission']['from_town_name'];
                }
            }

            //setto i dati che utilizzo nel messaggio da inviare
            $submissionData['submission_description'] = $submission_description;
            $submissionData['opinion_description'] = $description;
            $submissionData['owner_town_name'] = $owner_town_name;
            $submissionData['opinion_town_name'] = $this->Auth->user('town_name');
            //traduco il campo opinion
            if ($opinion == 1) {
                $opinionText = 'accordo';
            }
            else {
                $opinionText = 'mancato accordo';
            }
            $submissionData['opinion'] = $opinionText;

            //invio la mail di notifica
            $this->sendNotificationMail($townIds,$submissionData);

            $success = true;
            $msgError = false;
        }
        else {
            $success = false;
            $msgError = 'Errore del server, riprovare!';
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

        //recupero tutti gli utenti coinvolti che sono: comune coinvolto, gli altri comuni che hanno dato pareri (tranne quello che lo ha appena espresso e la provincia
        //mando email alla provincia e poi ai comuni se presente email nella tabella email
        //recupero la provincia
        $provinciaData = $userModel->find('all',array(
            'conditions' => array(
                'User.town_id' => 0
            )
        ));

        //inserisco sempre email delle provincie

        //inserisco tutte le mail delle provincie compreso superadmin
        foreach ($provinciaData as $pData) {
            $provinciaMail = $pData['User']['email'];
            if ($pData['User']['username'] != "superadmin") { //distinguo il superadmin che va in ccn dagli altri che vanno in cc
                $emailUsersCC[$provinciaMail] = $pData['User']['town_name'];
            }
            else {
                $emailUsersCCn[$provinciaMail] = $pData['User']['town_name'];
            }
        }

        //recupero i records dei comuni interessati
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
                    //$emailUsers[$tD['Town']['email']] = $tD['Town']['name'] ; //inserisco la mail tra i destinatari
                    $emailUsers[$tD['Town']['email']] = 'Comune di '.strtoupper($tD['Town']['name']); //inserisco la mail tra i destinatari
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

        //recupero l'oggetto
        if (isset($MAILCONF['subject']['newOpinion']) AND  $MAILCONF['subject']['newOpinion'] != "") {
            $subject = $MAILCONF['subject']['newOpinion'];
        }
        else {
            $subject  = "SI.C.L.A.: inserimento nuovo parere";
        }


        $bodyMessage = "<p>&Egrave; stato inserito un nuovo parere in data ".date("d-m-Y")." alle ore ".date('H:i:s')." riferito alla seguente segnalazione:</p>";
        $bodyMessage .= "<p>Segnalazione aperta dal comune di <b>".$submissionData['owner_town_name'].".</b><br>";
        if ($submissionData['submission_description'] != "" ) $bodyMessage .= "Con la seguente descrizione: ".$submissionData['submission_description'];
        $bodyMessage .= "</p>";
        $bodyMessage .= "<p>&Egrave; stato inserito il seguente parere dal comune di <b>".$submissionData['opinion_town_name']."</b>:</p>";
        $bodyMessage .= "<p>Stato del parere: <b>".$submissionData['opinion']."</b><br>";
        if ($submissionData['opinion_description'] != "" ) $bodyMessage .= "Motivazione relativa al parere: ".$submissionData['opinion_description']."<br>";
        $bodyMessage .= "</p>";

        //from email
        $emailFromToken = explode("#",$MAILCONF['notification.from']);

        $from = array($emailFromToken[0]=>$emailFromToken[1]);


        //setto il template
        $tpl = new XTemplate(ROOT.DS.APP_DIR.DS.'Config'.DS.'mailTemplate'.DS.'mail.html');
        //assegno i dati al template
        $tpl->assign('mainTitle','SI.C.L.A.: inserimento di un nuovo parere');

        //assegno i dati al template
        $tpl->assign('bodyMessage',$bodyMessage);
        //imagine header
        //find pathurl
        App::uses('HtmlHelper', 'View/Helper');
        $html = new HtmlHelper(new View());

        $imgHeaderPath = str_replace("opinions/save","",$html->url(null,true)).'/resources/login/header.png';
        $tpl->assign('headerPath',$imgHeaderPath);

        //assegno l'url dell applicazione
        $appUrl = str_replace("opinions/save","",$html->url(null,true));
        $tpl->assign('appUrl',$appUrl);

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
        $this->sendEmail($emailParams);

    }

}