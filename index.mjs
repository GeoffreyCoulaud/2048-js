import { KeyboardGameController } from "./controllers.mjs";
import { GameResult, GameInfos } from "./informations.mjs";
import { Game } from "./game.mjs";

// Créer le controlleur de jeu au clavier
const ctrl = new KeyboardGameController();

// Créer l'affichage des informations 
const infosEl = document.getElementById("stats");
const infos   = new GameInfos(infosEl);

// Créer le jeu
const sizeSelect = document.getElementById("gameSizeSelect");
const canvas   = document.getElementById("display");
const gameSize = [parseInt(sizeSelect.value), parseInt(sizeSelect.value)];
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
	infos.printLine(`Score : ${e.score}`);
	infos.printLine(`Moyenne case max : ${infos.results.averageMax}`);
});

// Démarrer le jeu
game.start();

// Ecouter le choix de taille de grille
sizeSelect.addEventListener("change", (event)=>{
	let size = parseInt(event.currentTarget.value);
	game.isPaused = true;
	game.columns = size;
	game.rows = size;
	game.start();
});