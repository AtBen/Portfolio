<?php

	//Load datas
	require_once(dirname(dirname(__FILE__)) . '/config.php');
	require_once(APP_CORE.'class/app.class.php');

	//Init class
	$app = new app();

	// Temps client
	$message = stripslashes($_POST['message']);
	$subject = stripslashes($_POST['subject']);
	$mail = stripslashes($_POST['mail']);
	$company = stripslashes($_POST['company']);
	$name = stripslashes($_POST['name']);

	$message = str_replace(';;amp;;', '&', $message);
	$message = str_replace(';;plus;;', '+', $message);

	$subject = str_replace(';;amp;;', '&', $subject);
	$subject = str_replace(';;plus;;', '+', $subject);

	$name = str_replace(';;amp;;', '&', $name);
	$name = str_replace(';;plus;;', '+', $name);
	
	$message = utf8_decode($message);
	$subject = utf8_decode($subject);
	
	$destinataires="contact@pexel.me";
	$subject = (empty($subject)) ? 'Nouveau message de Pexel.me' : $subject;

	$bodymessage="<html><body>";
	$bodymessage.="<table></tr>";
	$bodymessage.="<tr><td><br /><strong>Email</strong> <br /> ".$mail."<br /></td></tr>";

	if(trim($company) != '')
		$bodymessage.="<tr><td><br /><strong>Company</strong> <br /> ".$company."<br /></td></tr>";

	$bodymessage.="<tr><td><br /><strong>Name</strong> <br /> ".$name."<br /></td></tr>";

	$bodymessage.="<tr><td><br /><strong>Message</strong><br />".$message."<br /></td></tr></table>";
	$bodymessage.="</body></html>";

	//Send mail
	echo ($app->send_mail($destinataires,$subject,$bodymessage)) ? 'valide' : 'error';