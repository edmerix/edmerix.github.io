const greeting = true;

let terminal = [],
	instances;
const table_border = false; // move this into a settings object later, to be loaded externally.

let stations = {};

document.addEventListener("DOMContentLoaded", function(){

	instances = terminal.length;
	terminal[instances] = new Terminal(instances,"$>","main-input_"+instances,"cmd-history_"+instances,"cmd-prompt_"+instances,"term_"+instances,"themes.json");

	update_positions();

	// load local settings here
	/*
	//save example:
	settings = JSON.stringify(settings);
	localStorage.setItem("settings",settings);

	//load example:
	var settings = JSON.parse(localStorage.getItem("settings"))
	if(settings === null){
		return [0, "<i>You currently have no settings stored</i>"];
	}
	*/

	terminal[instances].input_div.focus();

	// load up the JSON file of subway station data (yes, the data format seems weird, but it's the simplest way of going from inaccurate station name and subway line to a station code):
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'stations.json', true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		stations = xhr.response;
	};
	xhr.onerror = function(err){
		stations = -1;
		console.log("Couldn't load subway station data, subway function will not work");
	}
	xhr.send(null);
	boot();
});

function boot(){
	if(greeting){
        //WELCOME message immediate output: (ridiculous use of non-breaking spaces to create the ASCII art version of my name...)
        terminal[instances].output('&nbsp;_____&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;__&nbsp;&nbsp;__&nbsp;__&nbsp;&nbsp;__&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____&nbsp;&nbsp;&nbsp;\n\
		|&nbsp;____|__|&nbsp;|_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____&nbsp;_&nbsp;_&nbsp;__&nbsp;__|&nbsp;|&nbsp;&nbsp;\\/&nbsp;&nbsp;|&nbsp;&nbsp;\\/&nbsp;&nbsp;|&nbsp;___&nbsp;_&nbsp;__&nbsp;_&nbsp;__(_)&nbsp;___|&nbsp;|&nbsp;_____&nbsp;&nbsp;|&nbsp;&nbsp;_&nbsp;\\|&nbsp;|__&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;_&nbsp;\\&nbsp;&nbsp;\n\
		|&nbsp;&nbsp;_|&nbsp;/&nbsp;_`&nbsp;\\&nbsp;\\&nbsp;/\\&nbsp;/&nbsp;/&nbsp;_`&nbsp;|&nbsp;\'__/&nbsp;_`&nbsp;|&nbsp;|\\/|&nbsp;|&nbsp;|\\/|&nbsp;|/&nbsp;_&nbsp;\\&nbsp;\'__|&nbsp;\'__|&nbsp;|/&nbsp;__|&nbsp;|/&nbsp;/&nbsp;__|&nbsp;|&nbsp;|_)&nbsp;|&nbsp;\'_&nbsp;\\&nbsp;&nbsp;|&nbsp;|&nbsp;|&nbsp;|&nbsp;\n\
		|&nbsp;|__|&nbsp;(_|&nbsp;|\\&nbsp;V&nbsp;&nbsp;V&nbsp;/&nbsp;(_|&nbsp;|&nbsp;|&nbsp;|&nbsp;(_|&nbsp;|&nbsp;|&nbsp;&nbsp;|&nbsp;|&nbsp;|&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;__/&nbsp;|&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;|&nbsp;|&nbsp;(__|&nbsp;&nbsp;&nbsp;<\\__&nbsp;\\_|&nbsp;&nbsp;__/|&nbsp;|&nbsp;|&nbsp;|_|&nbsp;|_|&nbsp;|&nbsp;\n\
		|_____\\__,_|&nbsp;\\_/\\_/&nbsp;\\__,_|_|&nbsp;&nbsp;\\__,_|_|&nbsp;&nbsp;|_|_|&nbsp;&nbsp;|_|\\___|_|&nbsp;&nbsp;|_|&nbsp;&nbsp;|_|\\___|_|\\_\\___(&nbsp;)_|&nbsp;&nbsp;&nbsp;|_|&nbsp;|_(_)____(_)\n\
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|/');

        terminal[instances].output('Ed is a scientist in the Department of Neurology at Columbia University Medical Center. He also sometimes does art, and plays a bit of music.\n\
		To find out more about the science, try its command below ("@{science info}"), or to quickly see a list of peer-reviewed papers enter "@{papers}"\n\
		To get more help, type "@{help}" and hit enter. <small>(Highlighted commands here can also be clicked to run them...)</small>@__\
		Note there are some cool things that aren\'t installed by default... Use @{pkg} command to see available packages\n\
		Try @{install session}, followed by @{session}, then @{theme orange}\n\
		After that, try out @{install tedit}, then @{tedit} for a (super) minimal text editor.\n\
		When in tedit, hit cmd/ctrl+~ to open the console, and type ![save] to save your file.@__\
		If you made it this far, perhaps check out my <a href="https://www.github.com/edmerix" target="_blank">GitHub</a>, where all the <a href="https://www.github.com/edmerix/edmerix.github.io" target="_blank">code for this pseudo-terminal</a> is available');
    }
}

function update_positions(){
	// this feels clunky. It works well, but was coded in a rush; could probably be done more elegantly
	let homes = [];
	let open = "";
	for(let i = 3; i >= 0; i--){
		if(typeof(terminal[i]) == "object"){
			open += "1";
			homes[i] = terminal[i].body;
			homes[i].style.display = "block";
		}else{
			open += "0";
			// auto-hide its element, since we no longer have access to its terminal[i].body value:
			homes[i] = document.getElementById("term_"+i);
			homes[i].style.display = "none";
		}
	}
	const b = parseInt(open,2); // parse as base 2.

	const half = 'calc(50% - 1px)';
	const full = '100%';

	switch(b){
		case 0: // binary: 0000
			// None open, should all have been hidden above.
			break;
		case 1: // binary: 0001
			homes[0].style.width = full; homes[0].style.height = full;
			break;
		case 2: // binary: 0010
			homes[1].style.width = full; homes[1].style.height = full;
			break;
		case 3: // binary: 0011
			homes[0].style.width = half; homes[0].style.height = full;
			homes[1].style.width = half; homes[1].style.height = full;
			break;
		case 4: // binary: 0100
			homes[2].style.width = full; homes[2].style.height = full;
			break;
		case 5: // binary: 0101
			homes[0].style.width = half; homes[0].style.height = full;
			homes[2].style.width = half; homes[2].style.height = full;
			break;
		case 6: // binary: 0110
			homes[1].style.width = full; homes[1].style.height = half;
			homes[2].style.width = full; homes[2].style.height = half;
			break;
		case 7: // binary: 0111
			homes[0].style.width = half; homes[0].style.height = full;
			homes[1].style.width = half; homes[1].style.height = half;
			homes[2].style.width = half; homes[2].style.height = half;
			break;
		case 8: // binary: 1000
			homes[3].style.width = full; homes[3].style.height = full;
			break;
		case 9: // binary: 1001
			homes[0].style.width = full; homes[0].style.height = half;
			homes[3].style.width = full; homes[3].style.height = half;
			break;
		case 10: // binary: 1010
			homes[1].style.width = full; homes[1].style.height = half;
			homes[3].style.width = full; homes[3].style.height = half;
			break;
		case 11: // binary: 1011
			homes[0].style.width = half; homes[0].style.height = half;
			homes[1].style.width = half; homes[1].style.height = full;
			homes[3].style.width = half; homes[3].style.height = half;
			break;
		case 12: // binary: 1100
			homes[2].style.width = half; homes[2].style.height = full;
			homes[3].style.width = half; homes[3].style.height = full;
			break;
		case 13: // binary: 1101
			homes[0].style.width = full; homes[0].style.height = half;
			homes[2].style.width = half; homes[2].style.height = half;
			homes[3].style.width = half; homes[3].style.height = half;
			break;
		case 14: // binary: 1110
			homes[1].style.width = full; homes[1].style.height = half;
			homes[2].style.width = half; homes[2].style.height = half;
			homes[3].style.width = half; homes[3].style.height = half;
			break;
		case 15: // binary: 1111
			for(let a = 0; a < 4; a++){
				homes[a].style.width = half;
				homes[a].style.height = half;
			}
			break;
		default:
			console.log("Error redistributing remaining screens");
	}
}
function escapeHTML(string){
    var pre = document.createElement('pre');
    var text = document.createTextNode(string);
    pre.appendChild(text);
    return pre.innerHTML;
}
