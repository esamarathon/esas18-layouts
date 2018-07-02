'use strict';

// Referencing packages.
var cheerio = require('cheerio');
var request = require('request-promise').defaults({jar: true}); // Automatically saves and re-uses cookies.

// Declaring other variables.
var nodecg = require('./utils/nodecg-api-context').get();
var statsURL1 = 'https://donations.esamarathon.com/2?json';
var statsURL2 = 'https://donations.esamarathon.com/4?json';
var repeaterURL = 'https://repeater.esamarathon.com';
var loginURL = 'https://donations.esamarathon.com/admin/login/';
var isFirstLogin = true;
var stream1Total = 0;
var stream2Total = 0;

var eventShort = '2018s1';
if (nodecg.bundleConfig.stream2)
	eventShort = '2018s2';

// Replicants.
var donationTotal = nodecg.Replicant('donationTotal', {defaultValue: 0});
var recentDonations = nodecg.Replicant('recentDonations', {defaultValue: []});

if (!nodecg.bundleConfig.tracker) {
	nodecg.log.error('You must set the tracker login details in the config file.');
	process.exit(1);
}

// Getting the initial donation total on startup.
// We need to add both events together to get the correct total.
var total = 0;
request(statsURL1, (err, resp, body) => {
	if (!err && resp.statusCode === 200) {
		body = JSON.parse(body);
		var streamTotal = body.agg.amount ? parseFloat(body.agg.amount) : 0;
		total += streamTotal;
		stream1Total = streamTotal;
	}
}).then(() => {
	request(statsURL2, (err, resp, body) => {
		if (!err && resp.statusCode === 200) {
			body = JSON.parse(body);
			var streamTotal = body.agg.amount ? parseFloat(body.agg.amount) : 0;
			total += streamTotal;
			stream2Total = streamTotal;
		}
	}).then(() => {
		donationTotal.value = total;
		nodecg.log.info('Initial donation total checked:', '$'+total);
	});
});

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
	// Update the relevant variable depending on the event.
	if (data.event === '2018s1')
		stream1Total = parseFloat(data.new_total);
	if (data.event === '2018s2')
		stream2Total = parseFloat(data.new_total);
	
	var bothTotals = stream1Total + stream2Total;
	donationTotal.value = bothTotals
	nodecg.log.info('Updated donation total received:', '$'+bothTotals.toFixed(2));
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