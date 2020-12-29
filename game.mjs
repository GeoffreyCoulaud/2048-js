import { GameStartEvent, GameEndEvent, AfterTiltEvent } from "./events.mjs";
import { AnimationStep, AnimatedProperty } from "./animations.mjs";
import { Direction, Position } from "./geometry.mjs";
import { GameController } from "./controllers.mjs";

const SECOND = 1000;

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

class Case{
	animations = {
		position: null,
		scale: null,
	};

	get hasFinishedAnimations(){
		for (let name in this.animations){
			if (this.animations[name] === null){ 
				continue; 
			} else if (this.animations[name].progression < 1) {
				return false;
			}
		}
	}
	
	constructor(value = 0){
		this.value = value;
	}
}

/**
 * Jeu de 2048
 */
export class Game extends EventTarget{

	// Couleurs d'affichage
	borderColor = '#DDDDDD';
	caseColors = new Map([
		[0, '#D6D2D2']
	]);

	// Paramètres de logique de jeu
	isOngoing = false;
	isPaused  = false;
	cases     = [];     // Matrice de cases
	rows      = 4;      // Nombre de cases par colonne
	columns   = 4;      // Nombre de cases par ligne
	moves     = 0;
	
	// Paramètres d'affichage
	lastDirection     = Direction.still;
	canvas            = null;
	ctx               = null;
	borderSize        = 5;
	caseWidth         = 0;
	caseHeight        = 0;
	animationDuration = 0.1 * SECOND;

	// -------------------------------------------------------------------------
	// getters

	get hasFinishedAnimations(){
		return this.eachCase((c)=>{
			return c.hasFinishedAnimations;
		})
	}
	get score(){
		let sum = 0;
		this.eachCase((c)=>{ sum += c.value; });
		return sum;
	}
	get maxCase(){
		let max = 0;
		this.eachCase((c)=>{
			if (c.value > max){
				max = c.value;
			}
		});
		return max;
	}
	get isInLosingState(){
		// Si les cases ne sont pas toutes pleines, ce n'est pas perdu
		if (this.emptyCases.length > 0){ 
			return false; 
		}
		// Si au moins une fusion est possible, ce n'est pas perdu
		let foundFusion = false;
		this.eachCase((c, pos)=>{
			let values = this.getNeighbours(pos).map(el => el.value);
			if (values.includes(c.value)){
				foundFusion = true;
				return false; 
			}
		});
		if (foundFusion){ 
			return false; 
		}
		// Sinon c'est perdu
		return true;
	}
	get emptyCases(){
		let empty = [];
		this.eachCase((c, pos)=>{
			if (c.value === 0){
				empty.push(pos);
			}
		});
		return empty;
	}

	// -------------------------------------------------------------------------
	// Constructor

	/**
	 * @param {number} columns            nombre de colonne de jeu
	 * @param {number} rows               nombre de lignes de jeu
	 * @param {HTMLCanvasElement} canvas  canvas où est affiché le jeu
	 * @param {GameController} controller controlleur de jeu
	 */
	constructor(columns, rows, canvas, controller){
		super();

		// Initialiser les paramètres
		this.rows    = rows;
		this.columns = columns;
		
		// Initialiser le canvas
		this.canvas = canvas;
		this.ctx    = this.canvas.getContext("2d");
		
		// Initialiser les couleurs
		this._initializeColors(20);

		// Canvas redimensionné et redessiné avec la fenêtre
		window.addEventListener("resize", ()=>{
			this._updateCanvasRenderSize();
			this._updateCaseSize();
			this._updateCanvasDisplay();
		});

		// Controlleur de jeu qui déclenche les mouvements,
		// la mise en pause et le reset de partie (restart) 
		controller.addEventListener("tilt", (event)=>{
			if (this.isOngoing && !this.isPaused){
				this.tilt(event.direction);
			}
		});
		controller.addEventListener("pause", ()=>{
			console.log(this.isPaused);
			this.isPaused = !this.isPaused;
		})
		controller.addEventListener("restart", ()=>{
			this._onEnd();
			this.start();
		});
	}

	// -------------------------------------------------------------------------
	// General

	/**
	 * Appelle le callback sur chaque case. 
	 * Si le callback renvoie false la boucle s'arrête.
	 * @param {function} callback
	 * @param {number} orderX 1: gauche -> droite, -1: inverse
	 * @param {number} orderY 1: haut -> bas, -1: inverse
	 * @returns {boolean} false si interrompu en cours de boucle, true sinon 
	 * @public
	 * @method
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
				let cr = callback(this.cases[x][y], new Position(x, y));
				if (cr === false){
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
	 * @public
	 * @method
	 */
	caseFromPosition = (position)=>{ 
		return this.cases[position.x][position.y];
	}

	/**
	 * Obtenir les cases voisines de la position donnée
	 * @param position 
	 * @returns {Case[]}
	 * @public
	 * @method
	 */
	getNeighbours = (position)=>{
		let neighbours = [];
		for (let name of Direction.cardinals){
			let direction = Direction[name];
			let neighbourPos = position.add(direction);
			if (this.isPosInBounds(neighbourPos)){
				neighbours.push(this.caseFromPosition(neighbourPos));
			}
		}
		return neighbours;
	}

	/**
	 * Teste si une position est dans la grille de jeu
	 * @param {Position} position 
	 * @returns {boolean}
	 * @public
	 * @method
	 */
	isPosInBounds = (position)=>{
		return (
			position.x >= 0 &&
			position.y >= 0 &&
			position.x < this.columns &&
			position.y < this.rows
		);
	}

	// -------------------------------------------------------------------------
	// Initialisation

	/**
	 * Générer les couleurs du jeu
	 * @param {number} steps Le nombre de couleurs à générer
	 */
	_initializeColors = (steps = 10)=>{
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
	_initializeCases = ()=>{
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
	 * @method
	 * @public
	 */
	start = ()=>{
		// Initialize
		this.moves     = 0;
		this.isOngoing = true;
		this.isPaused  = false;
		this._initializeCases();
		this._updateCanvasRenderSize();
		this._updateCaseSize();
		this._updateCanvasDisplay();
		// Start
		this._addRandomCase();
		this._displayLoop();
		this.dispatchEvent(new GameStartEvent());
	}

	// -------------------------------------------------------------------------
	// Game logic

	/**
	 * Ajouter une case "2" dans une position vide
	 * @returns {null|Position} null si échoue, la position d'ajout sinon
	 * @private
	 * @method
	 */
	_addRandomCase = ()=>{
		// Obtenir les positions possibles
		let positions = this.emptyCases;
		if (positions.length === 0){
			return null;
		}
		// Choisir une position 
		let posIndex = Math.round(Math.random() * (positions.length-1));
		let pos = positions[posIndex];
		// Appliquer la valeur et une animation de grossissement
		this.caseFromPosition(pos).value = 2;
		this.caseFromPosition(pos).animations.scale = new AnimatedProperty(
			new AnimationStep(0, Date.now()),
			new AnimationStep(1, Date.now() + this.animationDuration)
		);
		return pos;
	}

	/**
	 * Obtenir la nouvelle place d'une une case sur le plateau quand
	 * on l'a faite glisser dans une direction autant que possible 
	 * sans fusionner.
	 * @param {Position} origin La position de la case au départ
	 * @param {Direction} direction La direction du déplacement
	 * @returns {Position} La position après le déplacement
	 * @private
	 * @method
	 */
	_getPosSlideEmpty = (origin, direction)=>{
		let valueAtOrigin = this.caseFromPosition(origin).value;
		// On bouge le plus possible la case dans la direction
		// tant que l'on est sur du vide.
		let destination = origin;
		let next = origin.add(direction);
		while (
			this.isPosInBounds(next) && 
			this.caseFromPosition(next).value === 0
		){
			// Validation du déplacement
			destination = next;
			// Nouveau déplacement
			next = next.add(direction);
		}
		// Retourner la destination
		return destination;
	}

	/**
	 * Obtenir la nouvelle place d'une une case sur le plateau quand
	 * on l'a faite glisser dans une direction pour fusionner 
	 * @param {Position} origin La position de la case au départ
	 * @param {Direction} direction La direction du déplacement
	 * @returns {Position} La position après le déplacement
	 * @private
	 * @method
	 */
	_getPosSlideMerge = (origin, value, direction)=>{
		// On bouge dans la direction si on peut fusionner
		let destination = origin;
		let next = origin.add(direction);
		if (
			this.isPosInBounds(next) &&
			this.caseFromPosition(next).value === value 
		){
			destination = next;
		}
		// Retourner la destination
		return destination;
	}

	/**
	 * Glisser les cases du plateau dans un sens
	 * @param {Direction} direction - Déplacement x et y (norme 1)
	 * @returns {boolean} false si aucune case n'a bougé, true sinon
	 * @private
	 * @method
	 */
	_slide = (direction)=>{
		let gameStateChanged = false;
		this.eachCase((c,origin)=>{
			// Si la case est vide, on l'ignore
			if (!c.value) { return; }
			// Obtenir la nouvelle position après glissement
			let slided = this._getPosSlideEmpty(origin, direction);
			let merged = this._getPosSlideMerge(slided, c.value, direction);
			// Détecter le type de changement
			let hasChanged = origin !== merged;
			let hasMerged = slided !== merged;
			gameStateChanged ||= hasChanged;
			if (!hasChanged){ return; }
			// Déplacer la case dans la matrice de jeu
			let newValue = hasMerged ? c.value*2 : c.value;
			this.caseFromPosition(origin).value = 0;
			this.caseFromPosition(merged).value = newValue;
			// Appliquer l'animation de position à la case
			const st = Date.now();
			const et = st + this.animationDuration;
			this.caseFromPosition(merged).animations.position = 
				new AnimatedProperty(
					new AnimationStep(origin, st),
					new AnimationStep(merged, et),
				);
		}, -direction.x, -direction.y);
		return gameStateChanged;
	}

	/**
	 * Initier le déplacement des cases du plateau par l'utilisateur
	 * @param {Direction} direction 
	 * @public
	 * @method
	 */
	tilt = (direction)=>{
		// Glisser le plateau
		const hasChanged = this._slide(direction);
		// Réagir au glissement
		this.lastDirection = direction;
		this.moves++;
		this.dispatchEvent(new AfterTiltEvent(hasChanged));
		// Actions dans le cas où le glissement a fait changer le plateau
		if (hasChanged){
			// Ajouter une case
			this._addRandomCase();
			// Déclencher _onLose si on a perdu
			if (this.isInLosingState){
				this._onEnd();
			}
		}
	}

	// -------------------------------------------------------------------------
	// Display

	
	/**
	 * Mettre à jour la dimension d'affichage du canvas
	 * @private
	 * @method
	 */
	_updateCanvasRenderSize = ()=>{		
		let rect = this.canvas.getBoundingClientRect();
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;
	}
	
	/**
	 * Mettre à jour la dimension des cases
	 * @private
	 * @method
	 */
	_updateCaseSize = ()=>{
		this.caseWidth  = this.canvas.width / this.columns;
		this.caseHeight = this.canvas.height / this.rows;
	}
	
	/**
	 * Afficher dans le canvas l'état actuel du jeu
	 * @private
	 * @method
	 */
	_updateCanvasDisplay = ()=>{
		// Police d'écriture des cases
		this.ctx.textAlign    = "center";
		this.ctx.textBaseline = "middle"
		this.ctx.font         = `bold 30px \"Roboto Mono\"`;
		
		// Fond de l'affichage
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		// Affichage des cases
		this.eachCase((c, gamePos)=>{
			
			// Obtenir la position de grille et la position animée
			let dispPos = gamePos;
			if (c.animations.position !== null){
				dispPos = c.animations.position.currentValue; 
			}
			
			// Obtenir la taille de case animée
			let scale = 1;
			if (c.animations.scale !== null){
				scale = c.animations.scale.currentValue;
			}
			const scaledWidth = scale * this.caseWidth;
			const scaledHeight = scale * this.caseHeight;
			const smx = (this.caseWidth - scaledWidth) / 2;
			const smy = (this.caseHeight - scaledHeight) / 2;
			
			// Fond gris de la case (fixe)
			if (c.animations.scale || c.animations.position){
				this.ctx.fillStyle = this.caseColors.get(0); 
				this.ctx.fillRect(
					gamePos.x * this.caseWidth, 
					gamePos.y * this.caseHeight, 
					this.caseWidth, 
					this.caseHeight
				);
			}
			
			// Fond coloré de case
			this.ctx.fillStyle = this.caseColors.get(c.value); 
			this.ctx.fillRect(
				dispPos.x * this.caseWidth + smx,
				dispPos.y * this.caseWidth + smy, 
				scaledWidth, 
				scaledWidth
			);
			
			// Bordure de case
			this.ctx.strokeStyle = this.borderColor;
			this.ctx.lineWidth   = this.borderSize;
			this.ctx.strokeRect(
				dispPos.x * this.caseWidth + smx + 0.5 * this.borderSize, 
				dispPos.y * this.caseHeight + smy + 0.5 * this.borderSize, 
				Math.max(0, scaledWidth - this.borderSize), 
				Math.max(0, scaledHeight - this.borderSize)
			);
			
			// Texte de case
			if (c.value){
				this.ctx.fillStyle = '#000000';
				this.ctx.fillText(
					c.value, 
					(dispPos.x + 0.5) * this.caseWidth, 
					(dispPos.y + 0.5) * this.caseHeight
				);
			}
		}, this.lastDirection.x, this.lastDirection.y);

		// Affichage de l'indication de pause
		if (this.isPaused){
			this.ctx.textAlign    = "left";
			this.ctx.textBaseline = "middle"
			this.ctx.font         = `15px \"Roboto Mono\"`;
			this.ctx.fillStyle    = '#000000';
			this.ctx.fillText(
				"EN PAUSE",
				this.canvas.width * 0.05,
				this.canvas.height * 0.05
			)
		}
	}

	/**
	 * Boucle d'affichage chaque image tant que le jeu est en cours.
	 * @private
	 * @method
	 */
	_displayLoop = ()=>{
		this._updateCanvasDisplay();
		// On raffiche si on a pas perdu
		// Ou si au moins une animation est en cours
		if (this.isOngoing || !this.hasFinishedAnimations){
			window.requestAnimationFrame(this._displayLoop);
		}
	}

	// -------------------------------------------------------------------------
	// Events

	/**
	 * Raccourci pour la méthode addEventListener
	 * @param eventName Nom de l'évènement à écouter
	 * @param callback  Fonction à exécuter
	 * @public
	 * @method 
	 */
	on = (eventName, callback)=>{
		this.addEventListener(eventName, callback);
	}

	/**
	 * A exécuter quand une partie est terminée
	 * @private
	 * @method
	 */
	_onEnd = ()=>{
		this.isOngoing = false;
		this.isPaused = false;
		const score = this.score;
		const max   = this.maxCase;
		const moves = this.moves;
		this.dispatchEvent(new GameEndEvent(score, max, moves));
	}

}