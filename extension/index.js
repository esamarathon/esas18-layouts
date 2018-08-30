'use strict';
var nodecgAPIContext = require('./utils/nodecg-api-context');

module.exports = function(nodecg) {
	// Store a reference to this NodeCG API context in a place where other libs can easily access it.
	// This must be done before any other files are `require`d.
	nodecgAPIContext.set(nodecg);
	
	// Initalising some replicants.
	// Doing this in an extension so we don't need to declare the options everywhere else.
	// nothing here right now :(
	
	// Other extension files we need to load.
	require('./layouts');
	require('./emotes');
	require('./tracker');
	require('./music');
	require('./api');
}