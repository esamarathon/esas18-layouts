'use strict';
var clone = require('clone');
var fs = require('fs');
var css = require('css');
var nodecg = require('./utils/nodecg-api-context').get();
var obs = require('./utils/obs');

// The bundle name where all the run information is pulled from.
var speedcontrolBundle = 'nodecg-speedcontrol';

// A replicant that stores all the data for possible game layouts.
// It is intended that everything is set here and nowhere else.
// name: formal name used for GUI (e.g.: selecting in the override panel).
// code: the name used everywhere else, including the CSS file.
// gameCaptures (optional, default 1): how many game captures the scene needs to have.
// webcams (optional, default 1): how many cameras the scene needs to have.
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
	{name: '16:9 4 Player', code: '16_9-4p', gameCaptures: 4, webcams: 2},
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

var lastScene = nodecg.Replicant('lastOBSScene');
var currentScene = nodecg.Replicant('currentOBSScene');
var obsConfig = nodecg.bundleConfig.obs || {};

// CSS -> OBS source names
// (OBS source names need to be moved to the config file.)
var obsSourceKeys = {
	'gameCapture1': obsConfig.capture1 || 'Game Capture 1',
	'gameCapture2': obsConfig.capture2 || 'Game Capture 2',
	'gameCapture3': obsConfig.capture3 || 'Game Capture 3',
	'gameCapture4': obsConfig.capture4 || 'Game Capture 4',
	'webcam1': obsConfig.camera1 || 'Camera Capture 1',
	'webcam2': obsConfig.camera2 || 'Camera Capture 2'
};

// Fired when the OBS WebSocket actually connects.
obs.on('ConnectionOpened', () => {
	// Get current scene.
	obs.send('GetCurrentScene', {}, (err, data) => {
		if (!err) {
			lastScene.value = currentScene.value;
			currentScene.value = data.name;
		}
	});
});

// Message used to change layout, usually manually.
nodecg.listenFor('changeGameLayout', (id, callback) => {
	var layoutInfo = layouts.value[id];
	changeGameLayout(layoutInfo, callback);
});

// Listens for the current run to change, to get it's layout info.
var runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
runDataActiveRun.on('change', (newVal, oldVal) => {
	// If the run has the same ID, we don't need to change the layout.
	// This stops the layout messing up if you force change it and *then* edit run data.
	if (newVal && oldVal && newVal.runID === oldVal.runID) return;

	if (newVal) {
		if (newVal.customData && newVal.customData.layout)
			var layoutCode = newVal.customData.layout;
		else
			var layoutCode = '4_3-1p'; // Default Layout
		
		// Only trigger a change if the layout is actually different.
		var layoutInfo = findLayoutInfo(layoutCode);
		if (layoutInfo && (!currentGameLayout.value || layoutInfo.code !== currentGameLayout.value.code))
			changeGameLayout(layoutInfo);
	}
});

// Listens for transitions in OBS to happen.
obs.on('TransitionBegin', (data) => {
	// If we're using a certain transition, send a message that causes
	// a transition in a HTML overlay to happen.
	if (data.name === 'Blank Stinger') {
		nodecg.sendMessage('startTransition');
	}
});

// Listen for scene switches to update the replicant.
obs.on('SwitchScenes', (data) => {
	lastScene.value = currentScene.value;
	currentScene.value = data['scene-name'];

	if (currentScene.value.includes('intermission') && !lastScene.value.includes('intermission')) {
		// start music
		nodecg.sendMessage('playSong');
	}

	else if (!currentScene.value.includes('intermission') && lastScene.value.includes('intermission')) {
		// stop music
		nodecg.sendMessage('pauseSong');
	}
});

// Switch back to the last scene when the sponsor video finishes.
nodecg.listenFor('sponsorVideoFinished', () => {
	if (!lastScene.value) return;
	obs.send('SetCurrentScene', {'scene-name': lastScene.value});
});

function changeGameLayout(info, callback) {
	// Set replicant to have the correct information for use elsewhere.
	currentGameLayout.value = clone(info);

	// Read in CSS file for this layout so we can use it's settings.
	var layoutCSS = fs.readFileSync(__dirname+'/../graphics/css/games/'+info.code+'.css', 'utf8');
	layoutCSS = css.parse(layoutCSS);

	var allSettings = {
		'gameCapture1': null,
		'gameCapture2': null,
		'gameCapture3': null,
		'gameCapture4': null,
		'webcam1': null,
		'webcam2': null
	};
	
	// TODO: get settings from .gameCapture and .webcam if needed
	var cssRules = layoutCSS.stylesheet.rules;
	cssRules.forEach(rule => {
		if (rule.type === 'rule') {
			var settings = {x: 0, y: 0, width: 0, height: 0, croptop: 0, cropright: 0, cropbottom: 0, cropleft: 0};
			var source;

			if (rule.selectors[0].includes('#gameCapture')) {
				settings = getCSSSettings(rule.declarations, settings);
				source = rule.selectors[0].slice(1);
			}

			else if (rule.selectors[0].includes('#webcam')) {
				settings = getCSSSettings(rule.declarations, settings);
				source = rule.selectors[0].slice(1);

				// Cameras need cropping if not exactly 16:9.
				// Bigger than 16:9 need top/bottom cropping.
				// Smaller than 16:9 need left/right cropping.
				var webcamAR = settings.width/settings.height;
				if (webcamAR > (16/9)) {
					var newHeight = 1920/webcamAR;
					var cropAmount = Math.floor((1080-newHeight)/2);
					settings.croptop = cropAmount;
					settings.cropbottom = cropAmount;
				}
				else if (webcamAR < (16/9)) {
					var newWidth = 1080*webcamAR;
					var cropAmount = Math.floor((1920-newWidth)/2);
					settings.cropleft = cropAmount;
					settings.cropright = cropAmount;
				}
			}

			if (source)
				allSettings[source] = settings;
		}
	});
	
	// Loop through all sources and set their settings as needed.
	for (var source in allSettings) {
		if (!allSettings.hasOwnProperty(source)) continue;

		setOBSSourceSettings(source, allSettings[source]);
	}

	nodecg.log.info('Game Layout changed to %s.', info.name);
	if (callback) callback();
}

// Pulls out the CSS settings for cameras/game captures.
function getCSSSettings(declarations, settingsObj) {
	var settings = clone(settingsObj) || {x: 0, y: 0, width: 0, height: 0, croptop: 0, cropright: 0, cropbottom: 0, cropleft: 0};

	declarations.forEach(declaration => {
		if (declaration.property === 'left')
			settings.x = parseInt(declaration.value);
		if (declaration.property === 'top')
			settings.y = parseInt(declaration.value);
		if (declaration.property === 'width')
			settings.width = parseInt(declaration.value);
		if (declaration.property === 'height')
			settings.height = parseInt(declaration.value);
	});

	return settings;
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

// Use a config to set a source to use the settings we need.
function setOBSSourceSettings(source, config) {
	// Setup options for this source.
	var options = {
		'scene-name': obsConfig.gameLayout || 'Game Layout',
		'item': obsSourceKeys[source],
		'visible': config ? true : false
	};

	// Set the config if needed.
	if (config) {
		options.position = {
			'x': config.x,
			'y': config.y
		};
		options.bounds = {
			'x': config.width,
			'y': config.height
		};
		options.crop = {
			'top': config.croptop,
			'right': config.cropright,
			'bottom': config.cropbottom,
			'left': config.cropleft
		};
	}

	// Send settings to OBS.
	obs.send('SetSceneItemProperties', options);
}