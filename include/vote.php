<?php
/**
 * Insert an event into the database.
 */
include 'functions.php';

if (!isset($_GET['id']))
	header('Location: ../index.php');

$dbh = db_connection();
if (isset($_GET['up']))
	$sth = $dbh->prepare('UPDATE snapshots SET vote_up = vote_up + 1 WHERE id = :id');
else
	$sth = $dbh->prepare('UPDATE snapshots SET vote_down = vote_down + 1 WHERE id = :id');
$data = array(
	'id' => $_GET['id']
);
$sth->execute($data);
$sth->closeCursor();
header('Location: ../detail.php?id=' . $_GET['id']);
?>