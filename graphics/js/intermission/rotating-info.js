'use strict';
$(() => {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';

	var slides = nodecg.Replicant('assets:sponsor-slides');
	var currentScene = nodecg.Replicant('currentOBSScene');
	var bidsRep = nodecg.Replicant('bids');
	var prizesRep = nodecg.Replicant('prizes');

	var defaultRotate = 20000;
	var lastElem;
	var rotateIndex = 0;
	var rotateTotal = 4;
	var rotateTimeout;
	var videoEvt;

	NodeCG.waitForReplicants(slides, currentScene, bidsRep, prizesRep).then(() => {
		currentScene.on('change', newVal => {
			if (newVal.toLowerCase().includes('intermission')) {
				rotateIndex = 0;
				rotate();
			}

			else {
				clearTimeout(rotateTimeout);
				animationFadeOutElement(lastElem);

				// Stop/remove video if needed.
				$('#sponsorVideoPlayer')[0].removeEventListener('timeupdate', videoEvt);
				$('#sponsorVideoPlayer')[0].removeEventListener('ended', videoEvt);
				$('#sponsorVideoPlayer')[0].pause();
				$('#sponsorVideoPlayer > .videoSrc').removeAttr('src');
				$('#sponsorVideoPlayer')[0].load();
			}
		});
	});

	function rotate() {
		// Upcoming Runs
		if (rotateIndex === 0) {
			showUpcomingRuns();
		}

		// Sponsor Slides
		if (rotateIndex === 1 && slides.value.length) {
			showSponsorSlides();
		}

		// Bids
		if (rotateIndex === 2 && bidsRep.value.length) {
			showBids();
		}

		// Prizes
		if (rotateIndex === 3 && prizesRep.value.length) {
			showPrizes();
		}

		rotateIndex++;
		if (rotateIndex >= rotateTotal)
			rotateIndex = 0;
	}
	
	function showUpcomingRuns() {
		animationFadeOutElement(lastElem);
		lastElem = $('#rotatingComingUpRunsBox');
		animationFadeInElement($('#rotatingComingUpRunsBox'));
		rotateTimeout = setTimeout(rotate, defaultRotate);
	}
	
	function showPrizes() {
		var prize = prizesRep.value[getRandomInt(prizesRep.value.length)];
		var prizeBox = $('#rotatingPrizesBox');
		if (prize.image) {
			$('.prizeImg', prizeBox).show();
			$('.prizeImg', prizeBox).attr('src', prize.image);
		}
		else {
			$('.prizeImg', prizeBox).hide();
		}
		$('.prizeName > span', prizeBox).html(prize.name);
		$('.prizeProvider > span', prizeBox).html(prize.provided);
		$('.prizeMinDonation > span', prizeBox).html(formatDollarAmount(prize.minimum_bid));

		animationFadeOutElement(lastElem);
		lastElem = $('#rotatingPrizesBox');
		animationFadeInElement($('#rotatingPrizesBox'));
		rotateTimeout = setTimeout(rotate, defaultRotate);
	}

	function showBids() {
		var bidsBox = $('#rotatingBidsBox');
		var bid = bidsRep.value[getRandomInt(bidsRep.value.length)];
		var optionsString = '';

		// Normal Goal
		if (!bid.options) {
			$('.bidsHeader > span', bidsBox).html('Upcoming Goal');
			optionsString = formatDollarAmount(bid.total)+'/'+formatDollarAmount(bid.goal);
			$('.bidsAmount', bidsBox).css('font-size', '45px');
		}
		
		// Bid War
		else {
			$('.bidsHeader > span', bidsBox).html('Upcoming Bid War');
			$('.bidsAmount', bidsBox).css('font-size', '35px');
			var optionsFormatted = [];
			bid.options.forEach(option => {
				optionsFormatted.push(option.name+' ('+formatDollarAmount(option.total)+')');
			});
			if (!optionsFormatted.length)
				optionsString += '<i>No options submitted yet, be the first!</i>';
			else {
				if (bid.allow_user_options)
					optionsFormatted.push('<i>...or you could submit your own idea!</i>');
			}

			optionsFormatted = optionsFormatted.slice(0, 4);
			if (optionsFormatted.length) optionsString = optionsFormatted.join('<br>');
		}

		$('.bidsGame', bidsBox).html(bid.game+' - '+bid.category);
		$('.bidsName', bidsBox).html(bid.name);
		//$('.bidsDesc', bidsBox).html('('+bid.description+')');
		$('.bidsAmount', bidsBox).html(optionsString);
		
		animationFadeOutElement(lastElem);
		lastElem = $('#rotatingBidsBox');
		animationFadeInElement($('#rotatingBidsBox'));
		rotateTimeout = setTimeout(rotate, defaultRotate);
	}

	var sponsorIndex = 0;
	function showSponsorSlides() {
		var nextSponsorMedia = slides.value[sponsorIndex];

		var video = (nextSponsorMedia.ext.toLowerCase() === '.mp4') ? true : false;
		$('#sponsorVideoPlayer').hide();
		$('#sponsorSlideDisplay').hide();

		if (video) {
			$('#sponsorVideoPlayer > .videoSrc')[0].src = nextSponsorMedia.url;
			$('#sponsorVideoPlayer')[0].load();
			$('#sponsorVideoPlayer')[0].play();
			$('#sponsorVideoPlayer')[0].addEventListener('timeupdate', videoEvt = () => { // make sure the video is *actually* playing!
				// got to check the current time has gone beyond 0, then we know the video is *really* playing!
				// (this might only be an issue on my laptop though, beefier PCs might not need this much).
				if ($('#sponsorVideoPlayer')[0].currentTime <= 0) return;

				$('#sponsorVideoPlayer')[0].removeEventListener('timeupdate', videoEvt);
				$('#sponsorVideoPlayer').show();
				animationFadeOutElement(lastElem);
				lastElem = $('#rotatingSponsorSlidesBox');
				animationFadeInElement($('#rotatingSponsorSlidesBox'));

				$('#sponsorVideoPlayer')[0].addEventListener('ended', videoEvt = () => {
					rotate();
				}, {once: true});
			}, {once: false});
		}
		else {
			$('#sponsorSlideDisplay').css('background-image', 'url("'+nextSponsorMedia.url+'")');
			$('#sponsorSlideDisplay').waitForImages(() => {
				$('#sponsorSlideDisplay').show();
				animationFadeOutElement(lastElem);
				lastElem = $('#rotatingSponsorSlidesBox');
				animationFadeInElement($('#rotatingSponsorSlidesBox'));
				rotateTimeout = setTimeout(rotate, defaultRotate);
			});
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

				createUpcomingGameElem(nextRun, comingUpNextElem, null);
		
				for (var i = 1; i < nextRuns.length; i++) {
					whenTotal = formETAUntilRun(nextRuns[i-1], whenTotal)[1];
					var nextRunsContainer = $('<div class="comingUpContainer flexContainer">');
					createUpcomingGameElem(nextRuns[i], nextRunsContainer, formETAUntilRun(nextRuns[i-1], whenTotal)[0]);
					$('#rotatingComingUpRunsBox').append(nextRunsContainer);
				}
			}

			animationFadeInElement($('.comingUpContainer'));
		});
	});

	function createUpcomingGameElem(runData, elemToAppendTo, when) {
		var headerElem = $('<div class="comingUpHeader flexContainer">');
		var bodyElem = $('<div class="comingUpBody flexContainer">');

		if (!when)
			headerElem.html('Coming Up Next');
		else
			headerElem.html(when);

		// (this is messy)
		bodyElem.append('<div class="gameName">'+runData.game+'</div>');
		bodyElem.append('<div id="gameAdditionalDetails" class="flexContainer"><div class="gameCategory">'+runData.category+'</div><div class="gameConsole">'+runData.system+' </div><div class="gamePlayers">'+formPlayerNamesString(runData)+'</div></div>');

		elemToAppendTo.append(headerElem);
		elemToAppendTo.append(bodyElem);
	}
});