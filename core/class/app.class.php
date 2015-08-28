<?php

	/**
	 * Class app
	 */
	class app{


		/**
		 * SEND AN EMAIL
		 *
		 * @access public
		 * @param string $destinataire
		 * @param string $subject
		 * @param string $message
		 * @return bool
		 */
		public function send_mail($destinataire,$subject,$message){

			$valid = false;

			//IF PARAMETERS AVAILABLE
			if(isset($destinataire) && isset($subject) && isset($message)){

				//PHPMAILER
				require_once APP_CORE.'class/phpmailer/PHPMailerAutoload.php';

				//VARIABLES
				$mail = new PHPMailer;

				$mail->isSMTP();
				$mail->Host = MAILER_SMTP;
				$mail->SMTPAuth = true;
				$mail->Username = MAILER_USER;
				$mail->Password = MAILER_PASS;
				$mail->Port = MAILER_PORT;

				$mail->From = MAILER_FROM;
				$mail->FromName = MAILER_NAME;
				$mail->addReplyTo(MAILER_REPLY, MAILER_NAME);
				$mail->isHTML(true);
				$mail->addAddress($destinataire);

				$mail->Subject = $subject;
				$mail->Body    = $message;
				$mail->AltBody = $message;

				//SEND MAIL
				if($mail->send()) $valid = true;
			}
			return $valid;
		}

	}