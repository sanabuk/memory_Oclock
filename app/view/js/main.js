/**
 * Représentation des différentes cartes
 * On utilisera les valeurs du tableau afin de régler l'affichage de l'image // Technique du "sprite"
 */
var cards = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]

/**
 * Sélectionner les cartes constituants le jeu
 * Retourner les cartes en doublons
 * @param array cards
 * @return array cards
 */
function selectCards(cards)	{
	var selectedCards = []
	while(selectedCards.length < 14){
		randomIndex = Math.floor(Math.random() * cards.length)
		selectedCards.push(cards[randomIndex])
		cards.splice(randomIndex,1)
		length-=1
	}
	return selectedCards.concat(selectedCards)
}

/**
 * Mélanger les cartes
 * @param array cards
 * @return array cards
 */
function shuffle(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
}

/**
 * Construction du plateau de jeu
 * L'image de base fait 100px*1800px, on définit donc sa "background-position" selon la valeur dans le tableau cards
 * @param array cards
 * @return string frag
 */
function buildBoargame(cards){
	var frag = '';
	cards.forEach(function(valeur){
		frag += '<div class="card" data-id="'+ valeur +'">\
		<div class="front" style="background-position:0 -'+valeur*100+'px"></div>\
		<div class="back"></div>\
		</div>';
	});
	return frag;
}

/**
 * Fonction permettant de déterminer si 2 cartes sont retournées et si les conditions de victoires sont atteintes
 * Si 2 éléments sont retournés alors on appelle la fonction de comparaison checkMatched
 * La fonction retourne un tableau de 2 éléments booléans : 
 * - 1er élément : les 2 cartes matchent (true or false)
 * - 2ème élément : les 28 cartes matchent (conditions de victoire true or false)
 */
function checkCardsPicked(){
	var pickedElements = document.querySelectorAll('.picked')
	return checkMatched(pickedElements)
}

/**
 * Fonction permettant de vérifier si les 2 cartes retournées "matchent"
 * Si les 2 cartes matchent on passe du status 'picked' au status 'matched' et on vérifie si toutes les cartes sont retournées (ont le status 'matched')
 * Sinon on retourne les cartes et supprime la classe picked des éléments 
 */
function checkMatched(pickedElements){
	if (pickedElements[0].getAttribute('data-id') == pickedElements[1].getAttribute('data-id')){
		for (let element of pickedElements){
			element.classList.remove('picked')
			element.classList.add('matched')
		}
		if (document.querySelectorAll('.matched').length == 28){
			return [true,true]
		} else {
			return [true,false]
		}
	} else {
		return [false,false]
	}
}

/**
 * Fonction permettant de construire le DOM de la div contenant les meilleurs scores
 */
function buildScoreModal(datas){
	var frag = '<h3>Scores</h3><ul>'
	var classement = 1
	for(let d of datas){
		frag += "<li><b>"+classement+"- </b> "+d.player_name+" - "+d.score+" secondes</li>"
		classement+=1
	}
	return frag+='</ul>'
}

$(document).ready(function(){	
	// On sette la limitation de temps du jeu en ms
	var maxDuration = 90000

	clearGame()
	/**
	 * Fonction permettant de remettre l'affichage' à l'état initial avec les scores enregistrés
	 */
	function clearGame(){
		var frag = ''
		// Appel de récupération des scores et affichage des scores
		var scores = $.get('scores', function(data, status){
    		if (status === 'success'){
    			frag = buildScoreModal(data)
    			$('#modal-score').html(frag)
    			$('#modal-score').show()
    		}
  		});  		
		$('#boardgame').html('')
		$('#timer').hide()
		$('#timer').html('')
		$('#btn-start').show()
	}

	// Le jeu ne peut pas démarrer si le pseudo du joueur n'est pas renseigné
	$('#btn-start').click(function(){
		if($('input').val()==''){
			alert('Rentrez votre pseudo pour pouvoir jouer une partie !');
		} else {
			play()
		}
	})

	/**
	 * Fonction de démarrage du jeu appelé uniquement si le pseudo du joueur est renseigné
	 */
	function play(){
		// Mise en place du jeu	
		var pseudo = $('input').val()
		var actualDuration = 0
		var victory = false
		$('#btn-start').hide()
		$('#boardgame').html('')	
		
		// Mélange des cartes
		shuffledCards = shuffle(selectCards(cards))
		// Affichage des cartes mélangées
		boardGameHtml = buildBoargame(shuffledCards)
		$('#boardgame').html(boardGameHtml)
		$('#timer').show()

		/**
		 * Gestion du timer interne
		 * C'est lui qui met à jour la durée actuelle du jeu en cours
		 * Celui ci s'arrête si dépassement du temps ou si condition de victoire remplie
		 */
		startTimer(actualDuration, maxDuration)
		function startTimer(actualDuration, maxDuration){
			var timer = setInterval(function(){
				actualDuration+=1000
				$('#timer').attr({'data-value':actualDuration})
				if((actualDuration == maxDuration && !victory)){
					clearInterval(timer)
					alert('VOUS AVEZ PERDU !!!!')
					location.reload();
				}
				if(victory){
					clearInterval(timer)
					alert('VOUS AVEZ GAGNE !!!!')
					location.reload();
				}
			}, 1000);
		}

		// Utilisation d'une progress bar tierce
		// progressbar.js@1.0.0 version is used
		// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/

		var bar = new ProgressBar.Line(timer, {
		  strokeWidth: 4,
		  duration: maxDuration,
		  color: 'red',
		  trailColor: '#eee',
		  trailWidth: 1,
		  svgStyle: {width: '100%', height: '100%'}
		});

		// La progessbar s'anime
		bar.animate(1.0) // Number from 0.0 to 1.0
		
		/**
		 * On part du principe que les cartes peuvent avoir 3 états différents
		 * Pour symboliser ces états ont rajoutera une classe sur la carte
		 * - picked : carte visible
		 * - matched : cartes visibles formant une paire et ne devant pas être retournée
		 * - une carte sans classe css pré-citée correspond à une carte non visible
		 */
		$('.card').click(function(){
			// Il ne doit jamais y avoir plus de 2 cartes visibles et en cas de victoire le clic sur une carte n'a plus d'effets
			if ($('.picked').length < 2 && victory === false){
				// On dévoile la carte	
				$(this).children('.back').hide()
				$(this).children('.front').show()
				// On change l'état de la carte si la carte n'est pas déjà matched
				if ($(this).hasClass('matched') !== true){
					$(this).addClass('picked')
				}

				// Si 2 cartes sont retournées on vérifie si elles matchent
				var checkMatched = [null,null]
				if ($('.picked').length == 2){
					checkMatched = checkCardsPicked()
				}

				// Les 2 cartes choisies ne matchent pas :
				// On les remet faces cachées avec un délai (600ms) permettant au joueur de voir la 2ème carte retournée
				if ( checkMatched[0] === false){
					setTimeout(function(){
						$('.picked').children('.front').hide()
						$('.picked').children('.back').show()		
						$('.picked').removeClass('picked')
					}, 600);				
				}

				// Cas de victoire
				if (checkMatched[1] === true){
					// On récupère la durée actuelle du jeu
					actualDuration = $('#timer').attr('data-value')
					// On bloque la progressbar à son niveau actuel
					bar.animate(actualDuration/maxDuration)
					// On sette la variable victory à true afin que le timer puisse s'arrêter
					victory = true
					// On appelle la route permettant de persister le score
					$.post('scores',{
						'player' : pseudo,'score': Math.floor(actualDuration/1000) 
					});
				}
			}
		})
	}
});