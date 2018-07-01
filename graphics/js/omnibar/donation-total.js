'use strict';

// TODO: Change font size depending on how long the donation total string is?

// Declaring other variables.
var donationTotalLogoCurrentRotation = 0; // 0: total - 1: StC text
var donationTotalTicks = 0;
var lastDonationTotal;

// Replicants.
var donationTotal = nodecg.Replicant('donationTotal');

function changeDonationTotalStuff() {
	// JQuery selectors.
	var amountText = $('#donationTotalContainer #amountText');
	var stcText = $('#donationTotalContainer #stcText');
	
	donationTotalTicks++;
	
	// Change to StC text after 30s.
	if (donationTotalLogoCurrentRotation === 0 && donationTotalTicks >= 7) {
		animationFadeOutInElements(amountText, stcText);
		donationTotalTicks = 1;
		donationTotalLogoCurrentRotation ^= 1; // Toggle between 0 and 1.
	}
	
	// Change to donation total text after 10s.
	else if (donationTotalLogoCurrentRotation === 1 && donationTotalTicks >= 3) {
		animationFadeOutInElements(stcText, amountText);
		donationTotalTicks = 1;
		donationTotalLogoCurrentRotation ^= 1; // Toggle between 0 and 1.
	}
	
	// Update donation total if needed and we're currently on the amount text.
	else if (donationTotalLogoCurrentRotation === 0 && donationTotal.value !== lastDonationTotal) {
		// If the page has just been loaded, just print the current value, otherwise do the animation.
		if (!lastDonationTotal)
			amountText.html(formatDollarAmount(donationTotal.value, true));
		else
			animationUpdateDonationTotal(amountText, lastDonationTotal, donationTotal.value);
		
		lastDonationTotal = donationTotal.value;
	}
}