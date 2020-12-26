class Vector2{
	constructor(x = 0, y = 0){
		this.x = x;
		this.y = y;
	}

	/**
	 * Compare le vecteur actuel avec un autre
	 * @param {Vector2} v Le vecteur à comparer
	 */
	static equals = (a, b)=>{
		return (a.x === b.x && a.y === b.y);
	}
}

class Direction extends Vector2{}

class Position extends Vector2{
	/**
	 * Créer une position égale à la présente déplacée dans la direction donnée
	 * @param {Direction} direction 
	 */
	add = (direction)=>{
		return new Position(this.x + direction.x, this.y + direction.y);
	}
}

class Case{
	constructor(value = 0){
		this.value = value;
	}
}

/**
 * Créer une range de pas 1 ou -1
 * @param {number} start 
 * @param {number} stop 
 */ 
function getRange(start, stop){
	let range = new Array();
	let sigAmp = stop - start;
	let amp = Math.abs(sigAmp);
	let stp = Math.sign(sigAmp);
	for (let i = 0; i < amp; i += stp){
		range.push(start+i);
	}
	return range;
}

export class Game extends EventTarget{

	// Couleurs d'affichage
	borderColor = '#DDDDDD';
	caseColors = new Map([
		[0, '#D6D2D2']
	]);

	// Paramètres de logique de jeu
	cases   = [];  // Matrice de cases
	rows    = 4;   // Nombre de cases par colonne
	columns = 4;   // Nombre de cases par ligne
	moves   = 0;
	
	// Paramètres d'affichage
	canvas     = null;
	ctx        = null;
	borderSize = 5;
	caseWidth  = 0;
	caseHeight = 0;
	gameWidth  = 0;
	gameHeight = 0;
	
	// Directions de déplacements possibles
	static directions = {
		up   : new Direction(0, -1),
		down : new Direction(0,  1),
		left : new Direction(-1, 0),
		right: new Direction(1,  0),
		still: new Direction(0,  0)
	};
	
	/**
	 * Représente une partie de 2048
	 * @param {number} columns 
	 * @param {number} rows 
	 * @param {HTMLCanvasElement} canvas 
	 */
	constructor(columns, rows, canvas){
		super();

		// Initialiser les paramètres
		this.rows    = rows;
		this.columns = columns;
		
		// Initialiser le canvas
		this.canvas        = canvas;
		this.canvas.height = this.gameWidth;
		this.canvas.width  = this.gameHeight;
		this.ctx           = this.canvas.getContext("2d");
		
		// Initialiser les couleurs
		this.initializeColors(20);

		// Canvas redimensionné et redessiné avec la fenêtre
		this.updateCanvasRenderSize();
		window.addEventListener("resize", ()=>{
			this.updateCanvasRenderSize();
			this.updateCanvasDisplay();
		});
	}

	/**
	 * Générer les couleurs du jeu
	 * @param {number} steps Le nombre de couleurs à générer
	 */
	initializeColors = (steps = 10)=>{
		let maxHue = 360;
		let stepSize = maxHue / steps;
		for (let i=0; i<steps; i++){
			let angle = i * stepSize;
			let power = Math.pow(2, i+1);
			let color = `hsl(${angle}, 80%, 50%)`;
			this.caseColors.set(power, color);
		}
	}

	/**
	 * Initialise les cases de la grille de jeu
	 */
	initializeCases = ()=>{
		// Initialiser les cases
		this.cases.length = 0;
		for (let x=0; x<this.rows; x++){
			// Initialiser les lignes
			this.cases.push( new Array() );
			// Initialiser les colonnes
			for (let y=0; y<this.rows; y++){
				this.cases[x].push( new Case() );
			}
		}
	}

	/**
	 * Initialise le jeu en entier
	 */
	initializeGame = ()=>{
		// Initialiser
		this.moves = 0;
		this.initializeCases();
		this.addRandomCase();
		this.updateCanvasDisplay();
		// Déclencher l'évenement start
		this._onStart();
	}

	/**
	 * Appelle le callback sur chaque case. 
	 * Si le callback renvoie false la boucle s'arrête.
	 * @param {function} callback
	 * @param {number} orderX 1: gauche -> droite, -1: inverse
	 * @param {number} orderY 1: haut -> bas, -1: inverse
	 * @returns {boolean} false si interrompu en cours de boucle, true sinon 
	 */
	eachCase = (callback, orderX = 1, orderY = 1)=>{
		// Ordre normal  : 0,   1,   2, ... N
		// Ordre inversé : N, N-1, N-2, ... 0
		let xs = getRange(0, this.columns);
		let ys = getRange(0, this.rows);
		if (orderX < 0){xs.reverse();}
		if (orderY < 0){ys.reverse();}
		for (let x of xs){
			for (let y of ys){
				let callbackReturn = callback(this.cases[x][y], x, y);
				if (callbackReturn === false){
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Obtenir la case qui est à une position donnée
	 * @param {Position} position
	 * @returns {Case}
	 */
	getCaseAtPos = (position)=>{
		let c = this.cases[position.x][position.y];
		return c;
	}

	/**
	 * Obtenir les cases voisines de la position donnée
	 * @param position 
	 * @returns {Case[]}
	 */
	getNeighbours = (position)=>{
		let neighbours = [];
		const directions = [
			Game.directions.up,
			Game.directions.left,
			Game.directions.right,
			Game.directions.down
		];
		for (let direction of directions){
			let neighbourPos = position.add(direction);
			if (this.isPosInBounds(neighbourPos)){
				neighbours.push(this.getCaseAtPos(neighbourPos));
			}
		}
		return neighbours;
	}

	/**
	 * Teste si une position est dans la grille de jeu
	 * @param {Position} position 
	 * @returns {boolean}
	 */
	isPosInBounds = (position)=>{
		return (
			position.x >= 0 &&
			position.y >= 0 &&
			position.x < this.columns &&
			position.y < this.rows
		);
	}

	/**
	 * Obtenir la liste des cases vides
	 * @returns {Position[]}
	 */
	getEmptyCases = ()=>{
		// Donner les cases vides
		let empty = [];
		this.eachCase((c, x, y)=>{
			if (c.value === 0){
				empty.push(new Position(x, y));
			}
		});
		return empty;
	}

	/**
	 * Teste si le jeu est dans un état perdu
	 * @returns {boolean}
	 */
	isGameLost = ()=>{
		// Si les cases ne sont pas toutes pleines, ce n'est pas perdu
		if (this.getEmptyCases().length > 0){ 
			return false; 
		}
		// Si au moins une fusion est possible, ce n'est pas perdu
		let fusionPossible = !this.eachCase((c,x,y)=>{
			// Sortir de la boucle si une fusion est trouvée
			let neighbours = this.getNeighbours(new Position(x,y));
			let neighboursValue = neighbours.map(el => el.value);
			let found = neighboursValue.includes(c.value);
			if (found){ return false; }
		});
		if (fusionPossible){ 
			return false; 
		}
		// Sinon c'est perdu
		return true;
	}

	/**
	 * Ajouter une case "2" dans une position vide
	 * @returns {boolean} true si réussit, false sinon
	 */
	addRandomCase = ()=>{
		let positions = this.getEmptyCases();
		if (positions.length === 0){
			return false;
		}
		let posIndex = Math.round(Math.random() * (positions.length-1));
		let pos = positions[posIndex];
		this.getCaseAtPos(pos).value = 2;
		return true;
	}

	/**
	 * Déplace une case sur le plateau sans fusionner 
	 * @param {Position} origin La position de la case au départ
	 * @param {Direction} direction La direction du déplacement
	 * @returns {Position} La position après le déplacement
	 */
	slideCaseOnEmpty = (origin, direction)=>{
		let valueAtOrigin = this.getCaseAtPos(origin).value;
		let originEqualsDestination = true;
		// Si à l'origine il y a un vide, on ne le bouge pas.
		if (valueAtOrigin === 0){ return origin; }
		// On bouge le plus possible la case dans la direction
		// tant que l'on est sur du vide.
		let destination = origin;
		let next        = origin.add(direction);
		while (
			this.isPosInBounds(next) && 
			this.getCaseAtPos(next).value === 0
		){
			// Validation du déplacement
			originEqualsDestination = false; 
			destination = next;
			// Nouveau déplacement
			next = next.add(direction);
		}
		// Appliquer le déplacement
		if (!originEqualsDestination){
			this.getCaseAtPos(destination).value = valueAtOrigin;
			this.getCaseAtPos(origin).value = 0;
		}
		return destination;
	}

	/**
	 * Glisse une case sur le plateau pour la fusionner 
	 * @param {Position} origin La position de la case au départ
	 * @param {Direction} direction La direction du déplacement
	 * @returns {Position} La position après le déplacement
	 */
	slideCaseOnSame = (origin, direction)=>{
		let valueAtOrigin = this.getCaseAtPos(origin).value;
		let originEqualsDestination = true;
		// Si à l'origine il y a un vide, on ne le bouge pas.
		if (valueAtOrigin === 0){ return origin;}
		// On bouge dans la direction si on peut fusionner
		let destination   = origin;
		let next          = origin.add(direction);
		if (
			this.isPosInBounds(next) &&
			this.getCaseAtPos(next).value === valueAtOrigin 
		){
			originEqualsDestination = false;
			destination = next;
		}
		// Appliquer le déplacement
		if (!originEqualsDestination){
			this.getCaseAtPos(destination).value = valueAtOrigin * 2;
			this.getCaseAtPos(origin).value = 0;
		}
		return destination;
	}

	/**
	 * Glisser les cases du plateau dans un sens
	 * Ne doit pas être appelée telle quel, utiliser tilt plutôt.
	 * @param {Direction} direction - Déplacement x et y (norme 1)
	 * @returns {boolean} false si aucune case n'a bougé, true sinon
	 */
	slide = (direction)=>{
		let hasChanged = false;
		this.eachCase(
			(c,x,y)=>{
				// Si la case est vide, on l'ignore
				if (!c.value) return;
				// Effectuer les déplacements
				let origin = new Position(x,y);
				let slided = this.slideCaseOnEmpty(origin, direction);
				let merged = this.slideCaseOnSame(slided, direction);
				// Se rappeler si on a bougé
				if (origin !== merged){ hasChanged = true; }
			}, 
			-direction.x, 
			-direction.y
		);
		return hasChanged;
	}

	/**
	 * Initier le déplacement des cases du plateau par l'utilisateur
	 * @param {Direction} direction 
	 */
	tilt = (direction)=>{
		// Glisser le plateau
		let hasMoved = this.slide(direction);
		if (hasMoved){
			this.moves++;
			// Ajouter une case
			let isCaseAdded = this.addRandomCase();
			// Afficher le nouvel état
			this.updateCanvasDisplay();
			// Déclencher _onLose si on a perdu
			if (this.isGameLost()){
				this._onLose();
			}
		}
	}

	/**
	 * Donne le score actuel de la partie
	 * @returns {number} la somme des cases
	 */
	getScore = ()=>{
		let sum = 0;
		this.eachCase((c)=>{
			sum += c.value;
		});
		return sum;
	}

	/**
	 * Donne la valeur de la case la plus grande
	 * @returns {number}
	 */
	getMaxCase = ()=>{
		let max = 0;
		this.eachCase((c)=>{
			if (c.value > max){
				max = c.value;
			}
		});
		return max;
	}

	/**
	 * A exécuter quand une partie commence
	 */
	_onStart = ()=>{
		// Emettre l'évenement "start"
		let e = new CustomEvent("start");
		this.dispatchEvent(e);
	}

	/**
	 * A exécuter quand une partie est perdue
	 */
	_onLose = ()=>{
		const score = this.getScore();
		const max = this.getMaxCase();
		// Emettre l'évenement "lose"
		let e = new CustomEvent("lose", {
			detail: {
				moves: this.moves,
				score: score,
				max: max,
			}
		});
		this.dispatchEvent(e);
	}

	/**
	 * Mettre à jour la dimension d'affichage du canvas
	 */
	updateCanvasRenderSize = ()=>{
		console.log("Mise à jour de la taille du canvas");
		const rect      = this.canvas.getBoundingClientRect();
		this.gameWidth  = rect.width;
		this.gameHeight = rect.height;
		this.caseWidth  = this.gameWidth / this.columns;
		this.caseHeight = this.gameHeight / this.rows;
		this.canvas.width = this.gameWidth;
		this.canvas.height = this.gameHeight;
	}

	/**
	 * Afficher dans le canvas l'état actuel du jeu
	 */
	updateCanvasDisplay = ()=>{
		// Police d'écriture
		this.ctx.textAlign    = "center";
		this.ctx.textBaseline = "middle"
		this.ctx.font         = `bold 30px \"Roboto Mono\"`;
		// Fond de l'affichage
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
		// Affichage des cases
		this.eachCase(
			(c, x, y)=>{
				// Fond de case
				this.ctx.fillStyle = this.caseColors.get(c.value); 
				this.ctx.fillRect(
					x * this.caseWidth, 
					y * this.caseHeight, 
					this.caseWidth, 
					this.caseHeight
				);
				// Bordure de case
				this.ctx.strokeStyle = this.borderColor;
				this.ctx.lineWidth   = this.borderSize;
				this.ctx.strokeRect(
					x * this.caseWidth + 0.5 * this.borderSize, 
					y * this.caseHeight + 0.5 * this.borderSize, 
					this.caseWidth - this.borderSize, 
					this.caseHeight - this.borderSize
				);
				// Texte de case
				this.ctx.fillStyle = '#000000';
				if (c.value){
					this.ctx.fillText(
						c.value, 
						(x + 0.5) * this.caseWidth, 
						(y + 0.5) * this.caseHeight
					);
				}
			}
		);
	}

}