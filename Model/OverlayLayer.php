<?php
App::uses('AppModel', 'Model');
App::uses('AuthComponent', 'Controller/Component');
/**
 * OverlayLayer Model
 *
 */
class OverlayLayer extends AppModel {


	/**
	*	Tabella utilizzata dal modello
	*/
	public $useTable = "project_configuration";
	
	public $name = "OverlayLayer";
    /**
     * Display field
     *
     * @var string
     */
    //public $displayField = 'title';

}