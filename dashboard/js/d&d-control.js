'use strict';
$(() => {
    var dndPlayerStatus = nodecg.Replicant('dndPlayerStatus', {defaultValue: {
        0: true,
        1: true,
        2: true,
        3: true,
        4: true,
        5: true
    }});

    $('button').button();

    dndPlayerStatus.on('change', newVal => {
        for (var player in dndPlayerStatus.value) {
            var container = $('.killButton').eq(player);
            if (dndPlayerStatus.value[player])
                container.html('Kill');
            else
                container.html('Revive');
        }
    });

    $('.killButton').click((obj) => {
        var id = obj.currentTarget.id.replace('killButton', '');
        if (dndPlayerStatus.value[id])
            dndPlayerStatus.value[id] = false;
        else
            dndPlayerStatus.value[id] = true;
    });
});