'use strict';
$(() => {
	// Listens for the layout style to change.
	var currentLayout = nodecg.Replicant('currentGameLayout');
	currentLayout.on('change', newVal => {
		if (newVal) {
			$('#background').css('background-image', `url(img/templates/${newVal.code}.png)`);
		}
	});
});