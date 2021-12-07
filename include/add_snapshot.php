<?php
/**
 * Add the snapshot to the database and make the PNG file
 */

include 'functions.php';

$dbh = db_connection();
$sth = $dbh->prepare('INSERT INTO snapshots(user, description, cx, cy, scale, maxiter, vote_up, vote_down) 
                      VALUES(:user, :description, :cx, :cy, :scale, :maxiter, :vote_up, :vote_down)');
$data = array(
	'user'  => $_POST['author'],
	'description' => $_POST['description'],
	'cx' => doubleval($_POST['cx']),
	'cy' => doubleval($_POST['cy']),
	'scale' => intval($_POST['scale']),
	'maxiter' => intval($_POST['maxiter']),
	'vote_up' => 0,
	'vote_down' => 0
);
$sth->execute($data);
print_r($sth->errorInfo());
$sth->closeCursor();
$fn = $dbh->lastInsertId() . '.png';

$img = $_POST['snapshot'];
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);
$file = "../snapshots/" . $fn;
$success = file_put_contents($file, $data);
header('Location: ../index.php');
?>

