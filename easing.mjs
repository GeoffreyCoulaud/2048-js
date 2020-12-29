import { Position } from "./geometry.mjs"

/**
 * Renvoie la valeur actuelle d'une animation en fonction de son avancement, son
 * point de départ et son point d'arrivée.
 * @param {number} avancement   Avancement de l'animation entre 0 et 1 compris 
 * @param {number|Position} min Valeur de départ de l'animation
 * @param {number|Position} max Valeur de fin de l'animation
 */
export function linear(avancement, min, max){
	// Gérer les avancements hors limites
	if (avancement > 1){ avancement = 1; }
	if (avancement < 0){ avancement = 0; }
	// Renvoi des valeurs
	if (typeof min === "number"){
		// Cas nombre
		return min + avancement * (max - min);
	} else if (min instanceof Position){
		// Cas Position
		return new Position(
			linear(avancement, min.x, max.x),
			linear(avancement, min.y, max.y)
		);
	} else {
		// Autres cas (non défini)
		throw Error(`Cannot ease value type ${typeof min}`);
	}
}