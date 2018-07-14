'use strict';
$(() => {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	var runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);

	runDataActiveRun.on('change', newVal => {
		var nextRuns = getNextRuns(runDataActiveRun.value, 4);

		var comingUpNextElem = $('#comingUpNext');
		comingUpNextElem.empty();

		var nextRun = nextRuns[0];
		
		createUpcomingGameElem(nextRun, comingUpNextElem, true);

		for (var i = 1; i < nextRuns.length; i++) {
			var nextRunsContainer = $('<div class="comingUpContainer flexContainer">');
			createUpcomingGameElem(nextRuns[i], nextRunsContainer);
			$('#rotatingComingUpRunsBox').append(nextRunsContainer);
		}
	});

	function createUpcomingGameElem(runData, elemToAppendTo, next) {
		var headerElem = $('<div class="comingUpHeader flexContainer">');
		var bodyElem = $('<div class="comingUpBody flexContainer">');

		if (next) {
			headerElem.html('Coming Up Next');
		}
		else {
			headerElem.html('Coming Up LATER');
		}

		bodyElem.html(runData.game);

		elemToAppendTo.append(headerElem);
		elemToAppendTo.append(bodyElem);
	}
});