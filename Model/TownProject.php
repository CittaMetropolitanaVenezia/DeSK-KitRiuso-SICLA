<?php
App::uses('AppModel', 'Model');
App::uses('AuthComponent', 'Controller/Component');
/**
 * TownProject Model
 *
 */
class TownProject extends AppModel {

	
	/**
	*	Tabella utilizzata dal modello
	*/
	public $useTable = "town_projects";
	
	public $name = "TownProject";
	
	//assodato
	public $belongsTo = array(
		'Town' => array(
			'className' => 'Town',
			'foreignKey' => 'town_id',
			
		),
		'Project' => array(
			'className' => 'Project',
			'foreignKey' => 'project_id',
		)
	);
	

    /**
     * Display field
     *
     * @var string
     */
    public $displayField = 'id';

    /**
     * Validation rules
     *
     * @var array
     */
   /* public $validate = array(
        'user_id' => array(
            'notempty' => array(
                'rule' => array('notempty'),
                //'message' => 'Your custom message here',
                //'allowEmpty' => false,
                //'required' => false,
                //'last' => false, // Stop validation after this rule
                //'on' => 'create', // Limit validation to 'create' or 'update' operations
            ),
        ),
        'project_id' => array(
            'notempty' => array(
                'rule' => array('notempty'),
                //'message' => 'Your custom message here',
                //'allowEmpty' => false,
                //'required' => false,
                //'last' => false, // Stop validation after this rule
                //'on' => 'create', // Limit validation to 'create' or 'update' operations
            ),
        ),
    );*/

}