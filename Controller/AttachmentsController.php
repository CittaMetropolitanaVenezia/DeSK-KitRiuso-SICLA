<?php
App::uses('AppController', 'Controller');
/**
 * Attachments Controller
 *
 * @property Configuration $Coniguration
 */
class AttachmentsController extends AppController {

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
        $conditions = (array_key_exists('conditions', $this->request->{$reqType}) ? json_decode($this->request->{$reqType}['conditions'],true) : array());
        // loop over conditions (and overwrite)
        $fixedConditions = array();
        // loop over passed conditions
        foreach ($conditions AS $condition) {
            switch ($condition->property) {
                default:
                    $fixedConditions[] = $condition;
                    break;
            }
        }

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
     * mando in download l'allegato
     */
    public function download($submission_id) {
        // load settings
		$project_id = $this->Session->read('project_id');
        $uploadPath = $this->Session->read('settings.general.uploadPath').DS.$project_id;
        // get record
        $data = $this->Attachment->find('first', array(
            'conditions' =>array(
                'id' => $submission_id
            )
        ));
        if ($data AND count($data) > 0) {
            // clean the name
            $fileName = preg_replace(array('/\s/', '/\.[\.]+/', '/[^\w_\.\-]/'), array('_', '.', ''), $data['Attachment']['name']);
            // use media view
            $this->viewClass = 'Media';
			
			$filePath = $uploadPath.DS.$data['Attachment']['submission_id'].DS.$fileName;
			if (!file_exists($filePath)) {
				die('FILE NON TROVATO');
			}
			
            // Download app/outside_webroot_dir/example.zip
            $params = array(
                'id'        => $data['Attachment']['name'],
                'name'      => $fileName,
                'download'  => false,
                'extension' => $data['Attachment']['type'],
                'path'      => $uploadPath.DS.$data['Attachment']['submission_id'].DS
            );
            $this->set($params);
        } else {
            die('FILE NON TROVATO');
        }
    }

    /*
     * upload temporaneo dei documenti
     */
    public function upload() {
        // init output
        $data = array();
        // recupero il file
        $params = $this->request->params;
		$project_id = $this->Session->read('project_id');
        $file = $params['form']['attachment'];
        // recupero etichetta
        $label = $this->request->data['label'];
        // recupero gli allegati (gia) presenti
        $attachmentsLoaded = json_decode($this->request->data[0]);
        // re-inizializzo il vettore contente gli allegati
        $uploadAttachments = array();
        if (isset($attachmentsLoaded) AND count($attachmentsLoaded)>0) { //se presenti precedenti allaegati
            $i = 0;
            foreach ($attachmentsLoaded as $aL) {
                $uploadAttachments[$i]['type'] = $aL->type;
                $uploadAttachments[$i]['label'] = $aL->label;
                $uploadAttachments[$i]['name'] = $aL->name;
                if (isset($aL->id)) { //solo quando sono in detail mi mando anche l'id delle precedenti
                    $uploadAttachments[$i]['id'] = $aL->id;
					$uploadAttachments[$i]['submission_id'] = $aL->submission_id;
                }
                $i++;
            }
        }
        // load settings
        $uploadLimit = $this->Session->read('settings.general.uploadLimit');
        $uploadPath = $this->Session->read('settings.general.uploadPath').DS.$project_id;
        //elemento attualmente inseriti
        $uploadNumber = count($uploadAttachments);
        //se no ho superato il limite inserisco
        if ($uploadNumber < $uploadLimit) {
            //sistemo il nome del file
            $fileName = preg_replace(array('/\s/', '/\.[\.]+/', '/[^\w_\.\-]/'), array('_', '.', ''), $file['name']);
            // get file type
            $tokens = explode('.', $fileName);
            $fileType = strtolower($tokens[count($tokens)-1]);
            //caso detail -> devo aggiornare il db e fare l'upload del file nel posto corretto
            if (isset($this->request->data['submission_id']) AND $this->request->data['submission_id'] > 0) {
                $filePath = $uploadPath.DS.$this->request->data['submission_id'].DS;

                if (!file_exists($filePath)) {
                    mkdir($filePath);
                }
            }
            else { //caso edit -> nuovo inserimento in temporaneo
				
                $filePath = $uploadPath.DS.'tmp'.DS;
                if (!file_exists($filePath)) {
                    mkdir($filePath);
                }
                $filePath = $filePath.session_id().DS;

                //creo la cartella del percorso
                if (!file_exists($filePath)) {
                    mkdir($filePath);
                }
            }
            //file path
            //sposto il file all'interno della cartella temporanea
			//Configure::write('debug',2);
            if (move_uploaded_file($file['tmp_name'], $filePath.$fileName)) {
                //recupero l'ultimo indice inserito
                $index = count($uploadAttachments);
                //inserisco nello store
                $uploadAttachments[$index]['label'] = $label;
                $uploadAttachments[$index]['type'] = $fileType;
                $uploadAttachments[$index]['name'] = $fileName;

                //se detail salvo nel db
                if (isset($this->request->data['submission_id']) AND $this->request->data['submission_id'] > 0) {
                    $arrToSave = array(
                        'Attachment' => array(
                            'id' => false,
                            'type' => strtolower($fileType),
                            'name' => $fileName,
                            'submission_id' => $this->request->data['submission_id'],
							'project_id' => $project_id,
                            'label' => $label
                        )
                    );

                    $this->Attachment->save($arrToSave);
                    $newId = $this->Attachment->id;
                    //passo anche il nuovo id
                    $uploadAttachments[$index]['id'] = $newId;
					$uploadAttachments[$index]['submission_id'] = $this->request->data['submission_id'];
                }


                $data = $uploadAttachments;
                $success = true;
                $msgError = "";
            }
            else{
                $success = false;
                $msgError = 'Errore del server!';
            }
        }
        else {
            $success = false;
            $msgError = 'Raggiunto il limite massimo di allegati!!';
        }
        //send response
        $this->autoRender = false;
        echo json_encode(array(
            'success' => $success,
            'data' => $data,
            'msgError' => $msgError
        ));
    }

    public function removeUpload() {
        // init output
        $data = array();
        $success = false;
        $msgError = "";
        // recupero i parametri
        $params = $this->params->data;
        $attachment = $params['attachment'];
        // remove an attachment from a subsmission quando in detail
        if (isset($attachment['id']) AND $attachment['id'] > 0) {
            if ($this->Attachment->delete($attachment['id'])) {
                //rimuovo il file
                $uploadPath = $this->Session->read('settings.general.uploadPath').DS.$project_id;
                $filePath = $uploadPath.DS.$attachment['submission_id'].DS.$attachment['name'];
				
				if (file_exists($filePath)) {
                    unlink($filePath);
                }

                //elimino anche dal db
                $this->Attachment->delete($attachment['id']);

                $success = true;
            }
        } else { //quando sono in edit
            //rimuovo il file
            $uploadPath = $this->Session->read('settings.general.uploadPath').DS.$project_id;
            $filePath = $uploadPath.DS.'tmp'.DS.session_id().DS.$attachment['name'];
            
			if (file_exists($filePath)) {
                unlink($filePath);
            }
            $success = true;
        }
        // send response to client
        $this->sendJsonResponse($data, $success, $msgError);
    }

    public function removeOldUpload() {

        $this->deleteOldTmpfolder();

        $data = array();
        $success = true;
        $msgError = "";
        $this->sendJsonResponse($data,$success,$msgError);
    }

}