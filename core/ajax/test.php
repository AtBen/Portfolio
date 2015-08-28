<?php

	//VIEW ERROR
	error_reporting(E_ALL);
	ini_set("display_errors", 1);

	//Load datas
	require_once(dirname(dirname(__FILE__)) . '/config.php');
	require_once(APP_CORE.'class/app.class.php');

	//Init class
	$app = new app();

	echo ($app->send_mail('contact@pexel.me','test','text de contenu') ? 'ok' : 'error');