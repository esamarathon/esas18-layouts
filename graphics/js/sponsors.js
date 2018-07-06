'use strict';
$(() => {
	var init = false;
	var sponsorImages = nodecg.Replicant('assets:sponsors');
	sponsorImages.on('change', newVal => {
		// If we aren't currently doing a rotation and there are logos available, start it off.
		if (!init && newVal.length > 0) {
			setInterval(rotateSponsors, 10000);
			rotateSponsors();
			init = true;
		}
	});

	// Rotate through logos.
	var index = 0;
	function rotateSponsors() {
		animationChangeSponsorImage($('.sponsorLogo'), sponsorImages.value[index].url);
		index++;
		if (index >= sponsorImages.value.length) index = 0;
	}
});