window.jQuery || document.write('<script src="jquery.min.js"><\/script>');

var terminal = [],
	instances;
var table_border = false; // move this into a settings object later, to be loaded externally.

$(document).ready(function(){

	$(".termbox").click(function(ev){
		var wh = $(this).attr("id").replace("term_","");
		if(!ev.target.classList.contains('noprop')){ // add class 'noprop' to items that we don't want to trigger this
			$("#main-input_"+wh).focus();
		}
	});
	instances = terminal.length;
	terminal[instances] = new Terminal(instances,"$>","#main-input_"+instances,"#cmd-history_"+instances,"#cmd-prompt_"+instances,"#term_"+instances,"themes.json");
	
	update_positions();
	
	//WELCOME message immediate output: 
	terminal[instances].output('&nbsp;_____&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;__&nbsp;&nbsp;__&nbsp;__&nbsp;&nbsp;__&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____&nbsp;&nbsp;&nbsp;');
	terminal[instances].output('|&nbsp;____|__|&nbsp;|_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____&nbsp;_&nbsp;_&nbsp;__&nbsp;__|&nbsp;|&nbsp;&nbsp;\\/&nbsp;&nbsp;|&nbsp;&nbsp;\\/&nbsp;&nbsp;|&nbsp;___&nbsp;_&nbsp;__&nbsp;_&nbsp;__(_)&nbsp;___|&nbsp;|&nbsp;_____&nbsp;&nbsp;|&nbsp;&nbsp;_&nbsp;\\|&nbsp;|__&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;_&nbsp;\\&nbsp;&nbsp;');
	terminal[instances].output('|&nbsp;&nbsp;_|&nbsp;/&nbsp;_`&nbsp;\\&nbsp;\\&nbsp;/\\&nbsp;/&nbsp;/&nbsp;_`&nbsp;|&nbsp;\'__/&nbsp;_`&nbsp;|&nbsp;|\\/|&nbsp;|&nbsp;|\\/|&nbsp;|/&nbsp;_&nbsp;\\&nbsp;\'__|&nbsp;\'__|&nbsp;|/&nbsp;__|&nbsp;|/&nbsp;/&nbsp;__|&nbsp;|&nbsp;|_)&nbsp;|&nbsp;\'_&nbsp;\\&nbsp;&nbsp;|&nbsp;|&nbsp;|&nbsp;|&nbsp;');
	terminal[instances].output('|&nbsp;|__|&nbsp;(_|&nbsp;|\\&nbsp;V&nbsp;&nbsp;V&nbsp;/&nbsp;(_|&nbsp;|&nbsp;|&nbsp;|&nbsp;(_|&nbsp;|&nbsp;|&nbsp;&nbsp;|&nbsp;|&nbsp;|&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;__/&nbsp;|&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;|&nbsp;|&nbsp;(__|&nbsp;&nbsp;&nbsp;<\\__&nbsp;\\_|&nbsp;&nbsp;__/|&nbsp;|&nbsp;|&nbsp;|_|&nbsp;|_|&nbsp;|&nbsp;');
	terminal[instances].output('|_____\\__,_|&nbsp;\\_/\\_/&nbsp;\\__,_|_|&nbsp;&nbsp;\\__,_|_|&nbsp;&nbsp;|_|_|&nbsp;&nbsp;|_|\\___|_|&nbsp;&nbsp;|_|&nbsp;&nbsp;|_|\\___|_|\\_\\___(&nbsp;)_|&nbsp;&nbsp;&nbsp;|_|&nbsp;|_(_)____(_)');
	terminal[instances].output('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|/');
	
	terminal[instances].output('Welcome to the geeky version of the website');
	terminal[instances].output('To go to the version designed for people who aren\'t massive dweebs use the "<span class="cmd-feedback">GUI</span>" command, or <a href="gui">click here</a>');
	terminal[instances].output('Ed is a scientist. He also sometimes does art, and plays a bit of music');
	terminal[instances].output('To find out more about each topic, try their commands below ("<span class="cmd-feedback">science</span>", "<span class="cmd-feedback">art</span>", "<span class="cmd-feedback">music</span>")');
	terminal[instances].output('To get more help, type "<span class="cmd-feedback">help</span>" and hit enter')
	
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
});

function Terminal(cmdID,prmpt,input_div,output_div,prompt_div,container,theme_file){
	this.ID = cmdID;
	this.title = "emerix";
	this.version = 0.1;
	this.releaseDate = "2018-06-25";
	
	this.prompt = prmpt;
	this.base_prompt = prmpt;
	this.next_prompt = prmpt;
	this.cmd_hist = []; // TODO: maybe use localStorage (limit it to last 50 commands)
    this.cmd_hist_pos = 0;
	this.input_div = $(input_div);
	this.output_div = $(output_div);
	this.prompt_div = $(prompt_div);
	this.body = container;
	this.active = true;
	this.program = "base";		// what program we're currently in (base is normal commands)
	this.piping = false; 		// used to "pipe" command outputs to another command ("|" symbol)
	this.pipe_function = null;	// what command to pass the output to if "piping" (assigned automatically with whatever is after the | symbol)
	
	this.cols = {};
	this.cols.output = '#FFF';
	this.cols.feedback = '#9CF';
	this.cols.error = '#E85555';
	this.cols.bg = '#000';
	
	this.theme_file = theme_file;
	this.themes = {};
	(function(trmnl){$.ajax({
		url: trmnl.theme_file,
		dataType: 'json',
		returnType: 'json',
		success: function(res){
			trmnl.themes = res;
			// update the theme help to list all items:
			var theme_help = "<b>THEME</b> command: change terminal to a different theme. Available themes are: <br />";
			for(var t in trmnl.themes){
				theme_help += "<font class='cmd-feedback'>"+t+"</font> | "; // tabulate this nicely later. (TODO)
			}
			theme_help = theme_help.slice(0, -3);
			trmnl.base.theme.help = theme_help;
			trmnl.parse_command('theme dracula',0); // put this in temporarily as my current favorite theme
		},
		error: function(err){
			trmnl.output("<span class='cmd-feedback'>Couldn't load the themes file, only default theme available.</span>"); // why didn't I make terminal.feedback a method?!
			console.log(err);
		}
	});})(this);
	
	var trmnl = this;
	
	this.output_div.html("");
    if(this.title != undefined && this.title != null){
        this.output_div.append("<div class='cmd-feedback output-line'>"+this.title+" v"+this.version+" || terminal:"+this.ID+"<br /><i>[release: "+this.releaseDate+"]</i></div>");
    }
    this.prompt_div.html(this.prompt.replace("[d]","").replace("[t]",""));
	
	this.input_div.keydown(function(e){
		if(trmnl.active){
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 9){ //tab autocomplete or next screen if option held and multiple terminals open
				if(e.altKey){
					e.preventDefault();
					var curID = trmnl.ID;
					newID = curID + 1;
					while(typeof(terminal[newID]) !== "object" && newID != curID){
						newID++;
						newID = newID > 3 ? 0 : newID;
					}
					if(newID != curID)
						terminal[newID].input_div.focus();
				}else{
					e.preventDefault();
					var thusfar = $(this).val();
					if(thusfar != ""){
						var results = [];
						for (var i = 0; i < trmnl[trmnl.program].autocomplete.length; i++) {
							if (trmnl[trmnl.program].autocomplete[i].indexOf(thusfar) == 0) { //starts with correct
								if(trmnl[trmnl.program].autocomplete[i] != thusfar){ // no need to add if identical
									results.push(thusfar+trmnl[trmnl.program].autocomplete[i].slice(thusfar.length, trmnl[trmnl.program].autocomplete[i].length));
								}
							}
						}
						if(results.length == 1){
							trmnl.input_div.val(results[0]); // update the input if one match been found
						}else if(results.length > 1 && results.length <= 20){ // list all options below, if fewer than 20
							var tbl_out = "<hr /><table><tr>";
							for(var r = 0; r < results.length; r++){
								tbl_out += "<td>"+results[r]+"</td>";
								if(r % 5 == 0 && r != 0 && r != results.length-1) tbl_out += "</tr>"; // never add this to last item, as it will be added below.
							}
							tbl_out += "</tr></table>";
							trmnl.output(tbl_out,0);
						}else if(results.length > 20){
							trmnl.output(results.length+" options found: will list up to "+trmnl.max_tab_list+" items",0);
						}
					}
				}
				return false;
			}else if(code == 13){
				e.preventDefault();
				var cmd = $(this).val();
				trmnl.parse_command(cmd,1);
			}else if(code == 27){
				//trmnl.reset();
				trmnl.input_div.val("");
			}else if(code == 38){ //up arrow
				trmnl.cmd_hist_pos++;
				if(trmnl.cmd_hist_pos > trmnl.cmd_hist.length)
					trmnl.cmd_hist_pos = trmnl.cmd_hist.length;
				var new_cmd = '<div>'+trmnl.cmd_hist[trmnl.cmd_hist.length-trmnl.cmd_hist_pos]+'</div>';
				new_cmd = $(new_cmd).text();
				if(new_cmd != "undefined") // allowing && command chaining has broken this a little
					$(this).val(new_cmd);
				e.preventDefault();
			}else if(code == 40){ //down arrow
				trmnl.cmd_hist_pos--;
				if(trmnl.cmd_hist_pos<0)
					trmnl.cmd_hist_pos = 0;
				var new_cmd = '<div>'+trmnl.cmd_hist[trmnl.cmd_hist.length-trmnl.cmd_hist_pos]+'</div>';
				new_cmd = $(new_cmd).text();
				if(new_cmd != "undefined")
					$(this).val(new_cmd);
				e.preventDefault();
			}
		}
	});
	
	this.base = {};
	this.base.protected = {}; // used to write the fallback function, without adding it to the user accessible commands
	this.base.protected.fallback = function(cmd,fn,args,trmnl){
		// any attempts at parsing unknown commands can be placed here.
		return [1, "Unknown command "+fn];
		// TODO: update this so that it checks available installation packages and prompts to install if it exists?
	}
	/** BASE FUNCTIONS START: **/
	/* 	
	*	Normal functions are in alphabetical order below,
	*	but these first ones are the webiste ones (science,
	*	art, music, any others I think of)
	*/
	// SCIENCE:
	this.base.science = function(args,trmnl){
		var info = "",
			quick_release = false;
		if(args.length > 0){
			if(args[0] == "info"){
				quick_release = true;
			}
		}
		trmnl.output("Ed is currently a Post-Doctoral Research Scientist at Columbia University Medical Center");
		trmnl.output("His research focuses on the activity of populations of single neurons in epilepsy patients during seizures.");
		trmnl.output("I will write this section properly in a bit, with links &amp; feedback colors &amp; stuff...");
		if(!quick_release){
			trmnl.program = "science";
			trmnl.next_prompt = 'SCIENCE>';
			info = "Entering SCIENCE info program... Type help for more info, and exit to return home.";
		}
		return [0,info];
	}
	this.base.science.help = '<b>SCIENCE</b> command: use to find some info about my scientific work.<br />science with no arguments will start the SCIENCE "program"<br />Using the argument "info" will just print the basic details to screen then return home.';
	// ART:
	this.base.art = function(args,trmnl){
		return [0, "I am yet to code this bit in."]
	}
	this.base.art.help = '<b>ART</b> command: gives some details about my hobby painting/drawing';
	// MUSIC:
	this.base.music = function(args,trmnl){
		return [0, "I am yet to code this bit in."]
	}
	this.base.music.help = '<b>MUSIC</b> command: gives some details about my hobby making/producing music';
	// ARGLIST: (list arguments, can be useful to determine piped function stuff or test argument parsing)
	this.base.arglist = function(args,trmnl){
		var arglist = "";
		for(var a in args){
			arglist += "["+a+"] --> "+args[a]+"<br />";
		}
		return [0,arglist];
	}
	this.base.arglist.help = '<b>ARGLIST</b> command: prints supplied arguments to screen<br/>Can be useful in piped functions or testing your argument parsing in other functions';
    // BG: (background color)
    this.base.bg = function(args,trmnl){
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
    }
    this.base.bg.help = '<b>BG</b> command: change the background color to a specified hexadecimal color code<br />Use <i>bg reset</i> to return to default (not the default of current theme)';
	// BITCONV:
	this.base.bitconv = function(args,trmnl){
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
	}
	this.base.bitconv.help = '<b>BITCONV</b> command: convert between gigabytes, bits, megabits and kilobytes etc.';
	// CLS:
    this.base.cls = function(args,trmnl){
        trmnl.output_div.html("");
        return 0;
    }
	this.base.cls.help = 'Well, it clears the screen.';
	// COLCONV:
	this.base.colconv = function(args,trmnl){
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
	}
	this.base.colconv.help = '<b>COLCONV</b> command: supply a color code in either rgb(), hex (must include #) or [0:1,0:1,0:1] format<br/>and the same color in the other formats will be printed to screen.<br />Can supply as many colors as separate arguments as desired';
	// COLOR:
    this.base.color = function(args,trmnl){
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
    }
    this.base.color.help = '<b>COLOR</b> command: change the font color to a specified hexadecimal color code<br />Use <i>color reset</i> to return to default<br />feedback or error colors can be changed by passing in their name as first argument and the color as second';
	// COWSAY:
	this.base.cowsay = function(args,trmnl){
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
	}
	// DANCE:
	/*
	this.base.dance = {};
	this.base.dance.active = 0;
	this.base.dance = function(args,trmnl){
		var dance_res;
		if(trmnl.base.dance.active){
			trmnl.base.dance.active = 0;
			dance_res = "Somebody turned the music off...";
			$(".shake-slow").removeClass('shake-slow');
			$(".shake-constant").removeClass('shake-constant');
		}else{
			trmnl.base.dance.active = 1;
			$(trmnl.body).addClass('shake-slow shake-constant');
			dance_res = "DANCE PARTY!";
		}
		return [0, dance_res];
	};
	this.base.dance.help = '<b>DANCE</b> command: Just type it and find out.<br />(But be warned - it\'s quite motion sickness inducing... Type it again to turn off.)';
	*/
	// DB:
	this.base.db = function(args,trmnl){
		trmnl.program = "db";
		trmnl.next_prompt = 'DB>';
		return 0;
	};
	this.base.db.help = '<b>DB</b> program';
	// EXIT:
	this.base.exit = function(args,trmnl){
		trmnl.exit();
		return 0;
	}
	this.base.exit.help = '<b>EXIT</b> the current terminal window. Useful when using session.<br />Will result in blank screen if you exit the last terminal...';
	// GOOGLE:
	this.base.google = function(args,trmnl){
		if(args[0] == undefined || args[0] == ""){
			return [1, 'Need something to search for...'];
		}
		var key = "AIzaSyB0mTa4dryH9zAlqkjsBxS9ObiLkBo97zE"; // TODO: erm, hide these. Or just remove google cmd
		var cx = "015250765681830679718:3izhuvu28ng";
		//parse the args first to test for parameters, which start with a colon and must have an equals sign
		var g_cmd = {}, g_pop, not_srch = [];
		for(var a = 0; a < args.length; a++){ // can test for - as first char here too, and assign excludeTerms
			if(args[a].charAt(0) == ":"){
				not_srch.push(a);
				g_pop = args[a].split("=");
				// this only sets the g_cmd[name] if there's a value to set it to:
				g_pop[1] && (g_cmd[g_pop[0]] = g_pop[1]); 
			}
		}
		// remove the google command arguments from the search term
		not_srch.sort(function(a,b){return b - a;}).forEach(function(index){
			args.splice(index, 1);
		});
		var srchObj = {};
		srchObj.q = args.join(" ");
		srchObj.cx = cx;
		srchObj.key = key;
		// work out the commands given, and assign them if appropriate:
		// could do as a test for if it's a field of srchObj instead, but don't want to allow cx or key access
		var allowable = [':num',':start',':searchType',':siteSearch',':fileType',':imgDominantColor'];
		for(var g in g_cmd){
			if(allowable.indexOf(g) > -1){
				srchObj[g.substring(1)] = g_cmd[g];
			}
		}
		$.ajax({
			url: "https://www.googleapis.com/customsearch/v1",
			data: srchObj,
			success: function(res){
				try{ // always check if terminal.piping == true in async callbacks!
					if(trmnl.piping){
						trmnl.output("Yet to set up piping of google results. Returning for now.", 0);
					}else{
						var output = "Search for <span class='cmd-feedback'>"+res.queries.request[0].searchTerms+"</span><br />-- took "+res.searchInformation.searchTime+" seconds, found "+res.searchInformation.formattedTotalResults+" results:<br />";
						output += "<div class='indented'>";
						for(var i = 0; i < res.items.length; i++){
							output += "["+(i-1+res.queries.request[0].startIndex)+"] -> <a href=\""+res.items[i].link+"\" title=\""+res.items[i].snippet+"\" target=\"_blank\">"+res.items[i].htmlTitle+" - <i>"+res.items[i].htmlFormattedUrl+"</i></a><br />"
						}
						output += "</div>";
					}
					trmnl.output(output,0);
				}catch(err){
					console.log(err.message);
					trmnl.error("Could not parse received google data");
				}
				trmnl.input_div.show();
			},
			error: function(err){
				console.log(err);
				trmnl.error("Could not load google data:<br />"+err.responseJSON.error.message);
				trmnl.input_div.show();
			}
		});
		return [0, "Fetching google results..."];
	};
	this.base.google.help = '<b>GOOGLE</b> search. All arguments are treated as the search term, unless started with a colon,<br/>in which case arguments are written as name=value.<br />Allowable arguments are num (1 to 10), start, siteSearch, searchType, fileType and imgDominantColor<br />e.g. <span class="cmd-feedback">google testing the search :num=5 :start=30</span><br />Note that arguments can appear anywhere in the search, and the search terms will be collapsed around them.';
	// HELP:
	this.base.help = function(args,trmnl){
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
	this.base.help.help = '<b>HELP</b> command: help for the help command needs to be written here.';
	// INSTALL:
	this.base.install = function(args,trmnl){
		if(args[0] == undefined || args[0] == ""){
			return [1, "Need to specify a program to install"];
		}
		if(args.length > 1) trmnl.output("Cannot install multiple programs in one swoop at present due to async calls.<br />This will end up installing the last program each time, most likely.<br />Proceeding regardless...");
		for(var a in args){
			// test if it's already installed first here!
			if(trmnl.base.hasOwnProperty(args[a])){
				return [1, args[a]+" is already installed"];
			}
			// we need to go async now.
			trmnl.input_div.html("").hide();
			var d = new Date();
			$.ajax({
				url: "pkg/"+args[a]+".js?d="+d.getTime(),
				success: function(res){
					try{ // always check if terminal.piping == true in async callbacks!
						if(trmnl.piping){
							trmnl.output("Cannot pipe installation. Actually you can, but it'll just pass success or error. Yet to code that in though.",0);
						}
						// install here by creating a script element then deleting it.
						var s = document.createElement("script");
						s.type = "text/javascript";
						s.setAttribute("ID","pkg_install");
						// wait, do I need to ajax at all here?! I could just s.src = "pkg/"+args[0]+".js" instead...
						s.innerHTML = res;
						document.body.appendChild(s);
						//console.log(pkgs);
						trmnl.base[args[a]] = pkgs[args[a]];
						trmnl.base.autocomplete.push(args[a]);
						trmnl.base.autocomplete.sort();
						// test to see if the program has a "window" set of functions, and if so, add to terminal:
						if(typeof window !== 'undefined' && window.hasOwnProperty(args[a])){
							trmnl[args[a]] = window[args[a]];
							trmnl.update_autocomplete(args[a]);// add this program to the autocomplete
						}
						s.innerHTML = ""; // just in case
						$("#pkg_install").remove(); // clean up
						trmnl.output(args[a]+" program installed",0);
					}catch(err){
						console.log(err.message);
						trmnl.error("Could not parse received program data");
					}
					trmnl.input_div.show();
				},
				error: function(err){
					trmnl.error("Could not find program");
					trmnl.input_div.show();
				}
			});
		}
		var retval = "Attempting install of "+args.length+" program";
		if(args.length != 1) retval += "s";
		for(var a in args){
			retval += "<br />["+a+"] -> "+args[a];
		}
		return [0, retval];
	};
	this.base.install.help = "<b>INSTALL</b> command: install the specified program<br />(Use <b>pkg</b> command to list available programs)";
	// KILL:
	this.base.kill = function(args,trmnl){
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
	}
	this.base.kill.help = '<b>KILL</b> the specified terminal window. Useful when using session.<br />Will result in blank screen if you kill the last terminal...';
	// MATH:
	this.base.math = function(args,trmnl){
		trmnl.program = "math";
		trmnl.next_prompt = 'MATH>';
		//trmnl.reset('MATH>');
		return 0;
	};
	this.base.math.help = '<b>MATH</b> program';
	// NOTE
	this.base.note = function(args,trmnl){
		// use localStorage for notes. Need to getItem first to append note to the array of notes.
		// MAKE SURE TO SANITIZE THE NOTE FIRST
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
	}
	this.base.note.help = '<b>NOTE</b> command: make a new note. Use <b>NOTES</b> command to read notes<br /><b>NOTEBOOK</b> program allows for more advanced navigation of notes.<br />N.B. that notes are local to the machine, not across multiple terminal sessions on different devices.<br />Cloud notes will be added soon.';
	// NOTES:
	this.base.notes = function(args,trmnl){
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
	}
	this.base.notes.help = '<b>NOTES</b> command: called with no arguments will list a snippet of all notes plus their IDs. Call NOTES with an ID to show that note in full.<br /><b>NOTEBOOK</b> program allows for more advanced navigation of notes.';
	// PKG: (list available programs for install)
	this.base.pkg = function(args,trmnl){
		/* this is the static version of the site. No ajax to php files :(
		trmnl.input_div.html("").hide();
		$.ajax({
			url: "pkg/available.php",
			dataType: "json",
			success: function(res){
				// TODO: check if res is an array of pkgs first
				console.log(res);
				// TODO: remove already installed programs from this list
				var avail_pkg = 'Available programs to install:<hr /><span class="cmd-feedback"><table><tr>';
				for(var c = 0; c < res.length; c++){
					avail_pkg += '<td>'+res[c]+'</td>';
					if((c+1)%6 == 0 && c != 1) avail_pkg += '</tr><tr>';
				}
				avail_pkg += "</tr></table>"; // will double up the </tr> if total commands is divisible by 5. Fix.
				trmnl.output(avail_pkg);
				trmnl.input_div.show(); // this appears to happen even if I don't call it here. Look into why!
			},
			error: function(err){
				console.log(err);
				trmnl.error("Could not load available packages");
				trmnl.input_div.show();
			}
		});
		return [0, "Retrieving available packages..."];
		*/
		// static version of the website, so need to hard-code available packages:
		var res = ['chuck','display','localstore','nano','notebook','session','tedit'];
		var avail_pkg = 'Available programs to install:<hr /><span class="cmd-feedback"><table><tr>';
		for(var c = 0; c < res.length; c++){
			avail_pkg += '<td>'+res[c]+'</td>';
			if((c+1)%6 == 0 && c != 1) avail_pkg += '</tr><tr>';
		}
		avail_pkg += "</tr></table>"; // will double up the </tr> if total commands is divisible by 5. Fix.
		return [0, avail_pkg];
	}
	this.base.pkg.help = '<b>PKG</b> command: list available programs for install (cannot work in local mode)';
	// RANDCOL: (random color, using to test piping output to other command functionality (e.g. randcol | color))
	this.base.randcol = function(args,trmnl){
		return [0, '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6)];
	}
	this.base.randcol.help = '<b>RANDCOL</b> command: return a random hexadecimal color code';
	// SHOWCOL: (show text in the requested hex color code)
	this.base.showcol = function(args,trmnl){
		if(args[0] == undefined || args[0] == ""){
			return [1, 'Need a hexadecimal color code to print'];
		}
		if(!/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(args[0])){
			return [1, args[0]+" is not a valid hexadecimal color code"];
		}
		return [0, '<font style="color: '+args[0]+'">'+args[0]+'<font>'];
	}
	this.base.showcol.help = '<b>SHOWCOL</b> command: print the given hexadecimal color code in its color';
	
	// SUBWAY:
	this.base.subway = function(args,trmnl){
		// see https://github.com/aamaliaa/mta-gtfs/blob/master/lib/mta.js for an idea.
		// note that that depends on all sorts of extra modules, not ideal.
		// 4ebd894681d162d15b63069278daec43
		// also http://web.mta.info/status/serviceStatus.txt but that doesn't like file:// origin.
		// http://wheresthefuckingtrain.com is awesome.
		// also http://wheresthetrain.nyc/#1/119/false
		// and official:  http://tripplanner.mta.info/mobileApps/serviceStatus/serviceStatusPage.aspx?mode=subway
		
		// http://wheresthetrain.nyc/svc/subway-api/v1/next-trains/1/119
		// https://api.wheresthefuckingtrain.com/by-route/1
		if(args[0] == undefined || args[0] == ""){
			return [1, 'Need a station name to search for (e.g. 103)'];
		}
		var s_id;
		// let's move this into a JSON file, this is gonna be silly.
		// the info is coming from https://github.com/jonthornton/MTAPI/blob/master/data/stations.json
		switch(args[0].toLowerCase()){
			case "96th":
			case "96":
				s_id = "da4f";
				break;
			case "116th":
			case "116":
			case "columbia":
				s_id = "0d51";
				break;
			case "103rd":
			case "103":
				s_id = "07e1";
				break;
			case "168th":
			case "168":
				s_id = "e467";
				break;
			case "42nd":
			case "42":
			case "timessq":
			case "timessquare":
				s_id = "84ac";
				break;
			case "59":
			case "59th":
			case "columbuscircle":
				s_id = "7a18";
				break;
			case "grandcentral": // note how the user could have put 42nd meaning here. Need to work a better system.
				s_id = "87d2";
				break;
			default:
				return [1, args[0]+" station hasn't been added yet."];
		}
		// we need to go async now.
		trmnl.input_div.html("").hide();
		$.ajax({
			url: "https://api.wheresthefuckingtrain.com/by-id/"+s_id,
			dataType: "json",
			success: function(res){
				try{ // always check if terminal.piping == true in async callbacks!
					if(trmnl.piping){
						trmnl.output("Yet to set up piping for the subway function",0);
						//trmnl.parse_command(trmnl.pipe_function+"("+res.value.joke+")",0);
					}else{
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
				trmnl.input_div.show();
			},
			error: function(err){
				trmnl.error("Could not load subway data");
				trmnl.input_div.show();
			}
		});
		return [0, "Fetching MTA subway data..."];
	}
	this.base.subway.help = 'Subway status. Needs a station name as argument.<br />Currently accepts an odd subset of stations, mostly based on where we live and work.<br />Need to write this properly.';
	
	// THEME:
	this.base.theme = function(args,trmnl){
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
	}
	this.base.theme.help = '<b>THEME</b> command: change terminal to a different theme. Available themes will be populated once specified theme file has been loaded.'; 
	// TRANSWAIT: 
	this.base.transwait = function(args,trmnl){
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
	}
	this.base.transwait.help = '<b>TRANSWAIT</b> command: calculate how long a transfer will take<br />Requires 2 input arguments, the rate and the amount to transfer. Note that calculation is bit/byte specific using b/B notation!<br />e.g. <i>transwait 12.34GB 123Mbps</i><br />(Arguments can come in either order. Only <u>B</u>yte vs <u>b</u>it is case sensitive.)';
	this.base.version = function(args,trmnl){
		return [0, "<span class=\"cmd-feedback\">emerix terminal v"+trmnl.version+"<br /><i>Release date: "+trmnl.releaseDate+"</i></span>"]
	}
	this.base.version.help = "<b>VERSION</b> command shows details about the current version of the emerix terminal";
	// WEATHER:
	this.base.weather = function(args,trmnl){
		if(args[0] == undefined || isNaN(parseFloat(args[0]))){
			return [1, args[0]+" is not a valid ZIP code"];
		}
		// we need to go async now.
		trmnl.input_div.html("").hide();
		$.ajax({
			url: "http://api.openweathermap.org/data/2.5/forecast?zip="+args[0]+"&units=metric&appid=2075d49b34d2618a3b73f7eaa58d97d8",
			dataType: "json",
			success: function(res){
				try{ // normally we should check if piping is true, but the weather table is just gonna async print.
					var weather = "<span class=\"cmd-feedback\">Weather data for "+res.city.name+", "+res.city.country+":</span><br /><table>";
					weather += "<tr><th>Date</th><th>Hour</th><th>Condition</th><th>Temp</th><th>Cloudiness</th></tr>";
					for(var r = 0, dt, hr; r < res.cnt; r++){
						dt = new Date(res.list[r].dt*1000);
						hr = "0"+dt.getHours();
						weather += "<tr><td>"+(dt.getMonth()+1)+"/"+dt.getDate()+"</td>";
						weather += "<td>"+hr.substr(-2)+":00</td>";
						weather += "<td>"+res.list[r].weather[0].description+"</td>";
						weather += "<td>"+Math.round(res.list[r].main.temp)+"&deg;C</td>";
						weather += "<td>"+res.list[r].clouds.all+"%</td></tr>";
					}
					weather += "</table>";
					trmnl.output(weather,0);
				}catch(err){
					console.log(err.message);
					trmnl.error("Could not parse received weather data");
				}
				trmnl.input_div.show();
			},
			error: function(err){
				trmnl.error("Could not load data");
				trmnl.input_div.show();
			}
		});
		return [0, "loading weather data..."]
	};
	this.base.weather.help = '<b>WEATHER</b> command: get forecast for a given ZIP code<br />e.g. "weather 10025"';
	// WHOAMI:
	this.base.whoami = function(args,trmnl){
		/* this is the static version of the site. No ajax to php files.
		// we need to go async now.
		trmnl.input_div.html("").hide();
		$.ajax({
			url: "user.php",
			dataType: "json",
			success: function(res){
				try{ // always check if terminal.piping == true in async callbacks!
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
				trmnl.input_div.show();
			},
			error: function(err){
				trmnl.error("Could not load user data");
				trmnl.input_div.show();
			}
		});
		return 0;
		*/
		return [0, "Browsing as guest"]; // always, since this is the static version. Bit rubbish.
	};
	this.base.whoami.help = '<b>WHOAMI</b> command: tells you who you are logged in as, if any';
	/****************************************************************/
	/*** write in further functions here: (this.base.function = ) ***/
	/****************************************************************/
	
	// Note, though, that extra functions that aren't programs (see below)
	// can be added in their own files in ./pkg/ This allows them to be 
	// "installed" with the builtin install command, though they won't 
	// be available at "startup"
	
	/****************************************************************/
	/***       programs go here (i.e. non "base" commands):       ***/
	/****************************************************************/
	
	/* DB */ // haven't actually done anything with this one yet.
	this.db = {};
	this.db.protected = {};
	this.db.protected.fallback = function(cmd,fn,args,trmnl){
		return [1, "Unknown DB command: "+fn];
	}
	this.db.exit = function(args,trmnl){
		trmnl.program = "base";
		trmnl.next_prompt = trmnl.base_prompt;
		return 0;
	}
	this.db.help = function(args,trmnl){
        var avail_commands = 'Available db commands:<hr /><span class="cmd-feedback"><table><tr>';
		if(trmnl.db.hasOwnProperty('autocomplete')){ // make use of the autocomplete data if it has been populated
			for(var c = 0; c < trmnl.db.autocomplete.length; c++){
				avail_commands += '<td>'+trmnl.db.autocomplete[c]+'</td>';
				if((c+1)%6 == 0 && c != 1) avail_commands += '</tr><tr>';
			}
		}else{
			var c = 0;
			for(key in trmnl.db){
				if(typeof(trmnl.db[key]) == 'function'){
					avail_commands += '<td>'+key+'</td>';
					c++;
					if(c%6 == 0 && c != 1) avail_commands += '</tr><tr>';
					//avail_commands += '&nbsp;&nbsp;'+key+'<br />';
				}
			}
		}
		avail_commands += '</tr></table>'; // will double up the </tr> if total commands is divisible by 5. Fix.
        return [0, avail_commands];
	}
	
	/* MATH */
	this.math = {};
	this.math.protected = {}; // used to write the fallback function, without adding it to the user accessible commands
	this.math.protected.fallback = function(cmd,fn,args,trmnl){
		// any attempts at parsing unknown commands can be placed here.
		// e.g. this is the math program, and so this is where we attempt to evaluate input. If we fail, we fallback to the normal error.
		var output;
		try {
			return [0, math.eval(cmd)];
		}catch(err){
			return [1, "Could not evaluate \""+cmd+"\" mathematically:<br /><i>"+err.message+"</i>"];
		}
		return [1, "Unknown MATH command: "+fn]; // won't ever reach here, but leaving it in just in case...
	}
	this.math.exit = function(args,trmnl){
		trmnl.program = "base";
		trmnl.next_prompt = trmnl.base_prompt;
		return 0;
	}
	this.math.help = function(args,trmnl){
        var avail_commands = 'Available math commands:<hr /><span class="cmd-feedback"><table><tr>';
		if(trmnl.math.hasOwnProperty('autocomplete')){ // make use of the autocomplete data if it has been populated
			for(var c = 0; c < trmnl.math.autocomplete.length; c++){
				avail_commands += '<td>'+trmnl.math.autocomplete[c]+'</td>';
				if((c+1)%6 == 0 && c != 1) avail_commands += '</tr><tr>';
			}
		}else{
			var c = 0;
			for(key in trmnl.math){
				if(typeof(trmnl.math[key]) == 'function'){
					avail_commands += '<td>'+key+'</td>';
					c++;
					if(c%6 == 0 && c != 1) avail_commands += '</tr><tr>';
					//avail_commands += '&nbsp;&nbsp;'+key+'<br />';
				}
			}
		}
		avail_commands += '</tr></table>'; // will double up the </tr> if total commands is divisible by 5. Fix.
        return [0, avail_commands];
	}
	/* SCIENCE */
	this.science = {};
	this.science.protected = {};
	this.science.protected.fallback = function(cmd,fn,args,trmnl){
		return [1, "Unknown command for the SCIENCE section: "+fn];
	}
	this.science.exit = function(args,trmnl){
		trmnl.program = "base";
		trmnl.next_prompt = trmnl.base_prompt;
		return 0;
	}
	this.science.help = function(args,trmnl){
        var avail_commands = 'Commands in the SCIENCE section:<hr /><span class="cmd-feedback"><table><tr>';
		if(trmnl.science.hasOwnProperty('autocomplete')){
			// make use of the autocomplete data if it has been populated
			for(var c = 0; c < trmnl.science.autocomplete.length; c++){
				avail_commands += '<td>'+trmnl.science.autocomplete[c]+'</td>';
				if((c+1)%6 == 0 && c != 1) avail_commands += '</tr><tr>';
			}
		}else{
			var c = 0;
			for(key in trmnl.science){
				if(typeof(trmnl.science[key]) == 'function'){
					avail_commands += '<td>'+key+'</td>';
					c++;
					if(c%6 == 0 && c != 1) avail_commands += '</tr><tr>';
					//avail_commands += '&nbsp;&nbsp;'+key+'<br />';
				}
			}
		}
		avail_commands += '</tr></table>'; // will double up the </tr> if total commands is divisible by 5. Fix.
        return [0, avail_commands];
	}
	
	/***** AUTOCOMPLETES: *****/
    var auto_progs = ['base','math','db','science'];
	for(var a = 0; a < auto_progs.length; a++){
		this.update_autocomplete(auto_progs[a]);
	}
}
/* PROTOTYPES */
Terminal.prototype.update_autocomplete = function(prog){
	// AUTOCOMPLETE FOR REQUESTED PROGRAM:
	this[prog].autocomplete = [];
	for(key in this[prog]){
		if(typeof(this[prog][key]) == 'function'){
			this[prog].autocomplete.push(key);
		}
	}
	this[prog].autocomplete = this[prog].autocomplete.sort();
}
Terminal.prototype.parse_command = function(cmd,printing){
	// should do the actual parsing with regex. Check out http://regexlib.com/Search.aspx?k=command+line&c=-1&m=-1&ps=20&AspxAutoDetectCookieSupport=1 for ideas.
    if(cmd.replace(/ /g,'') != ""){
        this.cmd_counter++;
        var cmdOut = escapeHTML(cmd);
        if(this.piping) cmdOut += "|"+this.pipe_function;
        if(printing){
            this.cmd_hist.push(cmdOut);
            this.output(cmdOut,1); 
        }
    }
    var separate_cmds = cmd.split('&&'); // logical command sequence, i.e. only keep performing while response less than 1
    var resCode = 0;
    for(var s = 0; s < separate_cmds.length; s++){
        if(resCode < 1){
            cmd = separate_cmds[s];
            if(cmd.replace(/ /g,'') != ""){
                this.input_div.hide();
                this.prompt_div.hide();
                cmd = cmd.trim();
                if(cmd.indexOf('|') > -1){
                    this.piping = true;
                    var pipe_split = cmd.split("|");
                    cmd = pipe_split[0];
                    this.pipe_function = pipe_split[1];
                }else{
                    this.piping = false;
                    this.pipe_function = null;
                }
                if(cmd.indexOf('(') > -1 && (cmd.indexOf(' ') < 0 || cmd.indexOf(' ') > cmd.indexOf('('))){ // commands can be passed as either "command(arguments)" or "command arguments". Note that if a space came first, then it's not command(args)
                    var args = cmd.split("(");
                    var fn = args[0].trim();

                    if(args.length > 1){
                        args.splice(0,1);
                        args = args[0].slice(0,args[0].length-1).split(",");
                        for(var a = 0; a < args.length; a++) args[a] = args[a].trim();
                    }else{
                        args = '';
                    }
                }else{
                    var args = cmd.split(" ");
                    var fn = args[0].trim();
                    if(args.length > 1){
                        args.splice(0,1);
                        //args = args.join(' ').split(";");
                        for(var a = 0; a < args.length; a++) args[a] = args[a].trim();
                    }else{
                        args = '';
                    }
                }
                /* // moved to the complete command rather than post && split commands
                this.cmd_counter++;
                var cmdOut = escapeHTML(cmd);
                if(this.piping) cmdOut += "|"+this.pipe_function;
                if(printing){
                    this.cmd_hist.push(cmdOut);
                    this.output(cmdOut,1); 
                }
                */
                var response;
                if(typeof(this[this.program][fn]) == 'function'){
                    response = this[this.program][fn](args,this);
                }else{
                    // attempt via the protected.fallback function if exists, else throw error:
                    if(typeof(this[this.program].protected.fallback) == 'function'){
                        response = this[this.program].protected.fallback(cmd,fn,args,this); // NOTE that we pass the original command here, as well as fn and args after!
                    }else{
                        response = [1, "Unknown command "+fn];
                    }
                }
                if(response[0]){
                    if(response[0] > -1){
                        if(response[1] == undefined || response[1] == "" || response[1] == null){
                            this.error("unknown command",cmd);
                        }else{
                            this.error(response[1]);
                        }
                    }
                }else{
                    if(response[1] != undefined && response[1] != "" && response[1] != null){
                        if(this.piping){ // passing response onto another function rather than immediate output
                            response[1] = response[1].replace(/,/g,'&comma;');
                            this.parse_command(this.pipe_function+"("+response[1]+")",0);
                            // use bracket notation to avoid spaces in output breaking the arguments. But this means we need to sanitize commas out of the output (done above hastily, but need to debug.)
                        }else{
                            this.output(response[1],0);
                        }
                    }
                    // success.
                }
                if(this.next_prompt != this.prompt){
                    this.set_prompt(this.next_prompt);
                }
                //this.input_div.val(""); // moved to outside the post && split loop
                //this.cmd_hist_pos = 0; // moved to outside the post && split loop
                if(typeof(response) !== "object"){
                    resCode = response;
                }else{
                    resCode = response[0];
                }
            }
        }else{
            this.output("Previous command ("+separate_cmds[s-1].trim()+") did not complete: not continuing command sequence",0);
            break;
        }
        this.input_div.val("");
        this.cmd_hist_pos = 0;
		if(this.active){
			this.input_div.show();
        	this.prompt_div.show();
		}
    }
}
Terminal.prototype.output = function(output,prompted){
    if(prompted){
        var now = new Date(),
            prmpt = this.prompt,
            prmpt_title = "";
        if(prmpt.indexOf('$') > -1){
            prmpt_title = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
            var tm = ("0"+now.getHours()).slice(-2)+":";
            tm += ("0"+now.getMinutes()).slice(-2)+":";
            tm += ("0"+now.getSeconds()).slice(-2);
            prmpt = prmpt.replace('$',tm);
            prmpt_title += " @ "+tm;
        }
        this.output_div.append("<div class=\"output-line\"><div class=\"cmd-prompt\" title=\""+prmpt_title+"\">"+prmpt+"</div>"+output+"</div>");
    }else{
        this.output_div.append("<div class=\"output-line\"><div class=\"cmd-prompt\">"+output+"</div></div>");
    }
	//this.update_colors(); // I don't like calling this after every output/error.
    var d = $(this.body);
	d.scrollTop(d.prop("scrollHeight"));
}
Terminal.prototype.error = function(precursor,val){
    var out = precursor;
    if(val != undefined && val != "" && val != null){
        out += ", '"+val+"'";
    }
    this.output_div.append("<div class=\"cmd-err\">ERROR: "+out+"</div>");
    var d = $(this.body);
	d.scrollTop(d.prop("scrollHeight"));
}
Terminal.prototype.reset = function(new_prompt){
	if(typeof(new_prompt) != 'undefined' || new_prompt != null || new_prompt != ""){
		this.set_prompt(new_prompt);
	}
    this.input_div.val("");
}
Terminal.prototype.set_prompt = function(new_prompt){
    if(typeof(new_prompt) == 'undefined' || new_prompt == null || new_prompt == ""){
        this.prompt = "$>";
    }else{
        this.prompt = new_prompt;
    }
    this.prompt_div.html(this.prompt);
    document.title = this.prompt;
}
Terminal.prototype.update_colors = function(){
	$(this.body).css('background',this.cols.bg);
    this.input_div.css('color',this.cols.output);
    this.output_div.css('color',this.cols.output);
    this.prompt_div.css('color',this.cols.output);
	/*
	var col_setup = '#term_'+this.ID+' .cmd-err {color:'+this.cols.error+';}\n';
	col_setup += '#term_'+this.ID+' .cmd-feedback {color:'+this.cols.feedback+';}\n';
	col_setup += '#term_'+this.ID+' a {color:'+this.cols.feedback+';}\n';
	col_setup += '#term_'+this.ID+' table {border-collapse: collapse;}\n';
	if(table_border == true)
		col_setup += '#term_'+this.ID+' td {border: 1px dashed '+this.cols.output+';}\n';
	$('#dynamic-cols').append(col_setup);
	*/
	var col_setup = "";
	for(var t in terminal){
		col_setup += '#term_'+terminal[t].ID+' .cmd-prompt {color:'+terminal[t].cols.output+';}\n';
		col_setup += '#term_'+terminal[t].ID+' .cmd-err {color:'+terminal[t].cols.error+';}\n';
		col_setup += '#term_'+terminal[t].ID+' .cmd-feedback {color:'+terminal[t].cols.feedback+';}\n';
		col_setup += '#term_'+terminal[t].ID+' a {color:'+terminal[t].cols.feedback+';}\n';
	}
	$('#dynamic-cols').html(col_setup);
	// I do not like the feel of the method above (with the inline style in the head), but it allows for future elements to have their css altered also.
}
Terminal.prototype.exit = function(callingID){
	var w = this.ID;
	// work out which are open based on which terminal[n] is an object, e.g. 0,1,3
	// then bitshift for a switch on how the layout should look. So [0,1,3] becomes 1011 in binary becomes 11 in decimal.
	// maybe not. that's a lot of overlapping layout scenarios for individual screens. hmm. Done below anyway.
	delete terminal[w];
	$("#term_"+w).html("<div id=\"cmd-history_"+w+"\" class=\"cmd-history\"></div>\n\t\t<div id=\"input-line_"+w+"\" class=\"input-line\">\n\t\t\t<div class=\"cmd-prompt\" id=\"cmd-prompt_"+w+"\">$></div>\n\t\t\t<div id=\"cmd-input_"+w+"\" class=\"cmd-input\"><input id=\"main-input_"+w+"\" class=\"main-input\" type=\"text\" spellcheck=\"false\"/></div>"); // reset the terminal container
	instances--;
	
	// attempt to change focus to the screen closest to the closed one.
	// N.B. that this shouldn't be done if this was called as a kill command
	// from another terminal, in which case we don't want to change focus.
	if(callingID == w){
		var chg_to = w - 1;
		while(typeof(terminal[chg_to]) != "object" && chg_to != w){
			chg_to--;
			chg_to = chg_to < 0 ? 3 : chg_to;
		}
	}else{
		chg_to = callingID;
	}
	if(typeof(terminal[chg_to]) == "object")
		terminal[chg_to].input_div.focus();
	update_positions();
}

function update_positions(){
	// this feels clunky. It works well, but was coded in a rush; could probably be done more elegantly
	var open = "";
	for(var i = 3; i >= 0; i--){
		if(typeof(terminal[i]) == "object"){
			open += "1";
		}else{
			open += "0";
		}
	}
	var b = parseInt(open,2); // parse as base 2.
	console.log(b);
	switch(b){
		case 0: // binary: 0000
			$("#term_0").addClass("term_hidden");
			$("#term_1").addClass("term_hidden");
			$("#term_2").addClass("term_hidden");
			$("#term_3").addClass("term_hidden");
			break;
		case 1: // binary: 0001
			$("#term_0").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_narrow").addClass("term_wide");
			$("#term_1").addClass("term_hidden");
			$("#term_2").addClass("term_hidden");
			$("#term_3").addClass("term_hidden");
			break;
		case 2: // binary: 0010
			$("#term_0").addClass("term_hidden");
			$("#term_1").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_narrow").addClass("term_wide");
			$("#term_2").addClass("term_hidden");
			$("#term_3").addClass("term_hidden");
			break;
		case 3: // binary: 0011
			$("#term_0").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_wide").addClass("term_narrow");
			$("#term_1").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_wide").addClass("term_narrow");
			$("#term_2").addClass("term_hidden");
			$("#term_3").addClass("term_hidden");
			break;
		case 4: // binary: 0100
			$("#term_0").addClass("term_hidden");
			$("#term_1").addClass("term_hidden");
			$("#term_2").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_narrow").addClass("term_wide");
			$("#term_3").addClass("term_hidden");
			break;
		case 5: // binary: 0101
			$("#term_0").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_wide").addClass("term_narrow");
			$("#term_1").addClass("term_hidden");
			$("#term_2").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_wide").addClass("term_narrow");
			$("#term_3").addClass("term_hidden");
			break;
		case 6: // binary: 0110
			$("#term_0").addClass("term_hidden");
			$("#term_1").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_narrow").addClass("term_wide");
			$("#term_2").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_narrow").addClass("term_wide");
			$("#term_3").addClass("term_hidden");
			break;
		case 7: // binary: 0111
			$("#term_0").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_wide").addClass("term_narrow");
			$("#term_1").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			$("#term_2").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			$("#term_3").addClass("term_hidden");
			break;
		case 8: // binary: 1000
			$("#term_0").addClass("term_hidden");
			$("#term_1").addClass("term_hidden");
			$("#term_2").addClass("term_hidden");
			$("#term_3").removeClass("term_short").addClass("term_tall").removeClass("term_narrow").addClass("term_wide");
			break;
		case 9: // binary: 1001
			$("#term_0").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_narrow").addClass("term_wide");
			$("#term_1").addClass("term_hidden");
			$("#term_2").addClass("term_hidden");
			$("#term_3").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_narrow").addClass("term_wide");
			break;
		case 10: // binary: 1010
			$("#term_0").addClass("term_hidden");
			$("#term_1").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_narrow").addClass("term_wide");
			$("#term_2").addClass("term_hidden");
			$("#term_3").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_narrow").addClass("term_wide");
			break;
		case 11: // binary: 1011
			$("#term_0").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			$("#term_1").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_wide").addClass("term_narrow");
			$("#term_2").addClass("term_hidden");
			$("#term_3").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			break;
		case 12: // binary: 1100
			$("#term_0").addClass("term_hidden");
			$("#term_1").addClass("term_hidden");
			$("#term_2").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_wide").addClass("term_narrow");
			$("#term_3").removeClass("term_hidden").removeClass("term_short").addClass("term_tall").removeClass("term_wide").addClass("term_narrow");
			break;
		case 13: // binary: 1101
			$("#term_0").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_narrow").addClass("term_wide");
			$("#term_1").addClass("term_hidden");
			$("#term_2").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			$("#term_3").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			break;
		case 14: // binary: 1110
			$("#term_0").addClass("term_hidden");
			$("#term_1").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_narrow").addClass("term_wide");
			$("#term_2").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			$("#term_3").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			break;
		case 15: // binary: 1111
			$("#term_0").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			$("#term_1").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			$("#term_2").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
			$("#term_3").removeClass("term_hidden").removeClass("term_tall").addClass("term_short").removeClass("term_wide").addClass("term_narrow");
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