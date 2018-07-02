'use strict';
const nodecg = require('./utils/nodecg-api-context').get();
const mpd = require('mpd');

var mpdConfig = nodecg.bundleConfig.mpd || {};
var volume = mpdConfig.volume || 10;

// Stores song data to be displayed on layouts.
var songData = nodecg.Replicant('songData', {
	defaultValue: {
		'title': 'No Track Playing',
		'playing': false
	},
	persistent: false
});

// Set up connection to MPD server.
var client;
connect();
function connect() {
	client = mpd.connect({
		host: mpdConfig.address || 'localhost',
		port: mpdConfig.port || 6600
	});

	// Set up events.
	client.on('connect', onConnect);
	client.on('ready', onReady);
	client.on('end', onEnd);
	client.on('error', onError);
	client.on('system-player', onSystemPlayer);
}

function onConnect() {
	nodecg.log.info('MPD connection successful.');
}

function onReady() {
	client.sendCommand('status', (err, msg) => {
		var status = mpd.parseKeyValueMessage(msg);

		// If the current playlist has songs in it, we assume the MPD player is already set up correctly.
		if (status.playlistlength <= 0) {
			nodecg.log.info('Doing initial MPD configuration.');
			client.sendCommand('add /');    // Add all songs to play queue.
			client.sendCommand('random 1'); // Set player to random mode.
			client.sendCommand('repeat 1'); // Set player to repeat.
			client.sendCommand('play');     // Play songs.
		}

		// Always set volume on connection just in case, but we need to wait a little for some reason (probably for playback to commence).
		setTimeout(() => client.sendCommand('setvol '+volume), 2000);

		updatePlaybackStatus();
		updateCurrentSong();
	});
}

function onEnd() {
	nodecg.log.warn('MPD connection lost, retrying in 5 seconds.');
	setTimeout(connect, 5000);
}

function onError(err) {
	nodecg.log.warn('MPD connection error:', err);
}

// Update stuff when the player status changes.
function onSystemPlayer() {
	updatePlaybackStatus();
	updateCurrentSong();
}

// Used to update the replicant to say if there is a song playing or not.
function updatePlaybackStatus() {
	client.sendCommand('status', (err, msg) => {
		var status = mpd.parseKeyValueMessage(msg);
		if (status.state !== 'play') {
			songData.value.playing = false;
			songData.value.title = 'No Track Playing';
		}
		else
			songData.value.playing = true;
	});
}

// Used to update the replicant to include the title/artist.
function updateCurrentSong() {
	client.sendCommand('currentsong', (err, msg) => {
		var currentSong = mpd.parseKeyValueMessage(msg);
		var songTitle = currentSong.Title+' - '+currentSong.Artist;
		if (songTitle !== songData.value.title && songData.value.playing)
			songData.value.title = songTitle;
	});
}

// Can be used to pause/unpause music track.
function toggleSongPlayback(pause) {
	var pause = pause ? '1' : '0';
	client.sendCommand('pause '+pause);
}

// Can be used to skip to the next song.
function skipSong() {
	client.sendCommand('next');
}