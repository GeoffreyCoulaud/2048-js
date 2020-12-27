import { Direction } from "./geometry.mjs";
import { TiltEvent } from "./events.mjs";

/**
 * Controlleur de jeu générique utilisable par 2048-js
 */
export class GameController extends EventTarget{
	/**
	 * Evènements du controlleur de jeu
	 * @type {object}
	 * @public
	 */
	events = {
		tiltUp: new TiltEvent(Direction.up),
		tiltLeft: new TiltEvent(Direction.left),
		tiltDown: new TiltEvent(Direction.down),
		tiltRight: new TiltEvent(Direction.right),
	};
}

/**
 * Controlleur de jeu 2048-js réagissant au clavier
 */
export class KeyboardGameController extends GameController{
	/**
	 * @param {string} leftKey  touche de déplacement gauche
	 * @param {string} upKey    touche de déplacement haut
	 * @param {string} rightKey touche de déplacement droit
	 * @param {string} downKey  touche de déplacement bas
	 */
	constructor(leftKey, upKey, rightKey, downKey){
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
			}
		});
	}
}