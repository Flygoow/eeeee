<?php
include 'include/functions.php';
if (!isset($_GET['sort']))
    $_GET['sort'] = 'date';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
  <title>Viltis - Projet M3206</title>

  <link href="style.css" rel="stylesheet">
  <!-- <link href="./assets/bootstrap.css" rel="stylesheet"> -->
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css">

</head>
<body>
    <nav>
        <a href="index.php?sort=date">Trier par date</a> / 
        <a href="index.php?sort=vote">Trier par votes</a> / 
        <a href="index.php?sort=depth">Trier par profondeur</a> / 
        <a href="editor.html">Nouvelle image</a>
    </nav>
    
<?php
$dbh = db_connection();
if ($_GET['sort'] == 'date')
    $sth = $dbh->prepare('SELECT snapshots.*, COUNT(comments.id) AS comment_count FROM snapshots LEFT JOIN comments ON snapshots.id = comments.id_snapshot GROUP BY snapshots.id ORDER BY time DESC');
else if ($_GET['sort'] == 'vote')
    $sth = $dbh->prepare('SELECT snapshots.*, COUNT(comments.id) AS comment_count FROM snapshots LEFT JOIN comments ON snapshots.id = comments.id_snapshot GROUP BY snapshots.id ORDER BY vote_up DESC');
else if ($_GET['sort'] == 'depth')
    $sth = $dbh->prepare('SELECT snapshots.*, COUNT(comments.id) AS comment_count FROM snapshots LEFT JOIN comments ON snapshots.id = comments.id_snapshot GROUP BY snapshots.id ORDER BY scale DESC');
// $data = array('login'  => $_SESSION['login']);
// $sth->debugDumpParams();
$sth->execute();
if ($sth->rowCount() == 0)
{
    echo '<p>Pas d\'images encore</p>';
}
while ($row = $sth->fetch()) {
    $date = new DateTime($row['time']);
    // var_dump($row);
?>  
    <div>
        <a href="detail.php?id=<?php echo $row['id']; ?>">
            <img src="snapshots/<?php echo $row['id']; ?>.png">
        </a>
        <ul>
            <li>Auteur : <?php echo $row['user']; ?></li>
            <li>Description : <?php echo $row['description']; ?></li>
            <li><?php echo elapsed_time($date); ?></li>
            <li>Votes : +<?php echo $row['vote_up']; ?> / -<?php echo $row['vote_down']; ?></li>
            <li><?php echo $row['comment_count']; ?> commentaire(s)</li>
        </ul>
    </div>
<?php
}
$sth->closeCursor();
?>
</body>
</html>