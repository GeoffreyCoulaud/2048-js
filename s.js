// Etendre les arrays pour leur permettre de se comparer à un autre
Array.prototype.equals = function(array) {
    // if the other array is a falsy value, return
    if (!array){return false;}
    // compare lengths - can save a lot of time 
    if (this.length != array.length){return false;}
    for (let i=0, l=this.length; i<l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
			if (!this[i].equals(array[i])){
				return false;
			}
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }           
    }       
    return true;
}
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

const canvas      = document.getElementById('reciever');
const ctx         = canvas.getContext('2d');
const marginColor = '#ddd';
const squareSide  = 500;
const maxPerRow   = 5;
const caseSide    = squareSide/maxPerRow;
const margin      = 5;

const colors = {
	0   : '#D6D2D2',
	2   : '#F1F4F3',
	4   : '#F4BBD3',
	8   : '#F686BD',
	16  : '#FE5D9F',
	32  : '#F92A82',
	64  : '#DB7F67',
	128 : '#723D46',
	256 : '#DF7373',
	512 : '#F0544F',
	1024: '#BA1F33',
	2048: '#321325'
}

canvas.height            = squareSide;
canvas.width             = squareSide;
canvas.style.borderStyle = 'solid'; 
canvas.style.borderColor = marginColor;
canvas.style.borderWidth = margin/2;

ctx.textAlign = 'center';
ctx.font      = '24px Arial';

let aperdu      = false;
let results = [];
let numbers = [];

// Re-créer un tableau de jeu
function resetNumbers(){
	numbers = [];
	for (let x=0; x<maxPerRow; x++){
		numbers.push( [] );
		for (let y=0; y<maxPerRow; y++){
			numbers[x].push( false );
		}
	}
}

// Ajouter une case
// Renvoie true si réussit, sinon renvoie false
function newRandomCase(){
	let libres = [];
	for (let x=0; x<maxPerRow; x++){
		for (let y=0; y<maxPerRow; y++){
			if ( numbers[x][y] == false){
				libres.push( {'x': x, 'y': y} );
			}
		}
	}
	if (libres.length != 0){
		let pos = libres[ Math.floor((libres.length)*Math.random()) ];
		numbers[pos.x][pos.y] = 2;
		return true;
	}

	return false;
}

// Contrôles en jeu au clavier
document.addEventListener('keydown', function(e){
	let k = e.key;
	switch (k){
		case 'ArrowUp':
		allerVers('haut');
		break;
		
		case 'ArrowDown':
		allerVers('bas');
		break;

		case 'ArrowLeft':
		allerVers('gauche');
		break;

		case 'ArrowRight':
		allerVers('droite');
		break;
	} 
});

//Gérer les mouvements du joueur
function allerVers(sens){

	//On commence toujours par le côté lié au sens (droite => côté droit)
	function validPos(x,y){
		if (x>=0 && x<maxPerRow && y>=0 && y<maxPerRow){return true;} 
		else {return false;}
	}

	if (sens == 'droite'){
		for (let x=maxPerRow-1; x>=0; x--){
			for (let y=0; y<maxPerRow; y++){
				//ACTION
				if (numbers[x][y] == false){ continue; }
				let obs = {'x': x, 'y': y};
				while (validPos(obs.x+1, obs.y) && numbers[obs.x+1][obs.y] == false){
					obs.x = obs.x + 1;
				}
				let c = numbers[x][y]; 
				if (validPos(obs.x+1, obs.y) && numbers[obs.x+1][obs.y] == numbers[x][y] ){
					obs.x = obs.x + 1;
					c = numbers[x][y] * 2;
				}

				numbers[x][y] = false;
				numbers[obs.x][obs.y] = c;
			}
		}
	}
	else if (sens == 'gauche'){
		for (let x=0; x<maxPerRow; x++){
			for (let y=0; y<maxPerRow; y++){
				//ACTION
				if (numbers[x][y] == false){ continue; }
				let obs = {'x': x, 'y': y};
				while (validPos(obs.x-1, obs.y) && numbers[obs.x-1][obs.y] == false){
					obs.x = obs.x - 1;
				}
				let c = numbers[x][y]; 
				if (validPos(obs.x-1, obs.y) && numbers[obs.x-1][obs.y] == numbers[x][y] ){
					obs.x = obs.x - 1;
					c = numbers[x][y] * 2;
				}

				numbers[x][y] = false;
				numbers[obs.x][obs.y] = c;
			}
		}
	}
	else if (sens == 'bas'){
		for (let y=maxPerRow-1; y>=0; y--){
			for (let x=0; x<maxPerRow; x++){
				//ACTION
				if (numbers[x][y] == false){ continue; }
				let obs = {'x': x, 'y': y};
				while (validPos(obs.x, obs.y+1) && numbers[obs.x][obs.y+1] == false){
					obs.y = obs.y + 1;
				}
				let c = numbers[x][y]; 
				if (validPos(obs.x, obs.y+1) && numbers[obs.x][obs.y+1] == numbers[x][y] ){
					obs.y = obs.y + 1;
					c = numbers[x][y] * 2;
				}

				numbers[x][y] = false;
				numbers[obs.x][obs.y] = c;
			}
		}
	}
	else if (sens =='haut'){
		for (let y=0; y<maxPerRow; y++){
			for (let x=0; x<maxPerRow; x++){
				//ACTION
				if (numbers[x][y] == false){ continue; }
				let obs = {'x': x, 'y': y};
				while (validPos(obs.x, obs.y-1) && numbers[obs.x][obs.y-1] == false){
					obs.y = obs.y - 1;
				}
				let c = numbers[x][y]; 
				if (validPos(obs.x, obs.y-1) && numbers[obs.x][obs.y-1] == numbers[x][y] ){
					obs.y = obs.y - 1;
					c = numbers[x][y] * 2;
				}

				numbers[x][y] = false;
				numbers[obs.x][obs.y] = c;
			}
		}
	}

	// On ajoute une case à la fin, sinon c'est qu'on a perdu !
	if (!newRandomCase()){ 
		aperdu = true;
	}
}

// Initialiser le jeu
function init(){
	resetNumbers();
	newRandomCase();
	boucle();
}

// Boucle d'affichage
function boucle(){
	//Background
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0,0, squareSide, squareSide);

	//Affichage des cases
	for (let x=0; x<maxPerRow; x++){
		for (let y=0; y<maxPerRow; y++){

			ctx.fillStyle = colors[ Number(numbers[x][y]) ]; 
			ctx.fillRect(x*caseSide, y*caseSide, caseSide, caseSide);
			
			ctx.strokeStyle = marginColor;
			ctx.lineWidth = margin;
			ctx.strokeRect(x*caseSide+0.5*margin, y*caseSide+0.5*margin, caseSide-margin, caseSide-margin);
			
			ctx.fillStyle = '#252525';
			if ( numbers[x][y] != false){
				ctx.fillText(numbers[x][y], x*caseSide+0.5*caseSide, y*caseSide+0.5*caseSide);
			}
		}
	}

	//AFFICHAGE DU DEBUG DE TACTIC
	let moyennetactic = 0;
	if (results.length != 0){
		for (let i of results){moyennetactic += i;}
		if (moyennetactic != 0){moyennetactic /= results.length;}
	}
	document.getElementById('infos').innerHTML = moyennetactic + "<br/>" + results.length;

	requestAnimationFrame(boucle);
}

/* "IA" qui répète un pattern de jeu fixe */
function tactic(mode){
	if (aperdu) {
		let max = 0 
		for (let x=maxPerRow-1; x>=0; x--){
			for (let y=0; y<maxPerRow; y++){
				if ( Number( numbers[x][y] ) > max ){
					max = Number( numbers[x][y] );
				}
			}
		}
		results.push(max)
		aperdu = false;
		init();
	}

	switch (mode){
		case "droite-bas":
			allerVers('droite');
			allerVers('bas');
			break;

		case "gauche-droite":
			allerVers('droite');
			allerVers('gauche');
			break;

		case "droite-bas-gauche":
			allerVers('droite');
			allerVers('bas');
			allerVers('gauche');
			break;

		case "roue":
			allerVers('haut');
			allerVers('droite');
			allerVers('bas');
			allerVers('gauche');
			break;

		case "croix":
			allerVers('haut'); 
			allerVers('bas');
			allerVers('gauche'); 
			allerVers('droite');
		
		case "aleatoire":
			let directions = ['haut', 'bas', 'gauche', 'droite'];
			let random = Math.round(Math.random() * directions.length);
			let direction = directions[random];
			allerVers(direction);
	}

	if (aperdu){
		console.log("Tactique terminée !");
	} else {
		setTimeout(tactic, 500);
	}
}

// ------------------------------------------------------------------------------------------------------
// - LOGIQUE DE JEU MODIFIABLE
// ------------------------------------------------------------------------------------------------------

// Lancer le jeu
init();

// Lancer une tactique de jeu automatisée (Commenter pour jouer soi même)
const tactic_mode = "roue";
tactic(tactic_mode);