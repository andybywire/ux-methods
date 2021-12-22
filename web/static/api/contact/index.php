<?php
$adminEmail =  "contact@dev.uxmethods.org"; // Set this as an ENV variable

$emailTo = $adminEmail;
$emailFrom = $adminEmail;




// Read JSON -- php://input is a read-only stream that allows you to read raw data from the request body.
$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);

// Prevent direct access —— do I need this?
// if (!isset($_POST['submit'])) {
//   echo "<h1>Error</h1>\n
//         <p>Accessing this page directly is not allowed.</p>";
//   exit;
// }

// Detect an empty form —— do I need this?
// if( empty($_POST['name']) && empty($_POST['email']) && empty($_POST['message']) ) {
//   echo json_encode(
//     [
//         "sent" => false,
//         "message" => "The submitted form was empty."
//     ]
//   ); 
//   exit();
// }

if ($_POST){
  $name    = stripslashes(trim($_POST['name']));
  $email   = stripslashes(trim($_POST['email']));
  $subject = stripslashes(trim($_POST['subject']));
  $message = stripslashes(trim($_POST['message']));
  
  $pattern  = '/[\r\n]|Content-Type:|Bcc:|Cc:/i';

  if (preg_match($pattern, $name) || preg_match($pattern, $email) || preg_match($pattern, $subject)) {
    die("Message not sent: Header injection detected.");
  }

  $emailIsValid = preg_match('/^[^0-9][A-z0-9._%+-]+([.][A-z0-9_]+)*[@][A-z0-9_]+([.][A-z0-9_]+)*[.][A-z]{2,6}$/', $email);

  if($name && $email && $emailIsValid && $subject) {
    $subject = "$subject";
    $body = "Name: $name <br /> 
              Email: $email <br /> 
              Message: $message";
    $headers  = 'MIME-Version: 1.1';
    $headers .= 'Content-type: text/html; charset=utf-8';
    $headers .= "From: $emailFrom";
    $headers .= "Return-Path: $emailTo";
    $headers .= "Reply-To: $email";
    $headers .= "X-Mailer: PHP/". phpversion();

    mail($emailTo, $subject, $body, $headers);

    // Send news of our success back to the UI
    echo json_encode(
      [
        "sent" => true,
        "message" => "The message was sent."
      ]
    );
  } else {
    // Tell the user about error
    echo json_encode(
      [
        "sent" => false,
        "message" => "The message was not sent."
      ]
    );
  }


  
//   http_response_code(200); // test removing this
//   $subject = 'Message from ' . $_POST['name'] . 'via UX Methods';
//   $from = $_POST['email'];
//   $message = $_POST['message'];       
//   //Actual sending email
//   // $sendEmail = new Sender($adminEmail, $from, $subject, $message);
//   // $sendEmail->send();
//   // send email
//   mail($adminEmail, $from, $subject, $message);
//   // indicate success
//   echo json_encode(
//     [
//       "sent" => true,
//       "message" => $SendMailSuccessMessage
//     ]
//   );
// } else {
//  // tell the user about error
//  echo json_encode(
//     [
//       "sent" => false,
//       "message" => $SendMailFailederrorMessage
//     ]
//  );
// }