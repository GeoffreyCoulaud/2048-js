import { Position } from "./geometry.mjs";
import * as easing from "./easing.mjs";

export class AnimationStep{
	value = null;
	time = 0;
	/**
	 * @param {number|Position} value Valeur de l'étape 
	 * @param {number} time Moment de l'étape, (Unix Timestamp)
	 */
	constructor(value, time){
		this.value = value;
		this.time  = time;
	}
}

export class AnimatedProperty{
	steps = [];
	
	get startStep(){
		return this.steps[0];
	}
	get endStep(){
		return this.steps[this.steps.length-1];
	}
	get duration(){
		return this.endStep.time - this.startStep.time;
	}
	get progression(){
		const time = Date.now();
		if (time < this.startStep.time){ return 0; }
		if (time > this.endStep.time){ return 1; } 
		if (this.duration === 0){ return 1; }
		return (time - this.startStep.time) / this.duration;
	}
	get currentValue(){
		const prog = this.progression;
		const sp = this.startStep;
		const ep = this.endStep;
		let value = this.easingFunction(prog, sp.value, ep.value);
		return value;
	}
	
	/**
	 * @param {AnimationStep} start     Le début de l'animation
	 * @param {AnimationStep} end       La fin de l'animation
	 * @param {function} easingFunction La fonction d'interpolation temporelle
	 */
	constructor(start, end, easingFunction = easing.linear){
		this.steps = [start, end];
		this.easingFunction = easingFunction;
	}
}