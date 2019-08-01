<?php
App::uses('AppModel', 'Model');
App::uses('AuthComponent', 'Controller/Component');
/**
 * Baselayer Model
 *
 */
class Baselayer extends AppModel {


	/**
	*	Tabella utilizzata dal modello
	*/
	public $useTable = "project_configuration";
	
	public $name = "Baselayer";
    /**
     * Display field
     *
     * @var string
     */
    //public $displayField = 'title';

}