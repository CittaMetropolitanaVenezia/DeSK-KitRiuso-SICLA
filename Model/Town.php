<?php
App::uses('AppModel', 'Model');
/**
 * Town Model
 *
 */
class Town extends AppModel {

    /**
     * Use table
     *
     * @var mixed False or table name
     */
    public $useTable = 'towns';
	
	public $hasAndBelongsToMany = array(
		'Project' => array(
			'className' => 'Project',
			'joinTable' => 'town_projects',
			'foreignKey' => 'town_id',
			'associationForeignKey' => 'project_id',
			'unique' => 'keepExisting'
		)
	);
	public $hasMany = array(
		'TownProject'=> array(
			'className' => 'TownProject',
			'foreignKey' => 'town_id',
			'dependent' => false
			
		)
	);
    /**
     * This table primary key
     *
     * @var string
     */
    public $primaryKey = 'gid';

    /**
     * Query aliases
     *
     * @var array
     */
    public $virtualFields = array(
        'bounds' => "st_xmin( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_ymin( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_xmax( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_ymax( st_transform( st_expand(the_geom, 1000), 4326 ) )"
    );
    public function getTownBufferWKt($town_id, $buffer, $project_id) {
		$myFile = APP . "Config/Project/".$project_id.DS."settings.ini";
		$parsed_settings = parse_ini_file($myFile,true);
		if($parsed_settings['general']['drawOverLimits'] == 1){
				$x_min = $parsed_settings['general']['x_min'];
				$y_min = $parsed_settings['general']['y_min'];
				$x_max = $parsed_settings['general']['x_max'];
				$y_max = $parsed_settings['general']['y_max'];
				//query per calcolare il buffer degli enti che non hanno geometria(calcolato su tutto il progetto)
				$res = $this->query('
									 SELECT ST_asText(ST_MakeEnvelope('.$y_min.', '.$x_min.', '.$y_max.', '.$x_max.',4326)) as buffer');
				return $res[0][0]['buffer'];
		}else{
			$res = $this->find('first', array(
				'conditions' => array(
					'gid' => $town_id
				),
				 'fields' => array(
					 'st_astext( st_transform( st_buffer( st_simplify(the_geom, 30), '.$buffer.') , 4326) ) AS buffer'
				 )
			));
        if ($res AND count($res)>0) {
		
            if( $res[0]['buffer']){
				return $res[0]['buffer'];
			}else{
				$myFile = APP.'Config/Project/'.$project_id.DS."settings.ini";
				$configuration = parse_ini_file($myFile,true);
				$x_min = $configuration['general']['x_min'];
				$y_min = $configuration['general']['y_min'];
				$x_max = $configuration['general']['x_max'];
				$y_max = $configuration['general']['y_max'];
				//query per calcolare il buffer degli enti che non hanno geometria(calcolato su tutto il progetto)
				$res = $this->query('
									 SELECT ST_asText(ST_MakeEnvelope('.$y_min.', '.$x_min.', '.$y_max.', '.$x_max.',4326)) as buffer');
				return $res[0][0]['buffer'];
			}
        }
	}
        return null;
    }

 public function getTownExtent($town_id, $project_id) {
		$myFile = APP.'Config/Project/'.$project_id.DS."settings.ini";
				$configuration = parse_ini_file($myFile,true);
				$x_min = $configuration['general']['x_min'];
				$y_min = $configuration['general']['y_min'];
				$x_max = $configuration['general']['x_max'];
				$y_max = $configuration['general']['y_max'];				
		if($configuration['general']['drawOverLimits'] == 1){
			$res['extent'] = $y_min.','.$x_min.','.$y_max.','.$x_max;
			return $res['extent'];
		}else{
			$res = $this->find('first', array(
				'conditions' => array(
					'gid' => $town_id
				),
				'fields' => array(
					"st_xmin(st_transform(st_expand(the_geom, 1500), 4326)) || ',' || st_ymin(st_transform(st_expand(the_geom, 1500), 4326)) || ',' || st_xmax(st_transform(st_expand(the_geom, 1500), 4326)) || ',' || st_ymax(st_transform(st_expand(the_geom, 1500), 4326)) AS extent"
				)
			));
		
			if ($res AND count($res) > 0) {
				if($res[0]['extent']){
					return $res[0]['extent'];
				}else{
					//query per calcolare il buffer degli enti che non hanno geometria(calcolato su tutto il progetto)
					//$res = $this->query('SELECT ST_asText(ST_MakeEnvelope('.$y_min.', '.$x_min.', '.$y_max.', '.$x_max.',4326)) as extent;');	
					$res['extent'] = $y_min.','.$x_min.','.$y_max.','.$x_max;
					return $res['extent'];
				}
			}
		}
        return null;
    }

    public function getTownNeighbors($town_id, $project_id) {
        $output = array();
     $res = $this->query('SELECT tt.gid,
                                    tt.name,
                                    st_astext( st_transform( st_simplify(tt.the_geom, 30) , 4326) ) AS wkt
                               FROM towns t
                               JOIN towns tt
                                 ON t.the_geom && tt.the_geom
                                AND st_intersects(t.the_geom, tt.the_geom)
								JOIN town_projects tp
								 ON tp.town_id = t.gid
                              WHERE t.gid = '.$town_id.' AND tt.gid <> '.$town_id.'
								AND tp.project_id ='.$project_id);
        if ($res AND count($res) > 0) {
            return Set::extract($res, '{n}.0');
        }
        return $output;
    }
}
