'use strict';

// Declaring other variables.
var esaBarLogoCurrentRotation = 0; // 0: normal - 1: hashtag
var esaBarLogoTicks = 0;

function changeUKSGLogo() {
	// JQuery selectors.
	var smallLogo = $('#esaBarLogoContainer #esaSmallLogo');
	var hashtag = $('#esaBarLogoContainer #esaHashtagLogo');
	
	esaBarLogoTicks++;
	
	// Change to hashtag text after 30s.
	if (esaBarLogoCurrentRotation === 0 && esaBarLogoTicks >= 7) {
		animationFadeOutInElements(smallLogo, hashtag);
		esaBarLogoTicks = 1;
		esaBarLogoCurrentRotation ^= 1; // Toggle between 0 and 1.
	}
	
	// Change to normal logo after 30s.
	else if (esaBarLogoCurrentRotation === 1 && esaBarLogoTicks >= 7) {
		animationFadeOutInElements(hashtag, smallLogo);
		esaBarLogoTicks = 1;
		esaBarLogoCurrentRotation ^= 1; // Toggle between 0 and 1.
	}
}