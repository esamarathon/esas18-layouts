'use strict';
$(() => {
	var extraElemsContainer = $('#extraElements');
	var layoutHash = (window.location.hash) ? window.location.hash.substring(1) : undefined;

	// If hash specified, looks through the layouts to see if that one exists.
	// If so, uses that layout style.
	// Example: http://localhost:9090/bundles/esas18-layouts/graphics/game-layout.html#4_3-1p
	if (layoutHash) {
		var layouts = nodecg.Replicant('gameLayouts');
		layouts.on('change', newVal => {
			if (newVal) {
				for (var i = 0; i < newVal.length; i++) {
					if (newVal[i].code === layoutHash.toLowerCase()) {
						addExtraElements(newVal[i]);
						setCSS(newVal[i]);
						break;
					}
				}
			}
		});
	}

	else {
		// Listens for the layout style to change.
		var currentLayout = nodecg.Replicant('currentGameLayout');
		currentLayout.on('change', newVal => {
			if (newVal) {
				addExtraElements(newVal);
				setCSS(newVal);
			}
		});
	}

	// Adds extra elements to the layout that are needed depending on what is needed.
	function addExtraElements(layoutInfo) {
		extraElemsContainer.empty(); // Remove anything already added.

		// Game Capture/Player Wrappers
		if (!layoutInfo.gameCaptures || layoutInfo.gameCaptures === 1 || layoutInfo.codecode === 'geoguessr') {
			extraElemsContainer.append('<div id="playersWrapper" class="storageBox flexContainer">');
		}
		if (layoutInfo.gameCaptures >= 2) {
			if (layoutInfo.code !== 'geoguessr') {
				extraElemsContainer.append(createPlayerWrapperMultiElement('1'));
				extraElemsContainer.append(createPlayerWrapperMultiElement('2'));
			}
			extraElemsContainer.append(createGameCaptureElement('2'));
		}
		if (layoutInfo.gameCaptures >= 3) {
			extraElemsContainer.append(createPlayerWrapperMultiElement('3'));
			extraElemsContainer.append(createGameCaptureElement('3'));
		}
		if (layoutInfo.gameCaptures >= 4) {
			extraElemsContainer.append(createPlayerWrapperMultiElement('4'));
			extraElemsContainer.append(createGameCaptureElement('4'));
		}
		if (layoutInfo.ds) {
			extraElemsContainer.append(createGameCaptureElement('1B'));
		}

		// Info Container
		var infoContainerElem = $('<div id="infoContainer" class="storageBox flexContainer">')

		// If there needs to be a wrapper DIV for the game/addition details or not.
		if (!layoutInfo.combineGameNameAndAdditional)
			infoContainerElem.append('<div id="gameName"></div><div id="gameAdditionalDetails"></div>');
		else
			infoContainerElem.append('<div><div id="gameName"></div><div id="gameAdditionalDetails"></div></div>');

		// Timer
		infoContainerElem.append('<div id="timer">');

		// If the sponsor logo is in the info container (from above) or it's own thing.
		if (!layoutInfo.sponsorInInfo)
			extraElemsContainer.append('<div id="sponsorLogo" class="storageBox flexContainer">');
		else {
			// Currently, having the class "flexContainer" when it's not needed doesn't break anything, it might do in the future?
			infoContainerElem.append('<div class="infoDivider">');
			infoContainerElem.append('<div id="sponsorLogo" class="flexContainer">');
		}

		// Add all this to the page.
		extraElemsContainer.append(infoContainerElem);
	}

	function createGameCaptureElement(code) {
		return $('<div id="gameCapture'+code+'" class="storageBox gameCapture">');
	}

	function createPlayerWrapperMultiElement(code) {
		return $('<div id="playerWrapperMulti'+code+'" class="playerWrapperMulti storageBox flexContainer">');
	}
	
	// Set the CSS of the layout so everything can be styled correctly.
	function setCSS(layoutInfo) {
		var cssURL = 'css/games/'+layoutInfo.code+'.css'
		$('#layoutCSSFile').attr('href', cssURL);
	}
});