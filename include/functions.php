<?php

include 'constants.php';
// DATABASE FUNCTIONS

/**
 * Connection to the database
 */
function db_connection() {
    try {
        $dbh = new PDO('mysql:host=' . DB['host'] . ';dbname=' . DB['dbname'] . ';charset=utf8', 
            DB['login'], 
            DB['pwd'], 
            array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
        return $dbh;
    } catch(Exception $e) {
        die('Erreur : ' . $e->getMessage());
    }
}


// TIME FUNCTIONS

/**
 * Number of elapsed days since the given date
 */
function elapsed_time($date) {
    $now = new DateTime();
    $interval = $date->diff($now);
    $days = $interval->days;
    
    if ($days >= 7)
        $str = intdiv($days, 7) . ' semaines';
    else if ($days > 0)
        $str = $days . ' jours';
    else if ($interval->h > 0)
        $str = $interval->h . ' heures';
    else if ($interval->i > 0)
        $str = $interval->i . ' minutes';
    else
        $str = $interval->s . ' secondes';
    return 'Il y a ' . $str;
}
?>