'use strict';
$(() => {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';

	var songData = nodecg.Replicant('songData');
	songData.on('change', newVal => {
		if (!newVal) return;
		$('#musicInfo').html(newVal.title);

		setMusicTitleSize();
	});

	// Stops/starts the music depending on if the intermission is displayed or not.
	window.obsstudio.onActiveChange = function(active) {
		if (active)
			nodecg.sendMessage('playSong');
		else
			nodecg.sendMessage('pauseSong');
	};
});