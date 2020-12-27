/**
 * Couple de valeurs numériques x et y
 */
export class Vector2{
	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
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

/**
 * Direction 2D
 */
export class Direction extends Vector2{
	// Directions de base
	static still = new Direction(0,  0);
	static up    = new Direction(0, -1);
	static down  = new Direction(0,  1);
	static left  = new Direction(-1, 0);
	static right = new Direction(1,  0);
	// Regroupement de directions cardinales
	static cardinals = ["up", "down", "left", "right"];
}

/**
 * Position 2D
 */
export class Position extends Vector2{
	/**
	 * Créer une position égale à la présente déplacée dans la direction donnée
	 * @param {Direction} direction 
	 */
	add = (direction)=>{
		return new Position(this.x + direction.x, this.y + direction.y);
	}
}