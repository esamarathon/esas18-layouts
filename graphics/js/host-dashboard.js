'use strict';
$(() => {
	// JQuery selectors.
	var donationTotalElement = $('#donationTotal');
	var prizesContainer = $('#prizesContainer');
	var bidsContainer = $('#bidsContainer');
	var runsContainer = $('#runsContainer');
	var stcInfoContainer = $('#stcInfoContainer');
	
	// Declaring variables.
	var prizeHTML = $('<div class="prize"><span class="prizeName"></span><br>Provided by <span class="prizeProvider"></span><br>minimum donation <span class="prizeMinDonation"></span><br>Ends: <span class="prizeEnd"></span></div>');
	var bidHTML = $('<div class="bid"><span class="bidGame"></span><br><span class="bidName"></span></div>')
	var runHTML = $('<div class="run"><span class="justMissed">YOU HAVE JUST WATCHED<br></span><span class="gameName"></span><br><span class="gameCategory"></span><br><span class="gameConsole"></span><br><span class="gameRunners"></span><br><span class="gameTime"></span><br><span class="gameFinal"></span></div>');
	var stcInfoIndex = 0;
	
	// This should go in external file really.
	var stcText = [
		'When the worst happens, children are always among the most vulnerable – and often suffer most. Save the Children responds to natural disasters, conflicts and other humanitarian emergencies across the globe with health, education and protection programs that address the unique needs of children in crisis.',
		'263 million children are out of school - that’s more than 1 in 6 school-aged children. Educating children gives the next generation the tools to fight poverty and prevent disease. A small contribution of $5 dollars can provide education supplies for one child, giving him/her the tools they need to continue their education.',
		'168 million children worldwide are involved in child labor - that’s more than all the children in Europe combined. Child labour deprives children the right to normal physical and mental development and often interferes with children’s education. $50 can pay for the attendance of an entire village school in a country like Uganda, including the cost of teacher training and salary, supplies, and curriculum. Educating children gives the next generation the tools to fight poverty and prevent disease.',
		'Globally, one girl under 15 gets married every seven seconds and every two seconds a child gives birth. Childbearing at a young age, when a girl’s body is not physically mature enough to deliver without complications, often leads to devastating consequences. Complications from pregnancy and childbirth are the second leading cause of death for girls. Child brides are often isolated, with their freedom curtailed. They frequently feel disempowered and are deprived of their rights to health, education and safety. Early childbearing also severely impacts the economies of communities and nations. For example, if all adolescent girls in Kenya completed secondary school, and if more than 200,000 adolescent mothers there were employed instead of having become pregnant, $3.4 billion could have been added to the economy. This is equivalent to the value of Kenya’s entire construction sector. You can make a positive change by making a contribution today helping Save the Children protect kids from child-pregnancies and child-marriage.',
		'Save the Children was founded nearly 100 years ago and today works in 120 countries. Known to be one of the most efficient and effective charities in the world and one of a few that focus on children. Last year Save the Children helped more than 157 million children around the globe. Thank you all for donating.',
		'Save the Children works in the heart of communities, where they help children and families help themselves. By providing education, infrastructure, healthcare and protection from harm. Save the Children works closely with other organizations, governments, non-profits and a variety of local partners while maintaining their own independence without political agenda or religious orientation. Help us, help them, in making the world a better place. Thank you all for donating.',
		'Your donations go towards Save the Children and their mission in giving children a healthy start in life, the opportunity to learn and protection from harm. Thank you.'
	]
	
	// Keep donation total updated.
	var donationTotal = nodecg.Replicant('donationTotal');
	donationTotal.on('change', newVal => {
		donationTotalElement.html(formatDollarAmount(donationTotal.value, true));
	});
	
	// Keep prizes updated.
	var prizes = nodecg.Replicant('prizes');
	prizes.on('change', newVal => {
		prizesContainer.html('');
		newVal.forEach(prize => {
			var prizeElement = prizeHTML.clone();
			$('.prizeName', prizeElement).html(prize.name);
			$('.prizeProvider', prizeElement).html(prize.provided);
			$('.prizeMinDonation', prizeElement).html(formatDollarAmount(prize.minimum_bid));
			console.log(prize.end_timestamp)
			$('.prizeEnd', prizeElement).html(moment(prize.end_timestamp).format('Do HH:mm'));
			prizesContainer.append(prizeElement);
		});
	});
	
	// Keep bids updated.
	var bids = nodecg.Replicant('bids');
	bids.on('change', newVal => {
		var i = 0;
		bidsContainer.html('');
		newVal.forEach(bid => {
			if (i >= 2) return;
			var bidElement = bidHTML.clone();
			$('.bidGame', bidElement).html(bid.game+' - '+bid.category);
			$('.bidName', bidElement).html(bid.name);
			// Donation Goal
			if (!bid.options) {
				var bidLeft = bid.goal - bid.total;
				bidElement.append('<br>'+formatDollarAmount(bid.total)+'/'+formatDollarAmount(bid.goal));
				bidElement.append('<br>'+formatDollarAmount(bidLeft)+' to goal'); 
			}
			// Bid War
			else {
				if (bid.options.length) {
					bid.options.forEach(option => {
						bidElement.append('<br>'+option.name+' ('+formatDollarAmount(option.total)+')')
					});
					
					if (bid.allow_user_options)
						bidElement.append('<br><i>Users can submit their own options.</i>')
				}
				else
					bidElement.append('<br><i>No options submitted yet.</i>')
			}
			bidsContainer.append(bidElement);
			i++;
		});
	});
	
	var runDataArray = nodecg.Replicant('runDataArray', 'nodecg-speedcontrol');
	var runDataActiveRun = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
	var runFinishTimes = nodecg.Replicant('runFinishTimes', 'nodecg-speedcontrol');
	var runFinishTimesInit = false;
	var runDataActiveRunInit = false;
	var runsInit = false;
	runFinishTimes.on('change', newVal => {
		runFinishTimesInit = true;
		if (!runsInit && runFinishTimesInit && runDataActiveRunInit) {
			setRuns();
			runsInit = true;
		}
	});
	runDataActiveRun.on('change', newVal => {
		runDataActiveRunInit = true;
		if (runFinishTimesInit && runDataActiveRunInit) {
			setRuns();
			runsInit = true;
		}
	});
	
	function setRuns() {
		runsContainer.html('');
		var indexOfCurrentRun = findIndexInRunDataArray(runDataActiveRun.value);
		for (var i = -1; i < 2; i++) {
			var run = runDataArray.value[indexOfCurrentRun+i];
			if (run) {
				var runElement = runHTML.clone();
				if (i === -1) {
					$('.justMissed', runElement).show();
					if (runFinishTimes.value[runDataActiveRun.value.runID-1]) {
						$('.gameFinal', runElement).html(runFinishTimes.value[runDataActiveRun.value.runID-1]);
						$('.gameFinal', runElement).show();
					}
				}
				else {
					$('.justMissed', runElement).hide();
					$('.gameFinal', runElement).hide();
				}
				$('.gameName', runElement).html(run.game);
				$('.gameCategory', runElement).html(run.category);
				$('.gameConsole', runElement).html(run.system);
				$('.gameRunners', runElement).html(formPlayerNamesString(run));
				$('.gameTime', runElement).html(run.estimate);
				runsContainer.append(runElement);
			}
		}
	}
	
	setStCText();
	nodecg.listenFor('hostdash_changeStCText', setStCText);
	function setStCText() {
		stcInfoContainer.html(stcText[stcInfoIndex]);
		stcInfoIndex++;
		if (stcInfoIndex >= stcText.length) stcInfoIndex = 0;
	}
});