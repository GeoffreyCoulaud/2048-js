import { TiltEvent, RestartEvent, PauseEvent } from "./events.mjs";
import { Direction } from "./geometry.mjs";

/**
 * Controlleur de jeu générique utilisable par 2048-js
 * @emits GameController#tilt
 * @emits GameController#restart
 * @emits GameController#pause
 */
export class GameController extends EventTarget{
	/**
	 * Evènements du controlleur de jeu
	 * @type {object}
	 * @property {TiltEvent} tiltUp
	 * @property {TiltEvent} tiltDown
	 * @property {TiltEvent} tiltLeft
	 * @property {TiltEvent} tiltRight
	 * @property {RestartEvent} restart
	 * @property {PauseEvent} pause
	 * @public
	 */
	events = {
		tiltUp   : new TiltEvent(Direction.up),
		tiltLeft : new TiltEvent(Direction.left),
		tiltDown : new TiltEvent(Direction.down),
		tiltRight: new TiltEvent(Direction.right),
		restart  : new RestartEvent(),
		pause    : new PauseEvent(),
	};
}

/**
 * Controlleur de jeu 2048-js réagissant au clavier
 */
export class KeyboardGameController extends GameController{
	/**
	 * @param {string} leftKey    touche de déplacement gauche
	 * @param {string} upKey      touche de déplacement haut
	 * @param {string} rightKey   touche de déplacement droit
	 * @param {string} downKey    touche de déplacement bas
	 * @param {string} restartKey touche pour redémarrer
	 */
	constructor(
		leftKey = "ArrowLeft",
		upKey = "ArrowUp", 
		rightKey = "ArrowRight", 
		downKey = "ArrowDown", 
		restartKey = "r",
		pauseKey = "Escape"
	){
		// Générer les évènements
		super();
		// Emettre les evenements quand la bonne touche est appuyée
		window.addEventListener("keydown", (event)=>{
			switch (event.key){
				case leftKey:
					this.dispatchEvent(this.events.tiltLeft);
					break;
				case rightKey:
					this.dispatchEvent(this.events.tiltRight);
					break;
				case upKey:
					this.dispatchEvent(this.events.tiltUp);
					break;
				case downKey:
					this.dispatchEvent(this.events.tiltDown);
					break;
				case restartKey:
					this.dispatchEvent(this.events.restart);
					break;
				case pauseKey:
					this.dispatchEvent(this.events.pause);
					break;
			}
		});
	}
}