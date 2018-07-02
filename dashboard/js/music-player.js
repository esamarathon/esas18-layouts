'use strict';
$(() => {
	var songData = nodecg.Replicant('songData');
	songData.on('change', (newVal) => {
		$('#currentTrack').html(newVal.title);
	});
});