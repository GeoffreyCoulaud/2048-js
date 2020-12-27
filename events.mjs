import { Direction } from "./geometry.mjs";

/**
 * Evènement GameStartEvent
 */
export class GameStartEvent extends Event{
	constructor(){
		super("start");
	}
}

/**
 * Evènement GameEndEvent
 */
export class GameEndEvent extends Event{
	/**
	 * @param {number} score Score atteint en fin de partie
	 * @param {number} max   Valeur de la plus grande case en fin de partie
	 * @param {number} moves Nombre de déplacements durant la partie 
	 */
	constructor(score = 0, max = 0, moves = 0){
		super("end");
		this.score = score;
		this.moves = moves;
		this.max = max;
	}
}

/**
 * Evènement TiltEvent
 */
export class TiltEvent extends Event{
	/**
	 * @param {Direction} direction 
	 */
	constructor(direction){
		super("tilt");
		this.direction = direction;
	}
}