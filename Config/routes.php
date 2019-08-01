<?php
/**
 * Routes configuration
 *
 * In this file, you set up routes to your controllers and their actions.
 * Routes are very important mechanism that allows you to freely connect
 * different URLs to chosen controllers and their actions (functions).
 *
 * PHP 5
 *
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.Config
 * @since         CakePHP(tm) v 0.2.9
 */

    Router::connect('/', array('controller' => 'app', 'action' => 'index'));

/**
 * Load all plugin routes. See the CakePlugin documentation on
 * how to customize the loading of plugin routes.
 */
	CakePlugin::routes();

/**
 * REST Configuration
 */
    Router::parseExtensions();

/**
 * Load the CakePHP default routes. Only remove this if you do not want to use
 * the built-in default routes.
 */
    Router::mapResources('users');
	Router::mapResources('baselayers');
	Router::mapResources('projects');
    Router::mapResources('towns');
	Router::mapResources('user_projects');	
	Router::mapResources('town_projects');
	Router::mapResources('overlay_layers');
	Router::mapResources('project_configuration');

	require CAKE . 'Config' . DS . 'routes.php';
