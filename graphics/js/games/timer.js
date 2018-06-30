'use strict';
$(() => {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	// JQuery selectors.
	//var finishTimeContainers = $('.finishTimeContainer'); // Array
	
	// Declaring other variables.
	var currentTime;
	var backupTimerTO;
	
	var stopwatch = nodecg.Replicant('stopwatch', speedcontrolBundle);
	stopwatch.on('change', (newVal, oldVal) => {
		if (!newVal) return;
		updateTimer(newVal, oldVal);
		
		// Backup Timer
		clearTimeout(backupTimerTO);
		backupTimerTO = setTimeout(backupTimer, 1000);
	});

	// Updates the timer when the game layout style is changed.
	// Maybe this should be done in the layout.change.js file?
	var currentLayout = nodecg.Replicant('currentGameLayout');
	currentLayout.on('change', newVal => {
		if (newVal && currentTime) {
			updateTimer(currentTime);
		}
	});
	
	// Backup timer that takes over if the connection to the server is lost.
	// Based on the last timestamp that was received.
	// When the connection is restored, the server timer will recover and take over again.
	function backupTimer() {
		backupTimerTO = setTimeout(backupTimer, 200);
		if (stopwatch.value.state === 'running') {
			var missedTime = Date.now() - stopwatch.value.timestamp;
			var timeOffset = stopwatch.value.milliseconds + missedTime;
			updateTimer({time:msToTime(timeOffset)});
		}
	}
	
	function updateTimer(newVal, oldVal) {
		var time = newVal.time || '88:88:88';
		
		// Change class on the timer to change the colour if needed.
		if (oldVal) $('#timer').toggleClass('timer_'+oldVal.state, false);
		$('#timer').toggleClass('timer_'+newVal.state, true);
		
		$('#timer').html(time);
		$('#timer').lettering(); // Makes each character into a <span>.
		currentTime = newVal;
	}
	
	// Used to hide finish times for everyone.
	/*nodecg.listenFor('resetTime', speedcontrolBundle, () => {
		finishTimeContainers.each((index, element) => {
			$('#finishTime', element).html('');
			$(element).css('opacity', '0');
		});
	});*/
	
	// Used to hide finish timers just for the specified index.
	/*nodecg.listenFor('timerReset', speedcontrolBundle, index => {
		var container = finishTimeContainers.eq(index);
		$('#finishTime', container).html('');
		container.addClass('hideFinishTime');
		container.css('opacity', '0');
	});*/
	
	// Used to show finish timers for the specified index.
	/*nodecg.listenFor('timerSplit', speedcontrolBundle, index => {
		if (finishTimeContainers.length > 1) {
			var container = finishTimeContainers.eq(index);
			$('#finishTime', container).html(currentTime);
			container.css('opacity', '100');
		}
	});*/
});