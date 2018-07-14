'use strict';
$(() => {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';
	
	setInterval(() => {
		animationFadeInElement($('#rotatingSponsorSlidesBox'));
		animationFadeOutElement($('#rotatingComingUpRunsBox'));
	}, 10000);
});

// Reduce the font size if the song title happens to go onto 2 lines.
// In here because 2 files need to use it.
function setMusicTitleSize() {
	$('#musicInfo').css('font-size', '30px');
	if ($('#musicInfo').height() > 30)
		$('#musicInfo').css('font-size', '23px');
}