/*-------------------------------------------------------------------------*\
| CORE: 	These are the core functions of the terminal.					|
| 			Functions in core.js are auto-loaded at each terminal start-up	|
\*-------------------------------------------------------------------------*/

/*************************************************************************/
/*** write in further functions alphabetically (this.base.function = ) ***/
/*************************************************************************/

// Note, though, that extra functions that aren't programs (see programs.js)
// can be added in their own files in ./pkg/ This allows them to be
// "installed" with the builtin install command, though they won't
// be available at "startup"

const core = {};

/*---- ARGLIST ----*/
core.arglist = function(args,trmnl){
	var flags;
	[args,flags] = trmnl.parse_flags(args);
	var arglist = "";
	for(var a in args){
		arglist += "["+a+"]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--> "+args[a]+"<br />";
	}
	for(var f in flags){
		arglist += "[flag_"+f+"]&nbsp;--> "+flags[f]+"<br />";
	}
	return [0,arglist];
};
core.arglist.help = '<b>arglist</b> command: prints supplied arguments to screen<br/>Can be useful in piped functions or testing your argument parsing in other functions';
/*---- BG ----*/
core.bg = function(args,trmnl){
	if(args.length > 1) args = args[0];
	if(args == "") return [1, "Need a color to change background to"];
	if(args == "reset"){
		trmnl.cols.bg = '#000';
	}else{
		if(!/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(args[0])){
			return [1, args[0]+" is not a valid hexadecimal color"];
		}
		trmnl.cols.bg = args[0];
	}
	trmnl.update_colors();
	return 0;
};
core.bg.help = '<b>bg</b> command: change the background color to a specified hexadecimal color code<br />Use <i>bg reset</i> to return to default (not the default of current theme)';
/*---- BITCONV ----*/
core.bitconv = function(args,trmnl){
	if(args.length != 2){
		return [1, 'Requires exactly 2 arguments: a value with units, and the units to convert to'];
	}
	console.log('---BITCONV debugging:---');
	var val, amt, conv_amt, units_out, val_in;
	for(var a = 0; a < args.length; a++){
		val = parseFloat(args[a].match( /[+-]?\d+(\.\d+)?/g));
		console.log('val is '+val);
		if(isNaN(val)){
			// units to convert to
			console.log(args[a]+' is the units to convert to');
			units_out = args[a];
			conv_amt = 1;
			if(args[a].toLowerCase().indexOf('t') > -1){ // TODO rejig this, there's a much simpler/cleaner method!
				conv_amt = conv_amt / (1024 * 1024 * 1024 * 1024);
			}else if(args[a].toLowerCase().indexOf('g') > -1){
				conv_amt = conv_amt / (1024 * 1024 * 1024);
			}else if(args[a].toLowerCase().indexOf('m') > -1){
				conv_amt = conv_amt / (1024 * 1024);
			}else if(args[a].toLowerCase().indexOf('k') > -1){
				conv_amt = conv_amt / 1024;
			}
			if(args[a].indexOf('B') > -1) conv_amt /= 8; // bits to bytes if capital B present
			console.log('Interpretted multiplier for conversion is '+conv_amt);
		}else{
			// value
			console.log(args[a]+' is the value to convert');
			val_in = args[a];
			if(args[a].toLowerCase().indexOf('t') > -1){ // TODO as above (in rate section)
				val = val * 1024 * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('g') > -1){
				val = val * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('m') > -1){
				val = val * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('k') > -1){
				val = val * 1024;
			}
			if(args[a].indexOf('B') > -1) val *= 8; // bits to bytes if capital B present
			console.log('Interpretted value is '+val+' bits');
			amt = val;
		}
	}
	var converted = amt * conv_amt;
	return [0, val_in+' is '+converted+' '+units_out];
};
core.bitconv.help = '<b>bitconv</b> command: convert between gigabytes, bits, megabits and kilobytes etc.'
/*---- CLS ----*/
core.cls = function(args,trmnl){
	trmnl.output_div.innerHTML = "";
	return 0;
};
core.cls.help = 'Well, it clears the screen';
/*---- COLCONV ----*/
core.colconv = function(args,trmnl){
	var output = "", r, g, b, boom, hex, rgb, mat, coltype, parsed = false;
	for(var a in args){
		parsed = false;
		switch(args[a].charAt(0)){
			case "[":
				coltype = "mat";
				boom = args[a].split(",");
				if(boom.length != 3){
					output += "Could not parse "+args[a]+" as a [0:1, 0:1, 0:1] type color, skipping.";
					parsed = true;
				}else{
					r = Math.round(parseFloat(boom[0].replace("[","").replace("(","").trim())*255);
					g = Math.round(parseFloat(boom[1].trim())*255);
					b = Math.round(parseFloat(boom[2].replace("]","").replace(")","").trim())*255);
				}
				break;
			case "#":
				coltype = "hex";
				if(args[a].length == 4){
					r = parseInt(args[a].charAt(1).toString()+args[a].charAt(1).toString(),16);
					g = parseInt(args[a].charAt(2).toString()+args[a].charAt(2).toString(),16);
					b = parseInt(args[a].charAt(3).toString()+args[a].charAt(3).toString(),16);
				}else if(args[a].length == 7){
					r = parseInt(args[a].substr(1,2),16);
					g = parseInt(args[a].substr(3,2),16);
					b = parseInt(args[a].substr(5,2),16);
				}else{
					output += "Could not parse "+args[a]+" as a hexadecimal color, skipping.";
					parsed = true;
				}
				break;
			case "r":
				coltype = "rgb";
				boom = args[a].split(",");
				if(boom.length != 3){
					output += "Could not parse "+args[a]+" as an rgb() type color, skipping.";
					parsed = true;
				}else{
					r = parseInt(boom[0].replace("rgb(","").replace("rgba(","").trim());
					g = parseInt(boom[1].trim());
					b = parseInt(boom[2].replace(")","").trim());
				}
				break;
			default:
				output += "Could not parse "+args[a]+" as a color, skipping.";
				parsed = true;
		}
		if(!parsed){
			hex = "#"
				+(("00"+r.toString(16)).slice(-2))
				+(("00"+g.toString(16)).slice(-2))
				+(("00"+b.toString(16)).slice(-2));
			hex = hex.toUpperCase();
			rgb = "rgb("+r+","+g+","+b+")";
			mat = "["+(r/255).toFixed(4)+","+(g/255).toFixed(4)+","+(b/255).toFixed(4)+"]";
			output += "<span style=\"color: "+hex+"\" title=\""+args[a]+"\">"+args[a]+"</span> is:<br />";
			if(coltype != "hex") output += "&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"cmd-feedback\">"+hex+"</span> as a hexadecimal code<br />";
			if(coltype != "rgb") output += "&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"cmd-feedback\">"+rgb+"</span> as an rgb code<br />";
			if(coltype != "mat") output += "&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"cmd-feedback\">"+mat+"</span> as a MATLAB style code<br />";
		}
	}
	return [0, output];
};
core.colconv.help = '<b>colconv</b> command: supply a color code in either rgb(), hex (must include #) or [0:1,0:1,0:1] format<br/>and the same color in the other formats will be printed to screen.<br />Can supply as many colors as separate arguments as desired';
/*---- COLOR ----*/
core.color = function(args,trmnl){
	var which, col;
	if(args.length > 1){
		which = args[0];
		if(!trmnl.cols.hasOwnProperty(which)){
			return [1, which+' is not a valid parameter to change the color of']
		}
		col = args[1];
	}else{
		which = 'output';
		col = args[0];
	}
	if(col == "") return [1, "Need a color to change to"];
	if(args == "reset"){
		trmnl.cols.output = '#FFF';
		trmnl.cols.feedback = '#9CF';
		trmnl.cols.error = '#E85555';
	}else{
		if(!/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(col)){
			return [1, col+" is not a valid hexadecimal color"];
		}
		trmnl.cols[which] = col;
	}
	trmnl.update_colors();
	return 0;
};
core.color.help = '<b>color</b> command: change the font color to a specified hexadecimal color code<br />Use <i>color reset</i> to return to default<br />feedback or error colors can be changed by passing in their name as first argument and the color as second';
/*---- COWSAY ----*/
core.cowsay = function(args,trmnl){
	var minL = 8, moostr = args[0], m = 0;
	if(moostr == undefined || moostr == ""){
		return [1, 'Cows rarely speak unless it is something worth saying.'];
	}
	if(moostr.length < 8){
		var pad = minL-moostr.length;
		if(pad%2 != 0){
			for(m = 0; m < Math.floor(pad/2); m++){
				moostr = ' '+moostr;
			}
			for(m = 0; m < Math.ceil(pad/2); m++){
				moostr += ' ';
			}
		}else{
			for(m = 0; m < pad/2; m++){
				moostr = ' '+moostr+' ';
			}
		}
	}
	var lining = Array(moostr.length+1).join('_');
	moostr = moostr.replace(/ /g, '&nbsp;');
	var mooster_cow = '&nbsp;'+lining+'<br/>/'+moostr+'\\<br/>\\'+lining+'/<br/>';
	mooster_cow += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\&nbsp;&nbsp;&nbsp;^__^<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\&nbsp;&nbsp;(oo)\\_______<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(__)\\&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)\\/\\<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||----w&nbsp;|<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||';
	return [0, mooster_cow];
};
core.cowsay.help = 'Hmmm. Make the cow say whatever you want. (It\'s a bit busted right now.)';
/*---- DB ----*/
core.db = function(args,trmnl){
	trmnl.program = "db";
	trmnl.next_prompt = 'DB>';
	return 0;
};;
core.db.help = '<b>db</b> program';
/*---- EXIT ----*/
core.exit = function(args,trmnl){
	trmnl.exit();
	return 0;
};
core.exit.help = '<b>exit</b> the current terminal window. Useful when using session.<br />Will result in blank screen if you exit the last terminal...';
/*---- HELP ----*/
core.help = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){ // 'help' on its own auto finds all the base commands and lists them
		var avail_commands = 'Available commands:<hr /><span class="cmd-feedback"><table><tr>';
		if(trmnl.base.hasOwnProperty('autocomplete')){ // make use of the autocomplete data if it has been populated
			for(var c = 0; c < trmnl.base.autocomplete.length; c++){
				avail_commands += '<td>'+trmnl.base.autocomplete[c]+'</td>';
				if((c+1)%6 == 0 && c != 1) avail_commands += '</tr><tr>';
			}
		}else{
			var c = 0;
			for(key in trmnl.base){
				if(typeof(trmnl.base[key]) == 'function'){
					avail_commands += '<td>'+key+'</td>';
					c++;
					if(c%6 == 0 && c != 1) avail_commands += '</tr><tr>';
					//avail_commands += '&nbsp;&nbsp;'+key+'<br />';
				}
			}
		}
		avail_commands += '</tr></table>'; // will double up the </tr> if total commands is divisible by 5. Fix.
		avail_commands += '</span>Use help <i>function name</i> for more info';
		avail_commands += '<br /><small>Commands can be piped to one another with | (e.g. randcol | showcol) or run sequentially if the previous command was successful with &&</small>';
		avail_commands += '<br /><small>Commands can be pushed to a different terminal by appending its ID after :: anywhere in the command, which can be repeated multiple times</small>';
		return [0, avail_commands];
	}else{
		if(typeof(trmnl.base[args[0]]) !== 'function'){
			return [1, args[0]+' is not a function'];
		}
		var help_res = trmnl.base[args[0]].help;
		if(typeof(help_res) == "undefined"){
			help_res = "<i>No help for <b>"+args[0]+"</b> function yet</i>";
		}
		return [0, help_res];
	}
	return 0;
};
core.help.help = '<b>help</b> command: help for the help command needs to be written here.';
/*---- HISTSIZE ----*/
core.histsize = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [0, "Command history size: "+trmnl.cmd_hist_size];
	}
	if(args.length > 1) trmnl.output("Only need 1 input, ignoring subsequent parameters...");
	var n = parseInt(args[0]);
	trmnl.cmd_hist_size = n;
	return [0, "Set command history size to "+n];
};
core.histsize.help = '<b>histsize</b>: with no argument, prints current command history size to screen,<br />with exactly 1 argument – sets the number of items to store in the local storage command history';
/*---- INSTALL ----*/
core.install = function(args,trmnl){
	// TODO: parse flags out of args, and set -p/--permanent flag to add the program to the local settings of permanently installed functions/programs, which will be silently auto-installed at start up.
	// beginning of that:
	[args,flags] = trmnl.parse_flags(args);
	if(flags.indexOf('basic') > -1 || flags.indexOf('b') > -1){
		args.push('session','tedit','display');
	}
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need to specify a program to install"];
	}
	// can set flags to say which terminal to install to (or multiple), this parses them out:
	let installTo = []; 
	for(let f in flags){
		if(flags[f] >= 0 && flags[f] < 4){
			if(typeof(terminal[parseInt(flags[f])]) == "object"){
				installTo.push(parseInt(flags[f]));
			}else{
				trmnl.error("Skipping install to terminal "+flags[f]+" because it cannot be found");
			}
		}
	}
	if(installTo.length < 1) installTo = [trmnl.ID];
	
	for(let a in args){
		// test if it's already installed first here!
		let app = args[a];
		// we need to go async now.
		trmnl.input_div.innerHTML = "";
		trmnl.input_div.style.display = "none";
		var d = new Date();

		var xhr = new XMLHttpRequest();
		xhr.open('GET', "pkg/"+app+".js?d="+d.getTime());

		xhr.onload = function(){
			try{ // always check if terminal.piping == true in async callbacks!
				if(trmnl.piping){
					trmnl.output("Cannot pipe installation. Actually you can, but it'll just pass success or error. Yet to code that in though.",0);
				}
				// install here by creating a script element then deleting it.
				var s = document.createElement("script");
				s.type = "text/javascript";
				// wait, do I need to ajax at all here?! I could just s.src = "pkg/"+app+".js" instead...
				s.innerHTML = this.responseText;
				document.body.appendChild(s);
				for(let i in installTo){
					if(terminal[installTo[i]].base.hasOwnProperty(app)){
						// worth rechecking as we might have duplicated within this request of multiple apps...
						terminal[installTo[i]].error(app+" is already installed, skipping");
					}else{
						terminal[installTo[i]].base[app] = pkgs[app];
						terminal[installTo[i]].base.autocomplete.push(app);
						terminal[installTo[i]].base.autocomplete.sort();
						// test to see if the program has a "window" set of functions, and if so, add to terminal:
						if(typeof baseWindow !== 'undefined' && baseWindow.hasOwnProperty(app)){
							terminal[installTo[i]][app] = baseWindow[app];
							terminal[installTo[i]].update_autocomplete(app);// add this program to the autocomplete
						}
						terminal[installTo[i]].output(app+" program installed",0);
					}
				}
				s.innerHTML = ""; // just in case
				document.body.removeChild(s);
				pkgs = {}; // just in case
			}catch(err){
				console.log(err.message);
				trmnl.error("Could not parse received program data");
			}
			trmnl.input_div.style.display = "block";
		};
		xhr.onerror = function(err){
			trmnl.error("Could not find program");
			trmnl.input_div.style.display = "block";
		}
		xhr.send(null);
	}
	var retval = "Attempting install of "+args.length+" program";
	if(args.length != 1) retval += "s";
	for(var a in args){
		retval += "<br />["+a+"] -> "+args[a];
	}
	return [0, retval];
};
core.install.help = "<b>install</b> command: install the specified program<br /><small>(Use <b>pkg</b> command to list available programs)<br />Accepts flags for collections of functions. Currently only --basic/-b for my commonly used ones</small>";
/*---- KILL ----*/
core.kill = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need to specify a terminal ID to terminate"];
	}
	var retval = "";
	for(var a in args){
		var n = parseInt(args[a]);
		if(typeof(terminal[n]) === "object" && typeof(terminal[n].exit) === "function"){
			terminal[n].exit(trmnl.ID);
			retval += "Stopped terminal:"+n+"<br />";
		}else{
			retval += "Failed to find terminal with ID: "+n;
		}
	}
	return [0, retval];
};
core.kill.help = '<b>kill</b> the specified terminal window. Useful when using session.<br />Will result in blank screen if you kill the last terminal...';
/*---- MATH ----*/
core.math = function(args,trmnl){
	trmnl.program = "math";
	trmnl.next_prompt = 'MATH>';
	//trmnl.reset('MATH>');
	return 0;
};
core.math.help = '<b>math</b> program';
/*---- MLB ----*/
core.mlb = function(args,trmnl){
	// TODO: add in extra arguments to allow for querying results from other days
	if(typeof(args[0]) === "undefined" || args[0] == ""){
		return [1, "Need to specify a team to look up (2 or 3 digit code)"];
	}
	let acceptable = ['ARI', 'ATL', 'BAL', 'BOS', 'CHC', 'CWS', 'CIN', 'CLE', 'COL', 'DET', 'FLA', 'HOU', 'KAN', 'LAA', 'LAD', 'MIL', 'MIN', 'NYM', 'NYY', 'OAK', 'PHI', 'PIT', 'SD', 'SF', 'SEA', 'STL', 'TB', 'TEX', 'TOR', 'WAS'];
	let teamCode = args[0].toUpperCase();
	if(acceptable.indexOf(teamCode) < 0){
		return [1, "Cannot find team by code "+teamCode];
	}
	let today = new Date();
	let forceNew = today.getTime();
	if(args.length > 1 && typeof(args[1]) !== "undefined" && args[1] != ""){
		today = new Date(args[1]+" 12:00:00");
		if(today == "Invalid Date"){
			return [1, "Couldn't parse the submitted date"];
		}
		forceNew = "0"; // if it's not a game from today, chances are we don't need to refresh a cached version
	}
	let offset = 0;
	if(today.getHours() < 3){
		offset = -1;
	}
	const day = ("0" + (today.getDate()+offset)).slice(-2);
	const month = ("0" + (today.getMonth() + 1)).slice(-2);
	const year = today.getFullYear();
	let url = "https://gd2.mlb.com/components/game/mlb/year_"+year+"/month_"+month+"/day_"+day+"/master_scoreboard.json?now="+forceNew;

	//TODO: update this to use a promise rather than just returning and leaving it to go async...

	// TODO: maybe move the parsing of the below results into a separate function to avoid bloating of the core object?
	// we need to go async now.
	trmnl.input_div.innerHTML = "";
	trmnl.input_div.style.display = "none";
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		let data = this.response.data.games;
		let retVal = "";

		const awayTeams = data.game.map(a => a.away_name_abbrev);
		const homeTeams = data.game.map(a => a.home_name_abbrev);
		let homeaway = '';
		let n = -1;
		if(awayTeams.indexOf(teamCode) > -1){
			homeaway = 'away';
			n = awayTeams.indexOf(teamCode);
		}
		if(homeTeams.indexOf(teamCode) > -1){
			homeaway = 'home';
			n = homeTeams.indexOf(teamCode);
		}

		if(homeaway == "" || n < 0){
			trmnl.output("No game found for "+teamCode+" today");
			trmnl.input_div.style.display = "block";
			return;
		}

		const game = data.game[n];

		let scoreBoard = "";
		if(game.hasOwnProperty("linescore") && game.linescore.hasOwnProperty("inning")){
			let innings = "<tr><th></th>";
			let homeScore = "<tr><td><i>"+game.home_team_name+"</i></td>";
			let awayScore = "<tr><td><i>"+game.away_team_name+"</i></td>";
			for(let i = 0, thisHome, thisAway; i < Math.max(9,game.linescore.inning.length); i++){
				innings += "<th>"+(i+1)+"</th>";
				if(game.linescore.inning.length <= i){
					homeScore += "<td>-</td>";
					awayScore += "<td>-</td>";
				}else{
					thisHome = game.linescore.inning[i].home;
					thisAway = game.linescore.inning[i].away;
					homeScore += "<td "
					if(thisHome > 0) homeScore += "class='cmd-feedback'";
					thisHome=thisHome==''?'-':thisHome;
					homeScore += ">"+thisHome+"</td>";
					awayScore += "<td ";
					if(thisAway > 0) awayScore += "class='cmd-feedback'";
					thisAway=thisAway==''?'-':thisAway;
					awayScore += ">"+thisAway+"</td>";
				}
			}

			//TODO: the empty <th> & <td> stuff is hacky and temporary. Clean up.
			innings += "<th></th><th>R</th><th>H</th><th>E</th>";
			homeScore += "<td></td><td ";
			awayScore += "<td></td><td ";
			if(parseFloat(game.linescore.r.away) > parseFloat(game.linescore.r.home)){
				awayScore += "class='cmd-feedback'";
			}else if(parseFloat(game.linescore.r.home) > parseFloat(game.linescore.r.away)){
				homeScore += "class='cmd-feedback'";
			}
			homeScore += ">"+game.linescore.r.home+"</td><td ";
			awayScore += ">"+game.linescore.r.away+"</td><td ";
			if(parseFloat(game.linescore.h.away) > parseFloat(game.linescore.h.home)){
				awayScore += "class='cmd-feedback'";
			}else if(parseFloat(game.linescore.h.home) > parseFloat(game.linescore.h.away)){
				homeScore += "class='cmd-feedback'";
			}
			homeScore += ">"+game.linescore.h.home+"</td><td ";
			awayScore += ">"+game.linescore.h.away+"</td><td ";
			if(parseFloat(game.linescore.e.away) > parseFloat(game.linescore.e.home)){
				awayScore += "class='cmd-err no-margin'";
			}else if(parseFloat(game.linescore.e.home) > parseFloat(game.linescore.e.away)){
				homeScore += "class='cmd-err no-margin'";
			}
			homeScore += ">"+game.linescore.e.home+"</td>";
			awayScore += ">"+game.linescore.e.away+"</td>";

			innings += "</tr>";
			homeScore += "</tr>";
			awayScore += "</tr>";

			scoreBoard = "<table>"+innings+awayScore+homeScore+"</table>";
		}

		if(game.status.status == "In Progress"){
			let state = game.status.inning_state;
			let battingTeam = false;
			switch(state){
				case "Top":
					state = "&#x2191;"
					battingTeam = game.away_team_name+ " batting";
					break;
				case "Bottom":
					state = "&#x2193;"
					battingTeam = game.home_team_name+ " batting";
					break;
				case "Middle":
					state = "&#x21C6;";
					break;
					// no need for default, it just sticks to what it already is
			}
			retVal = "<font class='cmd-feedback'><b>LIVE</b></font>: "+state+" of the "+game.status.inning+"<sup>";
			switch(parseFloat(game.status.inning)){
				case 1:
					retVal += "st";
					break;
				case 2:
					retVal += "nd";
					break;
				case 3:
					retVal += "rd";
					break;
				default:
					retVal += "th";
			}
			retVal += "</sup>";
			if(battingTeam) retVal += " (<i>"+battingTeam+"</i>)";
			retVal += "<br /><small>(<i>"+game.away_win+"-"+game.away_loss+"</i>)</small> <b>"+game.away_team_name+"</b> <font class='cmd-feedback'>"+game.linescore.r.away+"</font> - ";
			retVal += "<font class='cmd-feedback'>"+game.linescore.r.home+"</font> <b>"+game.home_team_name+"</b> <small>(<i>"+game.home_win+"-"+game.home_loss+"</i>)</small>";
			// is anyone on base?
			let bases = ["<sub>&#x25C7;</sub>","<sup>&#x25C7;</sup>","<sub>&#x25C7;</sub>"]
			if(game.runners_on_base.hasOwnProperty("runner_on_1b")){
				bases[2] = "<sub class='cmd-feedback' title='"+game.runners_on_base.runner_on_1b.last+" on 1st'>&#x25c6;</sub>";
			}
			if(game.runners_on_base.hasOwnProperty("runner_on_2b")){
				bases[1] = "<sup class='cmd-feedback' title='"+game.runners_on_base.runner_on_2b.last+" on 2nd'>&#x25c6;</sup>";
			}
			if(game.runners_on_base.hasOwnProperty("runner_on_3b")){
				bases[0] = "<sub class='cmd-feedback' title='"+game.runners_on_base.runner_on_3b.last+" on 3rd'>&#x25c6;</sub>";
			}
			retVal += "<br />"+bases.join("");
			retVal += " B: "+game.status.b+" | S: "+game.status.s+" | "+game.status.o+" out";
			retVal += "<hr />"+scoreBoard;
			retVal += "<hr />";
			retVal += "Pitching: <i>"+game.pitcher.last+"</i> <small>(ERA: "+game.pitcher.era+")</small>";
			retVal += "<br />Batting: <i>"+game.batter.last+"</i> <small>(AVG: "+game.batter.avg+")</small>";
			retVal += "<br />Play-by-play: <i>"+game.pbp.last+"</i>";
			retVal += "<br /><small>TV: "+game.broadcast[homeaway].tv+", Radio: "+game.broadcast[homeaway].radio+"</small>";
		}else if(game.status.status == "Preview" || game.status.status == "Pre-Game"){
			retVal = game.away_name_abbrev+" @ "+game.home_name_abbrev+" at "+game[homeaway+'_time']+" "+game[homeaway+'_ampm']+" ("+game.venue+")";
			retVal += "<br />"+game.home_team_name+": "+game.home_win+"-"+game.home_loss;
			retVal += "<br />"+game.away_team_name+": "+game.away_win+"-"+game.away_loss;
			retVal += "<br />TV: "+game.broadcast[homeaway].tv+", Radio: "+game.broadcast[homeaway].radio;
		}else if(game.status.status == "Warmup"){
			retVal += "Game status: warmup. Gettin' ready...";
		}else if(game.status.status == "Final" || game.status.status == "Game Over"){
			retVal = "<b>FINAL</b>:<br />";
			retVal += "<small>(<i>"+game.away_win+"-"+game.away_loss+"</i>)</small> "+game.away_team_name+" <font class='cmd-feedback'>"+game.linescore.r.away+"</font> - <font class='cmd-feedback'>"+game.linescore.r.home+"</font> "+game.home_team_name+"<small> (<i>"+game.home_win+"-"+game.home_loss+"</i>)</small>";
			retVal += "<br />"+scoreBoard;					
		}else{
			retVal = "Unknown game state: "+game.status.status;
			retVal += "<br />"+scoreBoard; // just in case
		}
		trmnl.output(retVal);
		trmnl.input_div.style.display = "block";
	};
	xhr.onerror = function(err){
		console.log(err);
		trmnl.error("Couldn't retrieve master game list from MLB");
		trmnl.input_div.style.display = "block";
	};
	xhr.send(null);

	return [0, "<i>Querying MLB gamelist...</i>"];
};
core.mlb.help = '<b>mlb</b> command: pass in the 2 or 3 digit code for a MLB team to see live info about any game being played today<br />Pass in a date to check games from a different day, e.g. 4/12/19';
/*---- NOTE ----*/
core.note = function(args,trmnl){
	// use localStorage for notes. Need to getItem first to append note to the array of notes.
	//TODO: (MAJOR) MAKE SURE TO SANITIZE THE NOTE FIRST
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need to write a note to save"];
	}
	var notes = JSON.parse(localStorage.getItem("notes"))
	if(notes === null){
		notes = [];
	}
	if(typeof(notes) !== "object"){ // if there's only one note it's a string, not an array/object
		notes = notes.split(); // this shouldn't be the case anymore, now that it includes dates
	}
	var newnote = {};
	newnote.note = args.join(" ");
	newnote.c = Date();
	newnote.m = 0; // never modified, yet.
	notes.push(newnote); //update to have creation and modification times, i.e. notes[n].text, notes[n].c and notes[n].m
	var tot_notes = notes.length;
	notes = JSON.stringify(notes);
	localStorage.setItem("notes",notes);
	return [0, "New note created. You now have "+tot_notes+" notes stored"];
};
core.note.help = '<b>note</b> command: make a new note. Use <b>notes</b> command to read notes<br /><b>notebook</b> program allows for more advanced navigation of notes.<br />N.B. that notes are local to the machine, not across multiple terminal sessions on different devices.<br />Cloud notes will be added soon.';
/*---- NOTES ----*/
core.notes = function(args,trmnl){
	// need to update the below to work with notes[n].text, notes[n].c and notes[n].m instead
	var getSnippet = function(text, length) {
		if(text.length > length){
			var rx = new RegExp("^.{" + length + "}[^ ]*");
			return rx.exec(text)[0];
		}
		return text;
	}
	var notes = JSON.parse(localStorage.getItem("notes"))
	if(notes === null){
		return [0, "<i>You currently have no notes stored</i>"];
	}
	if(args[0] == undefined || args[0] == ""){
		if(typeof(notes) !== "object"){ // if there's only one note it's a string, not an array/object
			return [0, "[0] -> "+notes];
		}
		var output = "You have "+notes.length+" notes:<br /><table>";
		var d, c_format, n_format;
		for(var n = 0; n < notes.length; n++){
			//d = new Date(notes[n].c);
			c_format = notes[n].c;
			m_format = notes[n].m;
			//c_format = (d.getMonth()+1)+"/"+d.getDate()+" ";
			//c_format += ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);
			n_format = getSnippet(notes[n].note,35);
			if(n_format.length != notes[n].note.length) n_format += "...";
			output += "<tr><td>[<span class=\"cmd-feedback\">"+n+"</span>] -> </td><td>"+n_format+"</td><td><i>"+c_format+"</i></td><td><i>"+m_format+"</i></td></tr>";
		}
		output += "</table>";
		return [0, output];
	}else{
		var n = parseInt(args[0]);
		// check it's an integer, then load up notes as above, check that note number exists, then print the whole thing to screen as output.
		if(typeof(notes[n]) !== "object"){
			return [1, "Cannot find note ["+n+"]"];
		}
		var output = "Note "+n+":<br />";
		output += "<div class='cmd-feedback'>"+notes[n].note+"</div>"; // maybe do an automate linebreak every last space before n chars?
		output += "<i>Created: "+notes[n].c+"; <i>modified: "+notes[n].m+"</i>";
		return [0, output];
	}
	return [1, "Notes had an issue"]; // shouldn't ever reach this, but just in case
};
core.notes.help = '<b>notes</b> command: called with no arguments will list a snippet of all notes plus their IDs. Call <b>notes</b> with an ID to show that note in full.<br /><b>notebook</b> program allows for more advanced navigation of notes.';
/*---- NSXLOAD ----*/
core.nsxload = function(args,trmnl){
	if(args.length < 2 || args[0] == undefined || args[0] == "" || args[1] == undefined || args[1] == ""){
		return [1, "Need 2 arguments, number of channels and sampling frequency, in either order (# channels denoted by ch)"];
	}else{
		var chans, Fs, val;
		console.log('---nsxload debugging:---');
		for(var a = 0; a < args.length; a++){
			val = parseFloat(args[a].match( /[+-]?\d+(\.\d+)?/g));
			console.log('Value is '+val);
			if(args[a].toLowerCase().indexOf('ch') > -1){
				// channel
				console.log('It is number of channels');
				chans = val;
			}else{
				// Fs
				console.log('It is Fs');
				if(args[a].indexOf('k') > -1) val *= 1000;
				console.log('Interpretted value is '+val+' Hz');
				Fs = val;
			}
		}
		var load = Math.ceil(100*((((chans * Fs * 16) / 8) / 1024 / 1024 / 1024) * 60 * 60))/100;
		return [0, "Recording will require "+load+" GB  per hour ("+Math.ceil(load*24)+" GB per day)"];
	}
};
core.nsxload.help = '<b>nsxload</b> command: calculates how many gigabytes will be created per hour/day for specified<br />number of electrodes and sampling rate with BlackRock nsx files<br />Specify number of electrodes by pre- or post-fixing with "ch"<br />e.g. nsxload 16ch 30k <i>or</i> nsxload 2000 ch64 (i.e. any order for arguments or "ch")';
/*---- PKG ----*/
core.pkg = function(args,trmnl){
	/* this is the static version of the site. No xhr to local php files :(
	trmnl.input_div.innerHTML = "";
	trmnl.input_div.style.display = "none";
	// Previously called pkg/available.php here to auto-build available pkgs
	return [0, "Retrieving available packages..."];
	*/
	// static version of the website, so need to hard-code available packages:
	const res = ['display','localstore','nano','notebook','session','tedit'];
	let avail_pkg = 'Available programs to install:<hr /><span class="cmd-feedback"><table><tr>';
	for(let c = 0; c < res.length; c++){
		avail_pkg += '<td><span ';
		if(trmnl.base.hasOwnProperty(res[c])){
			avail_pkg += "style='opacity: 0.5; font-style: oblique;' title='"+res[c]+" is already installed'";
		}
		avail_pkg += '>'+res[c]+'</span></td>';
		if((c+1)%6 == 0 && c != 1) avail_pkg += '</tr><tr>';
	}
	avail_pkg += "</tr></table>"; // will double up the </tr> if total commands is divisible by 5. Fix.
	return [0, avail_pkg];
};
core.pkg.help = '<b>pkg</b> command: list available programs for install (cannot work in local mode)';
/*---- RANDCOL ----*/
core.randcol = function(args,trmnl){
	return [0, '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6)];
};
core.randcol.help = '<b>randcol</b> command: return a random hexadecimal color code';
/*---- SCIENCE ----*/
core.science = function(args,trmnl){
	var info = "",
		quick_release = false;
	if(args.length > 0){
		if(args[0] == "info"){
			quick_release = true;
		}
	}
	trmnl.linesep();
	trmnl.output("Ed is currently a Post-Doctoral Research Scientist at <a target='_blank' href='https://www.cuimc.columbia.edu'>Columbia University Medical Center</a> in the <a target='_blank' href='http://www.columbianeurology.org'>Dept. of Neurology</a>");
	trmnl.output("His research focuses on the activity of populations of single neurons in epilepsy patients during seizures,<br />especially the activity of individual inhibitory cells at seizure onset, and alterations to firing patterns<br />in what's known as the '<i>post-ictal</i>' period.");
	trmnl.linesep();
	trmnl.output("Click to go to his <a target='_blank' href='https://scholar.google.com/citations?user=PnKpxtIAAAAJ&hl=en&oi=ao'>Google Scholar page</a>, <a target='_blank' href='https://www.ncbi.nlm.nih.gov/pubmed/?term=(merricks+em%5Bauthor%5D)'>publications</a>, <a target='_blank' href='https://github.com/edmerix/'>GitHub</a>, or <a target='_blank' href='https://www.researchgate.net/profile/Edward_Merricks'>ResearchGate</a>");
	trmnl.output("He has code to open <a target='_blank' href='https://github.com/edmerix/openNSx-swift'>NSx neural data files in Swift</a>, do the <a target='_blank' href='https://github.com/edmerix/SplitMerge'>manual stage of spike sorting</a>, or<br /><a target='_blank' href='https://github.com/edmerix/NeuroClass'>analyze populations of single unit data</a>, among others (ask for more).");
	trmnl.output("There have been a lot of questions about spike sorting through time recently...");
	trmnl.output("Click <a href='SpikeSorting' target='_blank'>here</a> for a (very) quick overview of spike sorting through time");

	if(!quick_release){
		trmnl.program = "science";
		trmnl.next_prompt = 'SCIENCE>';
		info = "<hr />Entering SCIENCE info program... Type help for more info, and exit to return home.";
	}
	return [0,info];
}
core.science.help = '<b>science</b> command: use to find some info about my scientific work.<br />science with no arguments will start the SCIENCE "program"<br />Using the argument "info" will just print the basic details to screen then return home.';
/*---- SHOWCOL ----*/
core.showcol = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [1, 'Need a hexadecimal color code to print'];
	}
	if(!/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(args[0])){
		return [1, args[0]+" is not a valid hexadecimal color code"];
	}
	return [0, '<font style="color: '+args[0]+'">'+args[0]+'<font>'];
};
core.showcol.help = '<b>showcol</b> command: print the given hexadecimal color code in its color';
/*---- SUBWAY ----*/
core.subway = function(args,trmnl){
	if(stations == -1 || (Object.keys(stations).length === 0 && sellers.constructor === Object)){
		return [1, 'Subway station data failed to load correctly'];
	}

	if(args[0] == undefined || args[0] == ""){
		return [1, 'Need a station name to search for (e.g. 103_st)'];
	}

	var s_id;

	var stationName = args[0].toLowerCase().trim();
	stationName = stationName.split("-")[0].trim();
	stationName = stationName.split("/")[0].trim();
	stationName = stationName.split(" ").join("_");

	if(!(stationName in stations)){
		return [1, "Couldn't find "+args[0]+" in station data. Note we use the official MTA naming, but replace spaces with underscores."]
	}

	if(args.length > 1 && typeof(args[1]) !== 'undefined'){
		lineCode = args[1].toUpperCase();
	}else{
		lineCode = -1;
	}

	if(lineCode == -1){
		if(stations[stationName]._unique.length > 1 && lineCode == -1){
			return [1, stations[stationName]._unique.length+" different stations matched "+stationName+": please add a line number/letter to the query"]
		}
		s_id = stations[stationName]._unique[0];
	}else{
		if(!(lineCode in stations[stationName])){
			return [1, lineCode+" doesn't appear to run through "+stationName];
		}
		s_id = stations[stationName][lineCode];
	}
	if(typeof(s_id) === 'undefined'){
		return [1, "Couldn't get a station code for "+stationName+" with line "+lineCode];
	}

	// we need to go async now.
	trmnl.input_div.innerHTML = "";
	trmnl.input_div.style.display = "none";
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "https://api.wheresthefuckingtrain.com/by-id/"+s_id, true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		try{ // always check if terminal.piping == true in async callbacks!
			if(trmnl.piping){
				trmnl.output("Yet to set up piping for the subway function",0);
				//trmnl.parse_command(trmnl.pipe_function+"("+res.value.joke+")",0);
			}else{
				let res = xhr.response;
				if(res.updated == null){
					trmnl.output("Currently no information for "+res.data[0].name+" subway station",0);
				}else{
					var output = "<span class='cmd-feedback'>"+res.data[0].name+" subway station:</span><br />";
					output += "<table><tr><th>Uptown &#9650;</th><th>Downtown &#9660;</th></tr>";
					var upt = [],
						downt = [],
						upl = [],
						downl = [],
						now = new Date(),
						trainT,
						tdiff,
						min_wait,
						sec_wait;
					for(var n = 0; n < res.data[0].N.length; n++){
						trainT = new Date(res.data[0].N[n].time);
						tdiff = Math.floor((trainT.getTime() - now.getTime())/1000);
						if(tdiff > 0){
							min_wait = Math.floor(tdiff/60);
							sec_wait = tdiff-(60*min_wait);
							upt.push(min_wait+" min "+sec_wait+" sec");
							upl.push(res.data[0].N[n].route);
						}
					}
					for(var s = 0; s < res.data[0].S.length; s++){
						trainT = new Date(res.data[0].S[s].time);
						tdiff = Math.floor((trainT.getTime() - now.getTime())/1000);
						if(tdiff > 0){
							min_wait = Math.floor(tdiff/60);
							sec_wait = tdiff-(60*min_wait);
							downt.push(min_wait+" min "+sec_wait+" sec");
							downl.push(res.data[0].S[s].route);
						}
					}
					max_dir = upt.length > downt.length ? upt.length : downt.length;
					for(var m = 0; m < max_dir; m++){
						output += "<tr><td>";
						output += m >= upl.length ? "-" : "<span class='mta mta_"+upl[m]+"'>"+upl[m]+"</span> train in "+upt[m];
						output += "</td><td>";
						output += m >= downl.length ? "-" : "<span class='mta mta_"+downl[m]+"'>"+downl[m]+"</span> train in "+downt[m];
						output += "</td></tr>";
					}
					output += "</table>";
					trmnl.output(output,0);
				}
			}
		}catch(err){
			console.log(err.message);
			trmnl.error("Could not parse received subway data");
		}
		trmnl.input_div.style.display = "block";
	};
	xhr.onerror = function(err){
		trmnl.error("Could not load subway data");
		trmnl.input_div.style.display = "block";
	};
	xhr.send(null);
	
	return [0, "Fetching MTA subway data..."];
};
core.subway.help = 'Subway status. Needs a station name as argument, and if there are multiple stations with that name,';
core.subway.help += '<br />a subway line should be the second argument to differentiate.';
core.subway.help += '<br />All stations now work, but the naming can be quirky...';
core.subway.help += '<br />The station name should correspond to the official MTA name for that station, and replace spaces with underscores.';
core.subway.help += '<br />Note that station names are auto-abbreviated at the first hyphen or slash, which simplifies, but also causes odd ones';
core.subway.help += '<br />e.g. 47-50 Sts - Rockefeller Ctr becomes just "47"';
/*---- THEME ----*/
core.theme = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [1, "need a theme name to change to"];
	}
	if(trmnl.themes.hasOwnProperty(args[0])){
		//trmnl.cols = trmnl.themes[args[0]]; // actually, this passes by reference(-ish), allowing it to update the theme upon using bg or color commands, until refresh.
		trmnl.cols.bg = trmnl.themes[args[0]].bg;
		trmnl.cols.error = trmnl.themes[args[0]].error;
		trmnl.cols.output = trmnl.themes[args[0]].output;
		trmnl.cols.feedback = trmnl.themes[args[0]].feedback;
	}else{
		return [1, 'unknown theme name: '+args];
	}
	trmnl.update_colors();
	return 0;
};
core.theme.help = '<b>theme</b> command: change terminal to a different theme. Available themes will be populated once specified theme file has been loaded.';
/*---- TRANSWAIT ----*/
core.transwait = function(args,trmnl){
	if(args.length != 2){
		return [1, 'Requires exactly 2 arguments: a rate, and an amount'];
	}
	var rate, amt, val;
	console.log('---TRANSWAIT debugging:---');
	for(var a = 0; a < args.length; a++){
		val = parseFloat(args[a].match( /[+-]?\d+(\.\d+)?/g));
		console.log('Value is '+val);
		if(args[a].toLowerCase().indexOf('ps') > -1){
			// rate
			console.log('It is a rate');
			if(args[a].toLowerCase().indexOf('t') > -1){ // TODO rejig this, there's a much simpler/cleaner method!
				val = val * 1024 * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('g') > -1){
				val = val * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('m') > -1){
				val = val * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('k') > -1){
				val = val * 1024;
			}
			if(args[a].indexOf('B') > -1) val *= 8; // bits to bytes if capital B present
			console.log('Interpretted value is '+val+ ' bits per second');
			rate = val;
		}else{
			// amt
			console.log('It is an amount');
			if(args[a].toLowerCase().indexOf('t') > -1){ // TODO as above (in rate section)
				val = val * 1024 * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('g') > -1){
				val = val * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('m') > -1){
				val = val * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('k') > -1){
				val = val * 1024;
			}
			if(args[a].indexOf('B') > -1) val *= 8; // bits to bytes if capital B present
			console.log('Interpretted value is '+val+' bits');
			amt = val;
		}
	}
	// we now have rate in bits per second and amt in bits
	var delay = amt/rate;
	var remainder = 0;
	// convert into mins or hours here if large enough
	if(delay > 60*60){ // again. Cleaner method. TODO make this shiny.
		delay = delay/60/60;
		remainder = delay - Math.floor(delay);
		remainder = remainder*60; // convert into time (multiples of 60 mins)
		delay = Math.floor(delay)+' hours and '+Math.round(remainder)+' minutes';
	}else if(delay > 60){
		delay = delay/60;
		remainder = delay - Math.floor(delay);
		remainder = remainder*60; // convert into time (multiples of 60 secs)
		delay = Math.floor(delay)+' minutes and '+Math.round(remainder)+' seconds';
	}else{
		delay = Math.round(delay)+ ' seconds';
	}
	return [0, delay+' left'];
};
core.transwait.help = '<b>transwait</b> command: calculate how long a transfer will take<br />Requires 2 input arguments, the rate and the amount to transfer. Note that calculation is bit/byte specific using b/B notation!<br />e.g. <i>transwait 12.34GB 123Mbps</i><br />(Arguments can come in either order. Only <u>B</u>yte vs <u>b</u>it is case sensitive.)';
/*---- VERSION ----*/
core.version = function(args,trmnl){
	return [0, "<span class=\"cmd-feedback\">emerix terminal v"+trmnl.version+"<br /><i>Release date: "+trmnl.releaseDate+"</i></span>"]
};
core.version.help = "<b>version</b> command shows details about the current version of the emerix terminal";
/*---- WEATHER ----*/
core.weather = function(args,trmnl){
	var flags = [],
		longprint = false;
	[args,flags] = trmnl.parse_flags(args);
	if(args[0] == undefined || isNaN(parseFloat(args[0]))){
		return [1, args[0]+" is not a valid ZIP code"];
	}
	for(var f = 0; f < flags.length; f++){
		switch(flags[f]){
			case 'f':
			case 'full':
				longprint = true;
				break;
			default:
				trmnl.output("Unknown flag: "+flags[f]+", ignoring");
		}
	}
	// we need to go async now.
	trmnl.input_div.innerHTML = "";
	trmnl.input_div.style.display = "none";
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "https://api.openweathermap.org/data/2.5/forecast?zip="+args[0]+"&units=metric&appid=2075d49b34d2618a3b73f7eaa58d97d8", true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		try{ // normally we should check if piping is true, but the weather table is just gonna async print.
			let res = this.response;
			let weather = "<span class=\"cmd-feedback\">Weather data for "+res.city.name+", "+res.city.country+":</span><br /><table>";
			weather += "<tr><th>Date</th><th>Hour</th><th>Condition</th><th>Temp</th><th>Cloudiness</th><th>Humidity</th></tr>";
			let count_to = 5;
			if(longprint){
				count_to = res.cnt;
			}
			for(let r = 0, dt, hr; r < count_to; r++){
				dt = new Date(res.list[r].dt*1000);
				hr = "0"+dt.getHours();
				weather += "<tr><td>"+(dt.getMonth()+1)+"/"+dt.getDate()+"</td>";
				weather += "<td>"+hr.substr(-2)+":00</td>";
				weather += "<td>"+res.list[r].weather[0].description+"</td>";
				weather += "<td>"+Math.round(res.list[r].main.temp)+"&deg;C</td>";
				weather += "<td>"+res.list[r].clouds.all+"%</td>";
				weather += "<td>"+res.list[r].main.humidity+"%</td></tr>";
			}
			weather += "</table>";
			trmnl.output(weather,0);
		}catch(err){
			console.log(err.message);
			trmnl.error("Could not parse received weather data");
		}
		trmnl.input_div.style.display = "block";
	};
	xhr.onerror = function(err){
		trmnl.error("Could not load data");
		trmnl.input_div.style.display = "block";	
	};
	xhr.send(null);
	
	return [0, "loading weather data..."]
};
core.weather.help = '<b>weather</b> command: get forecast for a given ZIP code<br />e.g. "weather 10025"<br />Defaults to displaying results for next 5 hours, use -f or --full flag to display all results"';
/*---- WHOAMI ----*/
core.whoami = function(args,trmnl){
	/* this is the static version of the site. No ajax to php files.
	// we need to go async now.
	trmnl.input_div.innerHTML = "";
	trmnl.input_div.style.display = "none";
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		try{ // always check if terminal.piping == true in async callbacks!
			let res = this.response;
			if(trmnl.piping){
				res.user = res.user.replace(/,/g,'&comma;'); // there shouldn't ever be a comma in user...
				trmnl.parse_command(trmnl.pipe_function+"("+res.user+")",0);
			}else{
				if(res.id >= 0){
					trmnl.output("Logged in as "+res.user,0);
				}else{
					trmnl.output("Browsing as guest",0);
				}
			}
		}catch(err){
			console.log(err.message);
			trmnl.error("Could not parse received data");
		}
		trmnl.input_div.style.display = "block";
	};
	xhr.onerror = function(err){
		trmnl.error("Could not load user data");
		trmnl.input_div.style.display = "block";
	};
	xhr.send(null);
	
	return 0;
	*/
	return [0, "Browsing as guest"]; // always, since this is the static version. Bit rubbish.
};
core.whoami.help = '<b>whoami</b> command: tells you who you are logged in as, if any';