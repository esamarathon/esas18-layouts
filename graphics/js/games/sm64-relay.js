'use strict';
$(() => {
    var team1CurrentRunner = nodecg.Replicant('sm64_Team1');
    var team2CurrentRunner = nodecg.Replicant('sm64_Team2');
    
    team1CurrentRunner.on('change', newVal => {
        animationFadeOutElement($('#playerWrapperMulti1 > .playerContainer'), () => {
            $('#playerWrapperMulti1 > .playerContainer > .playerName').html(newVal.name);
            animationFadeInElement($('#playerWrapperMulti1 > .playerContainer'));
        });
    });
    
    team2CurrentRunner.on('change', newVal => {
        animationFadeOutElement($('#playerWrapperMulti2 > .playerContainer'), () => {
            $('#playerWrapperMulti2 > .playerContainer > .playerName').html(newVal.name);
            animationFadeInElement($('#playerWrapperMulti2 > .playerContainer'));
        });
    });
});