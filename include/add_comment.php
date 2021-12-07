<?php
/**
 * Insert an event into the database.
 */
include 'functions.php';

$dbh = db_connection();
$sth = $dbh->prepare('INSERT INTO comments(id_snapshot, user, comment) 
                      VALUES(:id_snapshot, :user, :comment)');
$data = array(
	'id_snapshot'  => $_POST['id'],
	'user' => $_POST['user'],
	'comment' => $_POST['comment']
);
$sth->execute($data);
$sth->closeCursor();
header('Location: ../detail.php?id=' . $_POST['id']);
?>