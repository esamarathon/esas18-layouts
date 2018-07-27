'use strict';
$(() => {
	// Names of everyone in each team.
	var team1 = [
        "Brobo_Sparkle",
        "Flotsa",
        "Ladaur",
        "Spineraks",
        "Paulister",
        "Call_me_zeroo",
        "Der_Finger",
        "Mr_Mary",
        "Phillotrax",
        "Dcecile",
        "Catalystz",
        "Shafourne",
        "Kanaris",
        "The_Handsome_Historian",
        "Harpa",
        "Klopklop25",
        "Zet237",
        "Ulvind",
        "Heinki",
        "Menno888",
        "Webba",
        "Baffan",
        "Zas",
        "Trollbear666",
        "Gamonymonus",
        "Whitefire",
        "Mergy",
        "MrTakahashi",
        "Mrzwanzig",
        "Geurge",
        "Joshimuz",
        "BaalNocturno",
        "Twister_DX",
        "BBF_",
        "WiredWicky",
        "Maral",
        "Grukk",
        "KrazyRasmus",
        "Amateseru",
        "YoshiM",
        "Project_",
        "Jackintoshh",
        "Fuzzy",
        "Ursi8885",
        "Ushebti",
        "Janmumrie",
        "Eidgod",
        "Leanmachae",
        "Argick",
        "Shigan_",
        "Jelluh24",
        "Minimusl",
        "Ya_GG",
        "Broeyeman",
        "Scopii",
        "Havrd",
        "Prasko",
        "Etem",
        "Akaraien",
        "Sajiki",
        "Chrisoofy", 
        "Virrward",
        "BlueHarvy",
        "Wilko",
        "Kungkobra",
        "DonDoli",
        "ISAIA",
        "Ryedawg",
        "Kyle",
        "Tezur0",
        "Fuzzyness", 
        "Edenal"
    ];
    var team2 = [
        "RoboSparkle",
        "Floha258",
        "Henyk",
        "Ambivalane",
        "Crrool",
        "zoton2",
        "Monojira",
        "Lolicry",
        "Losviken",
        "PsychoBunny",
        "Ehvis",
        "JamieMSM",
        "FIDLE",
        "DanteDoes", 
        "AeroSVK",
        "Kalarmar",
        "Jack of Hearts",
        "Wolfie437",
        "AuraBlackquill",
        "EN_T",
        "Qlexplore",
        "Marvelgirl186",
        "Popeter45",
        "E Semml",
        "Brongle",
        "Kenny",
        "Aetienne",
        "Linkboss",
        "Herreteman",
        "Echaen",
        "Antidotsrd",
        "Tharixer",
        "Jannik",
        "Rasmussw",
        "Rasschla",
        "Etholon", 
        "Phaseroll",
        "Noobest",
        "Humpe",
        "Mhmd_Fuc",
        "English_Ben",
        "Elfrozer",
        "Pottoww",
        "Liva",
        "Zacknir",
        "Theexecellentninja",
        "AcridStingRay3",
        "Kazzadan",
        "jan_susi",
        "Sasky",
        "SayviTV",
        "Sheikah_witch",
        "IrregularJinny",
        "Jaxtacy",
        "Kayvonn",
        "Poptartpony",
        "Sinister1",
        "xJakeDreamer",
        "Thiefbug",
        "tyriounet",
        "Linkus7",
        "Lennart",
        "Angelachan",
        "ParadoxKarl",
        "J4sp3rr",
        "Tom",
        "Petshop",
        "Shadowfrost",
        "Oldclov",
        "Fatzke",
        "360Chrism", 
        "ontwoplanks"
	];
	
	var team1CurrentRunner = nodecg.Replicant('sm64_Team1', {defaultValue: {
		pos: 0,
		name: team1[0]
	}});
	var team2CurrentRunner = nodecg.Replicant('sm64_Team2', {defaultValue: {
		pos: 0,
		name: team2[0]
	}});

	team1CurrentRunner.on('change', newVal => {
		$('#team1 > .teamMemberName').html((newVal.pos+1)+': '+newVal.name);
	});

	team2CurrentRunner.on('change', newVal => {
		$('#team2 > .teamMemberName').html((newVal.pos+1)+': '+newVal.name);
	});

	// Convert buttons into JQuery UI buttons.
	$('button').button();

	$('#team1 > .back').click(() => {
		if (team1CurrentRunner.value.pos-1 < 0) return; // at the start, can't go back more
		var i = team1CurrentRunner.value.pos;
		i--;
		team1CurrentRunner.value.pos = i;
		team1CurrentRunner.value.name = team1[i];
	});

	$('#team1 > .forward').click(() => {
		if (!team1[team1CurrentRunner.value.pos+1]) return; // at the end, can't go forward more
		var i = team1CurrentRunner.value.pos;
		i++;
		team1CurrentRunner.value.pos = i;
		team1CurrentRunner.value.name = team1[i];
	});

	$('#team2 > .back').click(() => {
		if (team2CurrentRunner.value.pos-1 < 0) return; // at the start, can't go back more
		var i = team2CurrentRunner.value.pos;
		i--;
		team2CurrentRunner.value.pos = i;
		team2CurrentRunner.value.name = team2[i];
	});

	$('#team2 > .forward').click(() => {
		if (!team2[team2CurrentRunner.value.pos+1]) return; // at the end, can't go forward more
		var i = team2CurrentRunner.value.pos;
		i++;
		team2CurrentRunner.value.pos = i;
		team2CurrentRunner.value.name = team2[i];
	});
});