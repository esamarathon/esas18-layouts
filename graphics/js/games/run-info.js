'use strict';
$(() => {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// Declaring other variables.
	var runDataActiveRunCache = {};
	
	var runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataActiveRun.on('change', (newVal, oldVal) => {
		if (newVal) {
			// Dumb comparison to stop the data refreshing if the server restarts.
			if (JSON.stringify(newVal) !== JSON.stringify(runDataActiveRunCache)) {
				updateSceneFields(newVal);
				runDataActiveRunCache = newVal;
			}
		}
		else animationSetField(gameTitle, 'The Beginning');
	});

	// Updates the information when the game layout style is changed.
	// Maybe this should be done in the layout.change.js file?
	var currentLayout = nodecg.Replicant('currentGameLayout');
	currentLayout.on('change', newVal => {
		if (newVal && runDataActiveRunCache.game) {
			updateSceneFields(runDataActiveRunCache);
		}
	});
	
	// Sets information on the layout for the run.
	function updateSceneFields(runData) {
		var additionalDetails = runData.category+' / '+runData.system+' / EST: '+runData.estimate;

		animationSetField($('#gameName'), runData.game);
		animationSetField($('#gameAdditionalDetails'), additionalDetails);
		animationSetField($('#timer')); // Fade out/in the timer as well.
	}
});