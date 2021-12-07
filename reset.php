<?php
include 'include/functions.php';

$bdd = db_connection();
// remove the tables
$sth = $bdd->exec('DROP TABLE IF EXISTS `snapshots`');
$sth = $bdd->exec('DROP TABLE IF EXISTS `comments`');
// create tables
$sth = $bdd->exec('CREATE TABLE `snapshots` (`id` int(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY, `user` varchar(50) NOT NULL, `description` TEXT NOT NULL, `time` timestamp NOT NULL DEFAULT current_timestamp(), `cx` double NOT NULL, `cy` double NOT NULL, `maxiter` int(11) NOT NULL, `scale` double NOT NULL, `vote_up` int(11) NOT NULL, `vote_down` int(11) NOT NULL)');

$sth = $bdd->exec('CREATE TABLE `comments` (`id` int(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY, `id_snapshot` int(11) NOT NULL, `user` varchar(50) NOT NULL, `comment` text NOT NULL, `date` timestamp NOT NULL DEFAULT current_timestamp())');

header('Location: index.php');
?>