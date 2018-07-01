'use strict';

// Simple fade out/in animation by using opacity.
function animationSetField(selector, newHTML, callback) {
	$(selector).animate({'opacity': '0'}, 1000, 'linear', () => {
		if (newHTML) selector.html(newHTML);
		$(selector).animate({'opacity': '1'}, 1000, 'linear', () => {
			if (callback) callback();
		});
	});
}

// Simple fade out for 1s.
function animationFadeOutElement(selector, callback) {
	$(selector).animate({'opacity': '0'}, 1000, 'linear', () => {
		if (callback) callback();
	});
}

// Simple fade in for 1s.
function animationFadeInElement(selector, callback) {
	$(selector).animate({'opacity': '1'}, 1000, 'linear', () => {
		if (callback) callback();
	});
}

// Shorthand function that combines the 2 above functions.
function animationFadeOutInElements(selector1, selector2, callback) {
	animationFadeOutElement(selector1);
	animationFadeInElement(selector2, () => {
		if (callback) callback();
	});
}

// Animation lasts under 1 tick (5s) so no extra callbacks are needed.
function animationUpdateDonationTotal(selector, oldVal, newVal) {
	$(selector)
	.prop('number', oldVal)
	.animateNumber({
		number: newVal,
		numberStep: function(now, tween) {
			var target = $(tween.elem);
			var value = formatDollarAmount(now, true)
			target.html(value);
		}
	}, 4000, 'linear');
}

// Used to clean player containers that are not needed.
// (This doesn't actually clear them, just hides the elements for now).
function animationCleanPlayerData(selector) {
	var elementsToFadeOut = '.playerLogo, .playerText, .playerFlag, .playerCoOp';
	$(selector).find(elementsToFadeOut).animate({'opacity': '0'}, 1000, 'linear');
}

function animationChangePlayerData(selector, playerData, twitch, hideCoop, showCoop) {
	// Get a URL for flag image if region is set, if old and new URL are the same, nothing is done.
	if (playerData.region)
		var flagURL = 'https://www.speedrun.com/images/flags/'+playerData.region.toLowerCase()+'.png';
	var leaveFlag = $('.playerFlag', selector).attr('src') === flagURL;
	
	// Configuring elements that need fading out this time.
	var elementsToFadeOut = '.playerLogo, .playerText';
	if (!leaveFlag) elementsToFadeOut += ', .playerFlag';
	if (hideCoop) elementsToFadeOut += ', .playerCoOp';
	
	// Do the actual fading out by going to opacity 0.
	$(selector).find(elementsToFadeOut).animate({'opacity': '0'}, 1000, 'linear');
	
	// Triggers once everything from the above animate is done.
	$(selector).find(elementsToFadeOut).promise().done(() => {
		// Hide these elements if we want to completely remove them.
		if (!leaveFlag) $('.playerFlag', selector).hide();
		if (hideCoop) $('.playerCoOp', selector).hide();
		
		if (twitch) {
			var name = (playerData.twitch) ? '/'+playerData.twitch : '???';
			$('.playerLogo', selector).removeClass('nameLogo').addClass('twitchLogo');
		}
		
		else {
			var name = playerData.name;
			$('.playerLogo', selector).removeClass('twitchLogo').addClass('nameLogo');
		}
		
		$('.playerText', selector).html(name);
		
		// If changing the flag and we have a URL to set, do that and show it.
		if (!leaveFlag && flagURL) {
			$('.playerFlag', selector).attr('src', flagURL);
			$('.playerFlag', selector).show();
		}
		
		// Configuring elements that need fading in this time.
		var elementsToFadeIn = '.playerLogo, .playerText';
		if (!leaveFlag) elementsToFadeIn += ', .playerFlag';
		if (showCoop) {
			elementsToFadeIn += ', .playerCoOp';
			$('.playerCoOp', selector).show();
		}
		
		// Do the actual fading in by going to opacity 1.
		$(selector).find(elementsToFadeIn).animate({'opacity': '1'}, 1000, 'linear');
	});
}

function animationChangeSponsorImage(element, assetURL) {
	// Add in the next sponsor logo.
	var nextElement = $('<img class="sponsorLogo sponsorLogoNext">').appendTo(element);
	nextElement.attr('src', assetURL);
	nextElement.on('load', () => {
		// Fade out current sponsor logo.
		var currentElement = $('.sponsorLogoCurrent', element);
		currentElement.animate({'opacity': '0'}, 1000, 'linear');
		
		// Some code to figure out how to fit the sponsor images into the available box.
		var containerAR = element.width()/element.height();
		var logoAR = nextElement.width()/nextElement.height();
		//console.log('containerAR: '+containerAR*1.5);
		//console.log('logoAR: '+logoAR);
		var fillClass = (containerAR*1.5 > logoAR) ? 'fillheight' : 'fillwidth';
		if ($('html').attr('data-sceneid') === '16_9-2p-mcbingo') fillClass = 'fillwidth'; // Manual override for this scene.
		nextElement.addClass(fillClass);
		
		// Fade in next sponsor logo and change the classes.
		nextElement.animate({'opacity': '1'}, 1000, 'linear', () => {
			currentElement.remove();
			nextElement.removeClass('sponsorLogoNext').addClass('sponsorLogoCurrent');
		});
	});
}