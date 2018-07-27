'use strict';
$(() => {
    var dndPlayerStatus = nodecg.Replicant('dndPlayerStatus');

    dndPlayerStatus.on('change', newVal => {
        for (var player in dndPlayerStatus.value) {
            var id = parseInt(player)+1;
            var container = $('#player'+id);

            if (dndPlayerStatus.value[player]) {
                // alive
                container.removeClass('dndDeadPlayer');
            }

            else {
                // dead
                container.addClass('dndDeadPlayer');
            }
        }
    });
});