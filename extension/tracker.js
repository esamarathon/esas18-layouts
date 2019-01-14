'use strict';

// The bundle name where all the run information is pulled from.
var speedcontrolBundle = 'nodecg-speedcontrol';

// Referencing packages.
var cheerio = require('cheerio');
var request = require('request-promise').defaults({jar: true}); // Automatically saves and re-uses cookies.

// Declaring other variables.
var nodecg = require('./utils/nodecg-api-context').get();
var statsURL = 'https://donations.esamarathon.com/8?json';
var repeaterURL = 'https://repeater.esamarathon.com';
var loginURL = 'https://donations.esamarathon.com/admin/login/';
var isFirstLogin = true;
var eventShort = 'uksgw2019';

// Replicants.
var donationTotal = nodecg.Replicant('donationTotal', {defaultValue: 0});
var recentDonations = nodecg.Replicant('recentDonations', {defaultValue: []});

if (!nodecg.bundleConfig.tracker) {
	nodecg.log.error('You must set the tracker login details in the config file.');
	process.exit(1);
}

// Getting the initial donation total on startup.
updateDontationTotalFromAPI();
setInterval(updateDontationTotalFromAPI, 60000); // Also do this every 60s as a socket fallback.

// Get donation total from HTTPS API, backup for the repeater socket server.
function updateDontationTotalFromAPI() {
	request(statsURL, (err, resp, body) => {
		if (!err && resp.statusCode === 200) {
			body = JSON.parse(body);
			var total = body.agg.amount ? parseFloat(body.agg.amount) : 0;
			if (donationTotal.value !== total)
				nodecg.log.info('API donation total changed:', '$'+total);
			donationTotal.value = total;
		}
	});
}

// Log into the tracker before querying stuff on it.
loginToTracker().then(() => {
	require('./tracker-bids');
	require('./tracker-prizes');
});

// Tracker logins expire every 2 hours. Re-login every 90 minutes.
setInterval(loginToTracker, 90*60*1000);

// Repeater socket server connecting/error stuff.
var repeater = require('socket.io-client')(repeaterURL);
repeater.on('connect', () => nodecg.log.info('Connected to repeater server:', repeaterURL));
repeater.on('connect_error', err => nodecg.log.warn('Repeater socket connect_error:', err));
repeater.on('disconnect', () => nodecg.log.warn('Disconnected from repeater socket.'));
repeater.on('error', err => nodecg.log.warn('Repeater socket error:', err));

// Triggered when a new donation that can be shown on stream is received.
repeater.on('donation', data => {
	// Only accept the donation if it's for this stream.
	if (data.event === eventShort) {
		nodecg.log.info('Received new donation with ID %s.', data.id);
		recentDonations.value.push(data);
		
		// Caps this replicant to 10.
		if (recentDonations.value.length > 10)
			recentDonations.value = recentDonations.value.slice(0, 10);
		
		nodecg.sendMessage('newDonation', data);
	}
});

// Triggered when the updated donation total is received.
repeater.on('total', data => {
	donationTotal.value = parseFloat(data.new_total);
	nodecg.log.info('Updated donation total received:', '$'+parseFloat(data.new_total).toFixed(2));
});

// Triggered when data is received from the omnibar moderation website.
// Currently can either be Twitch subscribers or Twitter tweets.
repeater.on('omnibarMod', data => {
	// Tweets from Twitter.
	if (data.provider === 'twitter' && data.type === 'tweet') {
		nodecg.sendMessage('newTweet', data);
	}

	else if (data.provider === 'twitch') {
		nodecg.sendMessage('newSub', data);

		/*if (data.type === 'sub') {}
		if (data.type === 'resub') {}
		if (data.type === 'giftsub') {}*/
	}
});

// https://github.com/GamesDoneQuick/agdq18-layouts/blob/master/extension/index.js
// Fetch the login page, and run the response body through cheerio
// so we can extract the CSRF token from the hidden input field.
// Then, POST with our username, password, and the csrfmiddlewaretoken.
function loginToTracker() {
	if (isFirstLogin) {
		nodecg.log.info('Logging into the tracker as %s.', nodecg.bundleConfig.tracker.username);
	} else {
		nodecg.log.info('Refreshing tracker login session as %s.', nodecg.bundleConfig.tracker.username);
	}

	return request({
		uri: loginURL,
		transform(body) {
			return cheerio.load(body);
		}
	}).then($ => request({
		method: 'POST',
		uri: loginURL,
		form: {
			username: nodecg.bundleConfig.tracker.username,
			password: nodecg.bundleConfig.tracker.password,
			csrfmiddlewaretoken: $('#login-form > input[name="csrfmiddlewaretoken"]').val()
		},
		headers: {
			Referer: loginURL
		},
		resolveWithFullResponse: true,
		simple: false
	})).then(() => {
		if (isFirstLogin) {
			isFirstLogin = false;
			nodecg.log.info('Logged into the tracker as %s.', nodecg.bundleConfig.tracker.username);
		} else {
			nodecg.log.info('Refreshed tracker session as %s.', nodecg.bundleConfig.tracker.username);
		}
	}).catch(err => {
		nodecg.log.error('Error authenticating!\n', err);
	});
}