# Mandelbrot

Projet d'intégration multimédia pour le module *M3206 Intégration multimédia*. 

Ce code fournit le coté back-end d'un site web dynamique avec des images, de votes et des commentaires. Toute la partie front-end reste à faire.

## Installation
L'installation est différente si vous travaillez sur un serveur local (XAMPP) ou sur un serveur externe.

### Serveur local
1. Copiez le repertoire racine sur votre dossier `htdocs`.
2. Créez une base de données appelée `mandelbrot` sur votre serveur MySQL avec phpMyAdmin.
3. Importez le fichier `mandelbrot.sql` sur votre base de données.
4. Modifiez le fichier `include/constants.php` pour renseigner vos paramètres de connexion.

### Serveur externe
1. Copiez le repertoire racine sur votre serveur.
2. Importez le fichier `mandelbrot.sql` sur votre base de données.
3. Modifiez le fichier `include/constants.php` pour renseigner vos paramètres de connexion.

## Fonctionnement
La page d'accueil (`index.php`) affiche toutes les images enregistrées avec des statistiques. On peut trier les images selon différents critères.

Quand on clique sur une image, on voit toutes ses informations. On peut voter ou laisser un commentaire.

La page `editor.html` permet d'enregistrer une nouvelle prise de vue de l'[ensemble de Mandelbrot](https://fr.wikipedia.org/wiki/Ensemble_de_Mandelbrot).

## Sources
- [Mandelbrot.js](https://github.com/cslarsen/mandelbrot-js), rendu de l'ensemble de Mandelbrot avec Canvas et JavaScript de base.