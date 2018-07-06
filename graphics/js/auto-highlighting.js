'use strict';
$(() => {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';

	// Stops, then starts a highlight if layout becomes active in OBS. Also cuts the upload recording.
	window.obsstudio.onActiveChange = function(active) {
		if (active) {
			nodecg.sendMessageToBundle('stopTwitchHighlight', speedcontrolBundle, () => {
				nodecg.sendMessageToBundle('startTwitchHighlight', speedcontrolBundle);
			});
			nodecg.sendMessageToBundle('splitRecording', speedcontrolBundle);
		}
	};
});