'use strict';

// Declaring other variables.
var uksgBarLogoCurrentRotation = 0; // 0: normal - 1: hashtag
var uksgBarLogoTicks = 0;

function changeUKSGLogo() {
	// JQuery selectors.
	var fullLogo = $('#uksgBarLogoContainer #uksgFullLogo');
	var winterLogo = $('#uksgBarLogoContainer #uksgEventLogo');
	
	uksgBarLogoTicks++;
	
	// Change to Winter text after 30s.
	if (uksgBarLogoCurrentRotation === 0 && uksgBarLogoTicks >= 7) {
		animationFadeOutInElements(fullLogo, winterLogo);
		uksgBarLogoTicks = 1;
		uksgBarLogoCurrentRotation ^= 1; // Toggle between 0 and 1.
	}
	
	// Change to normal logo after 30s.
	else if (uksgBarLogoCurrentRotation === 1 && uksgBarLogoTicks >= 7) {
		animationFadeOutInElements(winterLogo, fullLogo);
		uksgBarLogoTicks = 1;
		uksgBarLogoCurrentRotation ^= 1; // Toggle between 0 and 1.
	}
}