# 2048-js
Un 2048 très basique en JavaScript

## Fonctionnement
+ Téléchargez le repo et l'extraire.
+ Lancer un serveur local à la racine du dossier.
+ Ouvrir l'adresse du serveur dans votre naviagteur web favori
+ Jouer en utilisant les flèches directionnelles du clavier

## Organisation
La logique de jeu est située dans 2048.mjs.  
L'interface, elle, est contenue dans index.mjs. Si jamais vous souhaitez controller différemment les déplacements des cases du plateau, déclenchez la méthode `tilt` dans la bonne direction suite à l'évènement voulu.  
Ex : Un joystick, le changement de rotation d'un gyroscope, la décision d'une IA... 

## Futur
J'ai peu d'idées d'améliorations de ce projet, il est considéré comme fini.  
Idées actuelles :
- Animations de déplacement des cases
- Classe GameController pour faire abstraction des déclenchements "sauvages" de `tilt`
