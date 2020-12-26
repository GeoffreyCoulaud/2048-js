import { Game } from "./2048.mjs";

/**
 * Créer un nouvel élément DOM contenant du texte 
 * @param {string} name le tagName de l'élément 
 * @param {string} text le texte à l'intérieur de l'élément
 */
function textEl(name, text){
	let elem = document.createElement(name);
	let txt = document.createTextNode(text);
	elem.appendChild(txt);
	return elem;
}

/**
 * Représente un résultat de partie
 */
class GameResult{
	constructor(score, moves, max){
		this.score = score;
		this.moves = moves;
		this.max = max;
	}
}

/**
 * Représente un array de résultats de partie
 */
class GameResultArray extends Array{
	getAverageProp = (name)=>{
		let sum = 0;
		for (let res of this){ sum += res[name]; }
		return sum / this.length;
	}
	get averageScore(){
		return this.getAverageProp("score");
	}
	get averageMax(){
		return this.getAverageProp("max");
	}
}

// -----------------------------------------------------------------------------

let statsElem = document.getElementById("stats");
let game      = new Game(5, 5, document.getElementById("display"));
let results   = new GameResultArray();

function addStatLine(text, emphasis = false){
	statsElem.appendChild(
		textEl(
			emphasis ? "strong" : "span", 
			text
		)
	);
}

// Ecouter les touches de clavier
document.addEventListener("keydown", (event)=>{
	// Liste des eventKeys pour les touches directionnelles
	const kbeArrowKeys = [
		"ArrowLeft", 
		"ArrowRight", 
		"ArrowUp", 
		"ArrowDown"
	];
	// Réagir aux touches directionnelles
	if (kbeArrowKeys.includes(event.key)){
		// Choisir la bonne direction
		const prefix    = "Arrow";
		const key       = event.key.toLowerCase()
		const name      = key.substring(prefix.length);
		const direction = Game.directions[name];
		// Initier la pente
		game.tilt(direction);
	}
});

// Ecouter le démarrage de jeu
game.addEventListener("start", (event)=>{
	addStatLine("Partie démarrée", true);
});

// Ecouter la perte de jeu
game.addEventListener("lose", (event)=>{
	// Ajouter le score aux résultats
	results.push(new GameResult(
		event.detail.score, 
		event.detail.moves,
		event.detail.max,
	));
	// Afficher le score dans l'affichage de stats
	addStatLine("Partie terminée", true);
	addStatLine(`Case max : ${event.detail.max}`);
	addStatLine(`Moyenne case max : ${results.averageMax}`);
	// Relancer une partie
	game.initializeGame();
});

// Démarrer le jeu
game.initializeGame();