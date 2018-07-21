'use strict';

// Declaring other variables.
var nodecg = require('./utils/nodecg-api-context').get();
var app = require('express')();

// Play Sponsor Video
app.get('/api/playsponsorvideo', (req, res) => {
	nodecg.sendMessage('playSponsorVideo');
	res.status(200);
	res.end();
});

// Change Save the Children text on the host dashboard.
app.get('/api/changestctext', (req, res) => {
	nodecg.sendMessage('hostdash_changeStCText');
	res.status(200);
	res.end();
});

nodecg.mount(app);