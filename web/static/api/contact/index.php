<?php
//include the two files
// include_once('classes/sendmail.php');
include_once('config.php');

// header("Access-Control-Allow-Origin: *");
// php://input is a read-only stream that allows you to read raw data from the request body.
$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);

if( empty($_POST['name']) && empty($_POST['email']) ) {
    echo json_encode(
        [
           "sent" => false,
           "message" => $SendMailEmptyerrorMessage
        ]
    ); 
    exit();
}

if ($_POST){
    //@important: Please change this before using
    http_response_code(200);
    $subject = 'Contact from: ' . $_POST['name'];
    $from = $_POST['email'];
    $message = $_POST['message'];       
    //Actual sending email
    // $sendEmail = new Sender($adminEmail, $from, $subject, $message);
    // $sendEmail->send();
    // send email
    mail($adminEmail, $from, $subject, $message);
    // indicate success
    echo json_encode(
        [
           "sent" => true,
           "message" => $SendMailSuccessMessage
        ]
    );
} else {
 // tell the user about error
 echo json_encode(
     [
        "sent" => false,
        "message" => $SendMailFailederrorMessage
     ]
 );
}