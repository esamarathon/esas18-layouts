'use strict';
$(() => {
	// Replicants
	var layouts = nodecg.Replicant('gameLayouts');
	var currentLayout = nodecg.Replicant('currentGameLayout');

	var extraElemsContainer = $('#extraElements');
	var layoutHash = (window.location.hash) ? window.location.hash.substring(1) : undefined;

	// If hash specified, looks through the layouts to see if that one exists.
	// If so, uses that layout style.
	// Example: http://localhost:9090/bundles/esas18-layouts/graphics/game-layout.html#4_3-1p
	if (layoutHash) {
		layouts.on('change', newVal => {
			if (newVal) {
				var layoutInfo = findLayoutInfo(layoutHash);
				if (layoutInfo) {
					addExtraElements(newVal[i]);
					setCSS(newVal[i]);
				}
			}
		});
	}

	else {
		// Listens for the layout style to change.
		currentLayout.on('change', newVal => {
			if (newVal) {
				addExtraElements(newVal);
				setCSS(newVal);
			}
		});
	}

	// Adds extra elements to the layout that are needed depending on what is needed.
	function addExtraElements(layoutInfo) {
		moveElementsToTempStorage(); // Move importants elements to temporary storage if needed.
		extraElemsContainer.empty(); // Remove anything already added.

		// Game Capture/Player Wrappers
		if (!layoutInfo.gameCaptures || layoutInfo.gameCaptures === 1 || layoutInfo.code === 'geoguessr' || layoutInfo.ds) {
			// Create element for all players and move in all correct elements.
			var playersElem = $('<div id="playersWrapper" class="storageBox flexContainer">');
			$(".playerContainerStorage").detach().appendTo(playersElem);
			extraElemsContainer.append(playersElem);
		}
		if (layoutInfo.gameCaptures >= 2 || layoutInfo.ds) {
			if (layoutInfo.code !== 'geoguessr' && !layoutInfo.ds) {
				// Create element for player 1 and move in correct element.
				var playerElem1 = createPlayerWrapperMultiElement('1');
				$("#playerContainerStorage1").detach().appendTo(playerElem1);
				extraElemsContainer.append(playerElem1);

				// Create element for player 2 and move in correct element.
				var playerElem2 = createPlayerWrapperMultiElement('2');
				$("#playerContainerStorage2").detach().appendTo(playerElem2);
				extraElemsContainer.append(playerElem2);
			}
			extraElemsContainer.append(createGameCaptureElement('2'));
		}
		if (layoutInfo.gameCaptures >= 3) {
			// Create element for player 3 and move in correct element.
			var playerElem3 = createPlayerWrapperMultiElement('3');
			$("#playerContainerStorage3").detach().appendTo(playerElem3);
			extraElemsContainer.append(playerElem3);

			extraElemsContainer.append(createGameCaptureElement('3'));
		}
		if (layoutInfo.gameCaptures >= 4) {
			// Create element for player 4 and move in correct element.
			var playerElem4 = createPlayerWrapperMultiElement('4');
			$("#playerContainerStorage4").detach().appendTo(playerElem4);
			extraElemsContainer.append(playerElem4);

			extraElemsContainer.append(createGameCaptureElement('4'));
		}

		// Extra Camera
		if (layoutInfo.webcams >= 2) {
			extraElemsContainer.append(createWebcamElement('2'));
		}

		// Info Container
		var infoContainerElem = $('<div id="infoContainer" class="storageBox flexContainer">')

		// If there needs to be a wrapper DIV for the game/addition details or not.
		if (layoutInfo.combineGameNameAndAdditional)  {
			var combineGameAndAdditionalElem = $('<div>');

			// Move needed elements in.
			$("#gameName").detach().appendTo(combineGameAndAdditionalElem);
			$("#gameAdditionalDetails").detach().appendTo(combineGameAndAdditionalElem);

			infoContainerElem.append(combineGameAndAdditionalElem);
		}

		else {
			// Move needed elements in.
			$("#gameName").detach().appendTo(infoContainerElem);
			$("#gameAdditionalDetails").detach().appendTo(infoContainerElem);
		}

		// Timer
		$("#timer").detach().appendTo(infoContainerElem);
		
		// If the sponsor logo is in the info container (from above) or it's own thing.
		if (layoutInfo.sponsorInInfo) {
			infoContainerElem.append('<div class="infoDivider">');
			$("#sponsorLogoWrapper").addClass('sponsorLogoWrapperGrow').detach().appendTo(infoContainerElem);
		}
		else {
			$("#sponsorLogoWrapper").addClass('storageBox').detach().appendTo(extraElemsContainer);
		}

		// Add all this to the page.
		extraElemsContainer.append(infoContainerElem);
	}

	function createGameCaptureElement(code) {
		return $('<div id="gameCapture'+code+'" class="storageBox gameCapture">');
	}

	function createWebcamElement(code) {
		return $('<div id="webcam'+code+'" class="storageBox webcam">');
	}

	function createPlayerWrapperMultiElement(code) {
		return $('<div id="playerWrapperMulti'+code+'" class="playerWrapperMulti storageBox flexContainer">');
	}

	// Move elements that hold information back into temporary storage if needed.
	function moveElementsToTempStorage() {
		$("#gameName").detach().appendTo('#temporaryStorage');
		$("#gameAdditionalDetails").detach().appendTo('#temporaryStorage');
		$("#timer").detach().appendTo('#temporaryStorage');
		$("#sponsorLogoWrapper").removeClass('storageBox').removeClass('sponsorLogoWrapperGrow').detach().appendTo('#temporaryStorage');
		$(".playerContainerStorage").detach().appendTo('#temporaryStorage');
	}
	
	// Set the CSS of the layout so everything can be styled correctly.
	function setCSS(layoutInfo) {
		var cssURL = 'css/games/'+layoutInfo.code+'.css'
		$('#layoutCSSFile').attr('href', cssURL);
	}

	// Find information about layout based on it's code.
	function findLayoutInfo(code) {
		var layoutInfo;
		for (var i = 0; i < layouts.value.length; i++) {
			if (layouts.value[i].code === code.toLowerCase()) {
				layoutInfo = layouts.value[i];
				break;
			}
		}
		return layoutInfo;
	}
});