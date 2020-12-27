/**
 * Représente un résultat de partie
 */
export class GameResult{
	/**
	 * @param {number} score 
	 * @param {number} moves 
	 * @param {number} max 
	 */
	constructor(score, moves, max){
		this.score = score;
		this.moves = moves;
		this.max = max;
	}
}

/**
 * Représente un array de résultats de partie
 */
export class GameResultArray extends Array{
	/**
	 * Obtenir la valeur moyenne de la propriété donnée
	 * @param name Le nom de la propriété
	 * @private
	 * @method
	 */
	_getAverageProp = (name)=>{
		let sum = 0;
		for (let res of this){ sum += res[name]; }
		return sum / this.length;
	}
	get averageScore(){
		return this._getAverageProp("score");
	}
	get averageMax(){
		return this._getAverageProp("max");
	}
}

/**
 * Objet contenant les statistiques de fins de parties 
 */
export class GameInfos{
	results = new GameResultArray();
	displayElement = null;
	
	/**
	 * @param {HTMLElement} displayElement Là où sont affichés les informations
	 */
	constructor(displayElement){
		this.displayElement = displayElement;
	}

	/**
	 * Ajouter du texte à la fin de l'affichage d'informations
	 * @param {string}  text Le texte à ajouter à la fin de l'affichage
	 * @param {boolean} emphasis true si le texte doit être emphasé, false sinon
	 * @public
	 * @method
	 */
	printLine = (text, emphasis = false)=>{
		const tagName  = emphasis ? "strong" : "span";
		const textElem = document.createTextNode(text);
		const baseElem = document.createElement(tagName);
		baseElem.appendChild(textElem);
		this.displayElement.appendChild(baseElem);
	}

}