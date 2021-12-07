<?php
include 'include/functions.php';
if (!isset($_GET['id']))
    header('Location: index.php');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Projet M3206</title>
</head>
<body>
    <nav>
        <a href="index.php">Accueil</a> / <a href="editor.html">Nouvelle image</a>
    </nav>
<?php
$dbh = db_connection();
$sth = $dbh->prepare('SELECT * FROM snapshots WHERE id = :id ORDER BY time DESC');
$sth->execute(array('id' => $_GET['id']));
if ($sth->rowCount() == 0) {
    echo '<p>Pas d\'image</p>';
}
$row = $sth->fetch();
$date = new DateTime($row['time']);
?>  
    <div>
        <img src="snapshots/<?php echo $row['id']; ?>.png">
        <ul>
            <li>Auteur : <?php echo $row['user']; ?></li>
            <li>Description : <?php echo $row['description']; ?></li>
            <li><?php echo elapsed_time($date); ?></li>
            <li>x = <?php echo $row['cx']; ?></li>
            <li>y = <?php echo $row['cy']; ?></li>
            <li>zoom : <?php echo $row['scale']; ?></li>
            <li>iterations : <?php echo $row['maxiter']; ?></li>
            <li>
                Votes : 
                <?php
                echo '<a href="include/vote.php?id=' . $row['id']  . '&up">+ ' . $row['vote_up'] . '</a>';
                echo ' / '; 
                echo '<a href="include/vote.php?id=' . $row['id']  . '&down">- ' . $row['vote_down'] . '</a>';
                ?>
            </li>
        </ul>
    </div>
<?php

$sth = $dbh->prepare('SELECT * FROM comments WHERE id_snapshot = :id ORDER BY date DESC');
$sth->execute(array('id' => $_GET['id']));
while ($row = $sth->fetch()) {
    $date = new DateTime($row['date']);
?>  
    <ul>
        <li>User : <?php echo $row['user']; ?></li>
        <li>Commentaire : <?php echo $row['comment']; ?></li>
        <li><?php echo elapsed_time($date); ?></li>
    </ul>
<?php
}
$sth->closeCursor();
?>
    <p>
        Laisser un commentaire ?
    </p>
    <form method="post" action="include/add_comment.php">
        <label for="_nom">Nom :</label>
        <input id="_nom" type="text" name="user">
        <label for="_comment">Commentaire :</label>
        <textarea id="_comment" name="comment"></textarea>
        <input type="hidden" name="id" value="<?php echo $_GET['id']; ?>">
        <input type="submit" value="Ajouter">
    </form>
</body>
</html>