'use strict';
$(() => {
	// TODO: stop this while on other scenes to save resources, restart on return

	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';

	var slides = nodecg.Replicant('assets:sponsor-slides');

	var lastElem = $('#nonExistent');

	var rotateIndex = 0;
	var rotateTotal = 2;
	rotate();
	function rotate() {
		if (rotateIndex === 0) {
			// upcoming
			showUpcomingRuns();
		}

		if (rotateIndex === 1) {
			// sponsor slide
			showSponsorSlides();

		}

		rotateIndex++;
		if (rotateIndex >= rotateTotal) {
			rotateIndex = 0;
		}
	}
	
	function showUpcomingRuns() {
		animationFadeOutElement(lastElem);
		lastElem = $('#rotatingComingUpRunsBox');
		animationFadeInElement($('#rotatingComingUpRunsBox'));
		setTimeout(rotate, 10000);
	}

	var sponsorIndex = 1;
	function showSponsorSlides() {
		var nextSponsorMedia = slides.value[sponsorIndex];

		var video = (nextSponsorMedia.ext.toLowerCase() === '.mp4') ? true : false;
		$('#sponsorVideoPlayer').hide();
		$('#sponsorSlideDisplay').hide();

		var evt;
		if (video) {
			$('#sponsorVideoPlayer > .videoSrc')[0].src = nextSponsorMedia.url;
			$('#sponsorVideoPlayer')[0].load();
			$('#sponsorVideoPlayer')[0].play();
			$('#sponsorVideoPlayer')[0].addEventListener('timeupdate', evt = () => { // make sure the video is *actually* playing!
				// got to check the current time has gone beyond 0, then we know the video is *really* playing!
				if ($('#sponsorVideoPlayer')[0].currentTime <= 0) return;

				$('#sponsorVideoPlayer')[0].removeEventListener('timeupdate', evt);
				$('#sponsorVideoPlayer').show();
				animationFadeOutElement(lastElem);
				lastElem = $('#rotatingSponsorSlidesBox');
				animationFadeInElement($('#rotatingSponsorSlidesBox'));

				$('#sponsorVideoPlayer')[0].addEventListener('ended', () => {
					rotate();
				}, {once: true});
			}, {once: false});
		}
		else {
			// needs to use waitForImages if possible so we know the image has loaded before transitioning
			$('#sponsorSlideDisplay').css('background-image', 'url("'+nextSponsorMedia.url+'")');
			$('#sponsorSlideDisplay').show();
			animationFadeOutElement(lastElem);
			lastElem = $('#rotatingSponsorSlidesBox');
			animationFadeInElement($('#rotatingSponsorSlidesBox'));
			setTimeout(rotate, 10000);
		}

		sponsorIndex++;
		if (sponsorIndex >= slides.value.length) {
			sponsorIndex = 0;
		}
	}
	
	// Update upcoming game info when needed.
	var runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	runDataActiveRun.on('change', newVal => {
		var nextRuns = getNextRuns(runDataActiveRun.value, 4);
		var whenTotal = 0; // Totals all the estimates for calculating the "in about X" lines.

		animationFadeOutElement($('.comingUpContainer'), () => {
			var comingUpNextElem = $('#comingUpNext');
			comingUpNextElem.empty();
			$('#rotatingComingUpRunsBox').empty();
	
			if (nextRuns.length >= 1) {
				var nextRun = nextRuns[0];

				// Stuff for the string that appears at the time with an ETA.
				whenTotal = formETAUntilRun(null, whenTotal)[1];

				createUpcomingGameElem(null, nextRun, comingUpNextElem, null, true);
		
				for (var i = 1; i < nextRuns.length; i++) {
					whenTotal = formETAUntilRun(nextRuns[i-1], whenTotal)[1];
					var nextRunsContainer = $('<div class="comingUpContainer flexContainer">');
					createUpcomingGameElem(nextRuns[i-1], nextRuns[i], nextRunsContainer, formETAUntilRun(nextRuns[i-1], whenTotal)[0]);
					$('#rotatingComingUpRunsBox').append(nextRunsContainer);
				}
			}

			animationFadeInElement($('.comingUpContainer'));
		});
	});

	function createUpcomingGameElem(lastRun, runData, elemToAppendTo, when, next) {
		// Player Name(s)
		var players = formPlayerNamesString(runData);

		var headerElem = $('<div class="comingUpHeader flexContainer">');
		var bodyElem = $('<div class="comingUpBody flexContainer">');

		if (!when) {
			headerElem.html('Coming Up Next');
		}
		else {
			headerElem.html(when);
		}

		bodyElem.append('<div class="gameName">'+runData.game+'</div>');
		bodyElem.append('<div id="gameAdditionalDetails" class="flexContainer"><div class="gameCategory">'+runData.category+'</div><div class="gameConsole">'+runData.system+' </div><div class="gamePlayers">'+players+'</div></div>');

		elemToAppendTo.append(headerElem);
		elemToAppendTo.append(bodyElem);
	}
});