'use strict';
var clone = require('clone');

module.exports = function(nodecg) {
	// A replicant that stores all the data for possible game layouts.
	// It is intended that everything is set here and nowhere else.
	// name: formal name used for GUI (e.g.: selecting in the override panel).
	// code: the name used everywhere else, including the CSS file.
	// gameCaptures (optional, default 1): how many game captures the scene needs to have.
	// sponsorInInfo (optional): if the sponsor logo element needs to be put inside the info container element.
	// combineGameNameAndAdditional (optional): if gameName and gameAdditionalDetails need to be wrapped together in another DIV.
	var layouts = nodecg.Replicant('gameLayouts', {defaultValue: [
		{name: '4:3 1 Player', code: '4_3-1p', sponsorInInfo: true},
		{name: '4:3 2 Player', code: '4_3-2p', gameCaptures: 2},
		{name: '4:3 3 Player', code: '4_3-3p', gameCaptures: 3},
		{name: '4:3 4 Player', code: '4_3-4p', gameCaptures: 4},
		{name: '16:9 1 Player', code: '16_9-1p', combineGameNameAndAdditional: true},
		{name: '16:9 2 Player', code: '16_9-2p', gameCaptures: 2},
		{name: '16:9 3 Player', code: '16_9-3p', gameCaptures: 3, sponsorInInfo: true},
		{name: '16:9 4 Player', code: '16_9-4p', gameCaptures: 4},
		{name: 'GBA 1 Player', code: 'gba-1p', combineGameNameAndAdditional: true},
		{name: 'GBA 2 Player', code: 'gba-2p', gameCaptures: 2},
		{name: 'GameBoy 1 Player', code: 'gb-1p', sponsorInInfo: true},
		{name: 'GameBoy 2 Player', code: 'gb-2p', gameCaptures: 2},
		{name: 'DS 1 Player', code: 'ds-1p', ds: true, sponsorInInfo: true, combineGameNameAndAdditional: true},
		{name: '3DS 1 Player', code: '3ds-1p', ds: true, sponsorInInfo: true, combineGameNameAndAdditional: true},
		{name: 'GeoGuessr 1 Player', code: 'geoguessr', gameCaptures: 2, sponsorInInfo: true},
	], persistent: false});
	// Adds an ID to the layout objects above.
	var layoutsTemp = layouts.value.slice(0);
	for (var i = 0; i < layoutsTemp.length; i++) {layoutsTemp[i].id = i;}
	layouts.value = layoutsTemp.slice(0);

	// Current layout info stored in here. Defaults to the first one in the list above.
	var currentGameLayout = nodecg.Replicant('currentGameLayout', {defaultValue: clone(layouts.value[0])});
	
	// Message used to change layout.
	nodecg.listenFor('changeGameLayout', (index, callback) => {
		var layoutInfo = layouts.value[index];
		currentGameLayout.value = clone(layoutInfo);
		callback();
	});
}