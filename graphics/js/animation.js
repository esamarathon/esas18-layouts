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