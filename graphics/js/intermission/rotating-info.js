'use strict';
$(() => {
	// The bundle name where all the run information is pulled from.
	var speedcontrolBundle = 'nodecg-speedcontrol';

	var slides = nodecg.Replicant('assets:sponsor-slides');
	var bidsRep = nodecg.Replicant('bids');
	var prizesRep = nodecg.Replicant('prizes');
	var runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);

	var defaultRotate = 20000;
	var lastElem;
	var rotateIndex = 0;
	var rotateTotal = 4;
	var rotateTimeout;
	var videoEvt;

	NodeCG.waitForReplicants(slides, bidsRep, prizesRep, runDataActiveRun).then(() => {
		refreshNextRunsData();
		rotate();
	});

	function rotate() {
		clearTimeout(rotateTimeout);
		var retry = true;

		// Upcoming Runs
		if (rotateIndex === 0) {
			showUpcomingRuns();
			retry = false;
		}

		// Sponsor Slides
		if (rotateIndex === 1 && slides.value.length) {
			showSponsorSlides();
			retry = false;
		}

		// Bids
		if (rotateIndex === 2 && bidsRep.value.length) {
			showBids();
			retry = false;
		}

		// Prizes
		if (rotateIndex === 3 && prizesRep.value.length) {
			showPrizes();
			retry = false;
		}

		rotateIndex++;
		if (rotateIndex >= rotateTotal)
			rotateIndex = 0;

		if (retry)
			rotate();
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
		$('#prizeName', prizeBox).html(prize.name);
		$('#prizeProvider', prizeBox).html(prize.provided);
		$('#prizeMinDonation', prizeBox).html(formatDollarAmount(prize.minimum_bid));
		$('#prizeDeadline', prizeBox).html(getPrizeTimeUntilString(prize));

		animationFadeOutElement(lastElem);
		lastElem = $('#rotatingPrizesBox');
		animationFadeInElement($('#rotatingPrizesBox'));
		rotateTimeout = setTimeout(rotate, defaultRotate);
	}

	function showBids() {
		var bidsBox = $('#rotatingBidsBox');
		var bid = getRandomBid();
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

	// returns a random bid (filtered to bids in the next 24h, with a slight bias towards bids coming soon)
	var lastBidID = null;
	function getRandomBid() {
		const bidChoices = [];
		let totalWeight = 0;
		bidsRep.value.forEach(bid => {
			// anything within the next 10 minutes has a relative weight of 1, beyond that theres a quadratic falloff
			let weight = Math.max(Math.min(10 * 60 * 1000 / (bid.end_time - Date.now()), 1), 0) ** 2;
			if (bid.id === lastBidID) weight = 0;
			bidChoices.push({ bid, weight });
			totalWeight += weight;
		});
		let randomValue = Math.random();
		const bidToReturn = bidChoices.find(option => {
			// the actual chance is the relative weight divided by the total weight
			const chance = option.weight / totalWeight;
			if (chance >= randomValue) {
				lastBidID = option.bid.id;
				return true;
			}
			randomValue -= chance;
			return false;
		});
		if (bidToReturn) return bidToReturn.bid;
		return null;
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
	
	// (As of writing) triggered from a dashboard button and also when a run's timer ends
	/*nodecg.listenFor('forceRefreshIntermission', () => {
		refreshNextRunsData();
	});*/
	
	function refreshNextRunsData() {
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
					var formedETA = formETAUntilRun(nextRuns[i-1], whenTotal);
					whenTotal = formedETA[1];
					var nextRunsContainer = $('<div class="comingUpContainer flexContainer">');
					createUpcomingGameElem(nextRuns[i], nextRunsContainer, formedETA[0]);
					$('#rotatingComingUpRunsBox').append(nextRunsContainer);
				}
			}

			animationFadeInElement($('.comingUpContainer'));
		});
	}

	function createUpcomingGameElem(runData, elemToAppendTo, when) {
		var headerElem = $('<div class="comingUpHeader flexContainer">');
		var bodyElem = $('<div class="comingUpBody flexContainer">');

		if (!when)
			headerElem.html('Coming Up Next');
		else
			headerElem.html('Coming Up '+when);
		
		bodyElem.append('<div class="gameName">'+runData.game+'</div>');
		var additionalDetails = $('<div id="gameAdditionalDetails" class="flexContainer">');
		if (runData.category) additionalDetails.append('<div class="gameCategory">'+runData.category+'</div>');
		if (runData.system) additionalDetails.append('<div class="gameConsole">'+runData.system+'</div>');
		if (checkForTotalPlayers(runData) > 0) additionalDetails.append('<div class="gamePlayers">'+formPlayerNamesString(runData)+'</div>');
		if (runData.estimate) additionalDetails.append('<div class="estimate">EST: '+runData.estimate+'</div>');
		bodyElem.append(additionalDetails);
		elemToAppendTo.append(headerElem);
		elemToAppendTo.append(bodyElem);
	}

	nodecg.listenFor('twitchAdStarted', speedcontrolBundle, adInfo => {
		setAdCountdown(adInfo.duration);
	});

	var adEnds = 0;
	function setAdCountdown(duration) {
		adEnds = Date.now() + duration * 1000;
		updateAdCountdown();
	}

	function lpad(str, format) {
		if(format.length > str.length) return format.slice(0, format.length - str.length)+str;
		else return str;
	}

	function updateAdCountdown() {
		const remainingAdTime = (adEnds - Date.now())/1000;
		if(remainingAdTime > 0) {
			const minutes = ''+Math.floor(remainingAdTime/60);
			const seconds = ''+Math.floor(remainingAdTime - minutes*60);
			$('#twitchAdCountdownTime').text(`${lpad(minutes, '00')}:${lpad(seconds, '00')}`);
			$('#twitchAdCountdownTimer').show();
			setTimeout(updateAdCountdown, 100);
		} else {
			$('#twitchAdCountdownTime').text('00:00');
			$('#twitchAdCountdownTimer').hide('fast');
		}
	}
});