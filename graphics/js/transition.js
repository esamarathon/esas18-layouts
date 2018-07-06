'use strict';
$(() => {
	var animationTimeout;
	nodecg.listenFor('startTransition', () => {
		// Stop any currently running animations.
		clearTimeout(animationTimeout);
		$('#yellow').stop();
		$('#purple').stop();

		// Return images to correct positions.
		$('#yellow').css({left: '623px', top: '1080px'});
		$('#purple').css({left: '-623px', top: '-1080px'});

		// Animate lines to center.
		$('#yellow').animate({left: '0', top: '0'}, 800);
		$('#purple').animate({left: '0', top: '0'}, 800);

		// After a small amount of time, animate the lines off the other side.
		animationTimeout = setTimeout(() => {
			$('#yellow').animate({left: '-623px', top: '-1080px'}, 800);
			$('#purple').animate({left: '623px', top: '1080px'}, 800, () => {
				$('#yellow').removeAttr('style');
				$('#purple').removeAttr('style');
			});
		}, 1000);
	});
});