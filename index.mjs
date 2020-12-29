import { KeyboardGameController } from "./controllers.mjs";
import { GameResult, GameInfos } from "./informations.mjs";
import { Game } from "./game.mjs";

// Créer le controlleur de jeu au clavier
const keys = ["ArrowLeft", "ArrowUp", "ArrowRight","ArrowDown"];
const ctrl = new KeyboardGameController(...keys);

// Créer l'affichage des informations 
const infosEl = document.getElementById("stats");
const infos   = new GameInfos(infosEl);

// Créer le jeu
const canvas   = document.getElementById("display");
const gameSize = [5,5];
const game     = new Game(...gameSize, canvas, ctrl);

// Ecouter le démarrage de jeu
game.on("start", ()=>{
	infos.printLine("Partie démarrée", true);
});

// Ecouter la perte de jeu
game.on("end", (e)=>{
	// Ajouter le score aux informations
	infos.results.push(new GameResult(e.score, e.moves, e.max,));
	// Afficher le score dans l'affichage des informations
	infos.printLine("Partie terminée", true);
	infos.printLine(`Case max : ${e.max}`);
	infos.printLine(`Moyenne case max : ${infos.results.averageMax}`);
	// Relancer une partie
	game.initializeGame();
});

// Démarrer le jeu
game.initializeGame();