function Terminal(cmdID,prmpt,input_div,output_div,prompt_div,container,theme_file){
	this.ID = cmdID;
	this.title = "emerix";
	this.version = 0.2;
	this.releaseDate = "2019-04-13";

	this.prompt = prmpt;
	this.base_prompt = prmpt;
	this.next_prompt = prmpt;
	this.cmd_hist = [];
	this.cmd_hist_pos = 0;
	this.cmd_hist_size = 100; // limit for history storage (allows more during a session, but limits in localstorage)
	// TODO: hist_size resets to 100 at each new load. Should be stored as a localstorage setting (as should others)
	this.input_div = document.getElementById(input_div);
	this.output_div = document.getElementById(output_div);
	this.prompt_div = document.getElementById(prompt_div);
	this.body = document.getElementById(container);
	this.active = true;
	this.program = "base";		// what program we're currently in (base is normal commands)
	this.piping = false; 		// used to "pipe" command outputs to another command ("|" symbol)
	this.pipe_function = null;	// what command to pass the output to if "piping" (assigned automatically with whatever is after the | symbol)

	this.cols = {};
	this.cols.output = '#FFF';
	this.cols.feedback = '#9CF';
	this.cols.error = '#E85555';
	this.cols.bg = '#000';

	// Load up the themes.json file:
	this.theme_file = theme_file;
	this.themes = {};
	let me = this;
	let xhr = new XMLHttpRequest();
	xhr.open('GET', me.theme_file, true);
	xhr.onload = function(){
		const themes = JSON.parse(this.responseText);
		me.themes = themes;

		let theme_help = "<b>THEME</b> command: change terminal to a different theme. Available themes are: <hr /><table><tr>";
		let c = 0;
		for(let t in themes){
			theme_help += "<td class='cmd-feedback'>"+t+"</td>";
			c++;
			if(c%6 == 0 && c != 1) theme_help += '</tr><tr>';
		}
		theme_help += "</tr></table>";
		me.base.theme.help = theme_help;
		me.parse_command('theme dracula',0); // put this in temporarily as my current favorite theme
	};
	xhr.onerror = function(err){
		me.output("<span class='cmd-feedback'>Couldn't load the themes file, only default theme available.</span>"); // why didn't I make terminal.feedback a method?!
		console.log(err);
	}
	xhr.send(null);

	// load locally stored command history, if present (localstorage, i.e. computer-specific)
	var localhist = JSON.parse(localStorage.getItem("history"));
	if(localhist !== null){
		// check if it's the appropriate data and format for this.cmd_hist and apply it if so
		if(localhist.constructor === Array){ // it's an array...
			if(localhist.every(function(i){ return typeof i === "string" })){ // they're all strings :)
				this.cmd_hist = localhist;
			}
		}
	}

	var trmnl = this;
	// set up clicking within terminal to move focus to input:
	this.body.onclick = function(){
		trmnl.input_div.focus();
	};

	this.output_div.innerHTML = "";
    if(this.title != undefined && this.title != null){
        var out = document.createElement("div");
		out.classList.add("cmd-feedback");
		out.classList.add("output-line");
		out.innerHTML = this.title+" v"+this.version+" || terminal:"+this.ID+"<br /><i>[release: "+this.releaseDate+"]</i>";
        this.output_div.appendChild(out);
    }
    this.prompt_div.innerHTML = this.prompt.replace("[d]","").replace("[t]","");

	this.input_div.onkeydown = (function(e){
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
					var thusfar = this.value;
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
							trmnl.input_div.value = results[0]; // update the input if one match been found
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
				var cmd = this.value;
				trmnl.parse_command(cmd,1);
			}else if(code == 27){
				//trmnl.reset();
				trmnl.input_div.value = "";
			}else if(code == 38){ //up arrow
				trmnl.cmd_hist_pos++;
				if(trmnl.cmd_hist_pos > trmnl.cmd_hist.length)
					trmnl.cmd_hist_pos = trmnl.cmd_hist.length;
				// this is to vaguely sanitize the history, stripping unwanted html:
				let new_cmd = document.createElement('div');
				new_cmd.innerHTML = trmnl.cmd_hist[trmnl.cmd_hist.length-trmnl.cmd_hist_pos];
				new_cmd = new_cmd.innerText;
				if(new_cmd != "undefined") // allowing && command chaining has broken this a little
					this.value = new_cmd;
				e.preventDefault();
			}else if(code == 40){ //down arrow
				trmnl.cmd_hist_pos--;
				if(trmnl.cmd_hist_pos<0)
					trmnl.cmd_hist_pos = 0;
				// this is to vaguely sanitize the history, stripping unwanted html:
				let new_cmd = document.createElement('div');
				new_cmd.innerHTML = trmnl.cmd_hist[trmnl.cmd_hist.length-trmnl.cmd_hist_pos];
				new_cmd = new_cmd.innerText;
				if(new_cmd != "undefined")
					this.value = new_cmd;
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

	let auto_progs = ['base']; // for autocomplete compilation (a few lines below)

	/**************************************************************/
	/***       base functions (i.e. commands):			        ***/
	/**************************************************************/
	for(let command in core){
		//TODO: check for duplicates here!
		this.base[command] = core[command];
	}

	/********************************************************/
	/***       programs (i.e. non "base" commands):       ***/
	/********************************************************/
	for(let program in programs){
		//TODO:  check for duplicate program here first
		this[program] = programs[program];
		auto_progs.push(program); // add the program to the list of programs to compile autocompletion for (below)
	}

	/***** AUTOCOMPLETES: *****/
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
Terminal.prototype.parse_command = function(cmd,printing = true){
	// should do the actual parsing with regex. Check out http://regexlib.com/Search.aspx?k=command+line&c=-1&m=-1&ps=20&AspxAutoDetectCookieSupport=1 for ideas.
	if(cmd == '!!'){ // as per bash.
		cmd = this.cmd_hist[this.cmd_hist.length-1];
	}
	if(cmd.replace(/ /g,'') != ""){
        this.cmd_counter++;
        var cmdOut = escapeHTML(cmd);
        if(this.piping) cmdOut += "|"+this.pipe_function;
        if(printing){
            this.cmd_hist.push(cmdOut);
			// localstorage version of the history:
			var tempHist = this.cmd_hist.slice(Math.max(this.cmd_hist.length - this.cmd_hist_size, 0));
			tempHist = JSON.stringify(tempHist);
			localStorage.setItem("history",tempHist);
            this.output(cmdOut,1);
        }
    }
    var separate_cmds = cmd.split('&&'); // logical command sequence, i.e. only keep performing while response less than 1
    var resCode = 0;
	//TODO: this parsing is getting messy, separate things into functions, e.g. trmnl.getPushes(cmd); trmnl.sendCommand(cmd); trmnl.etc();
    for(var s = 0; s < separate_cmds.length; s++){
        if(resCode < 1){
            cmd = separate_cmds[s];
            if(cmd.replace(/ /g,'') != ""){
                this.input_div.style.display = "none";
                this.prompt_div.style.display = "none";
                cmd = cmd.trim();
				// check for | in the command, which is used to pipe output from first to input of next command:
				if(cmd.indexOf('|') > -1){
					this.piping = true;
					var pipe_split = cmd.split("|");
					cmd = pipe_split[0];
					this.pipe_function = pipe_split[1];
				}else{
					this.piping = false;
					this.pipe_function = null;
				}
				// check for :: in the args, which is used to push the command to a different terminal (if open):
				let whoTo = [this];
				let noProp = false;
				//
				const pushReg = /::\d+/g;
				const pushVal = cmd.match(pushReg);
				if(pushVal != null){
					let pop;
					whoTo = []; // don't auto-include the calling terminal
					for(let p in pushVal){
						pop = pushVal[p].replace(/::/g,'');
						if(typeof(terminal[pop]) === "object"){
							whoTo.push(terminal[pop]);
						}else{// mention that it cannot find the requested terminal
							this.output("<font class='cmd-feedback'>Terminal "+pop+" does not exist, skipping...</font>");
						}
					}
					// remove all push requests from the command:
					cmd = cmd.replace(pushReg,'');
					// if whoTo is empty, show an error and set noProp = true;
					if(whoTo.length < 1){
						this.error("None of the requested terminals exist, cannot proceed");
						noProp = true;
					}
				}
				// allow repeating the same command multiple times with !n
				const repeatReg = /!\d+/g; // it's global so we can remove them all, but we'll only parse the first result
				let repeatVal = cmd.match(repeatReg);
				if(repeatVal != null){
					if(Array.isArray(repeatVal)) repeatVal = repeatVal[0];
					repeatVal = repeatVal.replace(/!/g,'');
					cmd = cmd.replace(repeatReg,'');
					for(let r = 0; r < parseInt(repeatVal)-1; r++){ //TODO: see the comment below, and fix this parser so whole things can be repeated or pushed to another terminal, a la {command | command2} ::1 or {randcol | showcol} !10
						separate_cmds.push(cmd); // re-add the command this many times to the separate_cmds to be parsed through in this loop (note this means we cannot repeat both sides of a pipe at once currently)
					}
				}
				if(!noProp){
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
							// trim each one:
							for(var a = 0; a < args.length; a++){
								args[a] = args[a].trim();
							}
							// remove empty arguments (often happens while pushing to another terminal)
							args = args.filter(function(item){ return item != ""});
						}else{
							args = '';
						}
					}
					let response, who;
					for(let w = 0; w < whoTo.length; w++){
						who = whoTo[w];
						if(typeof(who[who.program][fn]) == 'function'){
							response = who[who.program][fn](args,who);
						}else{
							// attempt via the protected.fallback function if exists, else throw error:
							if(typeof(who[who.program].protected.fallback) == 'function'){
								response = who[who.program].protected.fallback(cmd,fn,args,who); // NOTE that we pass the original command here, as well as fn and args after!
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
						if(typeof(response) !== "object"){
							resCode = response;
						}else{
							resCode = response[0];
						}
					}
				}else{
					this.output("Terminal does not exist, cannot push "+fn+" to it.");
					resCode = 1;
				}
            }
        }else{
            this.output("Previous command ("+separate_cmds[s-1].trim()+") did not complete: not continuing command sequence",0);
            break;
        }
        this.input_div.value = "";
        this.cmd_hist_pos = 0;
		if(this.active){
			this.input_div.style.display = "block";
			this.prompt_div.style.display = "block";
		}
    }
}
Terminal.prototype.linesep = function(){
	let line = document.createElement("div");
	line.classList.add("output-line");
	line.innerHTML = "<hr />";
	this.output_div.appendChild(line);
};
Terminal.prototype.output = function(output,prompted){
    var out, outprompt, outline;
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
		out = document.createElement("div");
		out.classList.add("output-line");
        outprompt = document.createElement("div");
		outprompt.classList.add("cmd-prompt");
		outprompt.title = prmpt_title;
		outprompt.innerHTML = prmpt;
		out.appendChild(outprompt);
		outline = document.createElement("span");
		outline.innerHTML = output;
		out.appendChild(outline);
		this.output_div.appendChild(out);
    }else{
		out = document.createElement("div");
		out.classList.add("output-line");
        outprompt = document.createElement("div");
		outprompt.classList.add("cmd-prompt");
		outprompt.innerHTML = output;
		out.appendChild(outprompt);
		this.output_div.appendChild(out);
    }
	var trmnl = this;
	setTimeout(function(){trmnl.scrollDown();},10);
}
Terminal.prototype.scrollDown = function(){
	let ht = this.body.scrollHeight - this.body.offsetHeight;
	this.body.scrollTop = ht;
}
Terminal.prototype.error = function(precursor,val){
    var out, outdiv;
	out = precursor;
    if(val != undefined && val != "" && val != null){
        out += ", '"+val+"'";
    }
	outdiv = document.createElement("div");
	outdiv.classList.add("cmd-err");
	outdiv.innerHTML = "ERROR: "+out;
    this.output_div.appendChild(outdiv);
	var trmnl = this;
	setTimeout(function(){trmnl.scrollDown();},10);
}
Terminal.prototype.reset = function(new_prompt){
	if(typeof(new_prompt) != 'undefined' || new_prompt != null || new_prompt != ""){
		this.set_prompt(new_prompt);
	}
    this.input_div.value = "";
}
Terminal.prototype.parse_flags = function(args){
	//e.g. [args,flags] = trmnl.parse_flags(args);
	var flags = [],
		params = [];
	for(var a = 0; a < args.length; a++){
		if(args[a].charAt(0) == '-'){
			if(args[a].charAt(1) == '-'){
				flags.push(args[a].substr(2));
			}else{
				for(var b = 1; b < args[a].length; b++){
					flags.push(args[a][b]);
				}
			}
		}else{
			params.push(args[a]);
		}
	}
	//console.log(flags);
	return [params, flags];
}
Terminal.prototype.set_prompt = function(new_prompt){
    if(typeof(new_prompt) == 'undefined' || new_prompt == null || new_prompt == ""){
        this.prompt = "$>";
    }else{
        this.prompt = new_prompt;
    }
    this.prompt_div.innerHTML = this.prompt;
    document.title = this.prompt;
}
Terminal.prototype.update_colors = function(){
	this.body.style.background = this.cols.bg;
    this.input_div.style.color = this.cols.output;
    this.output_div.style.color = this.cols.output;
    this.prompt_div.style.color = this.cols.output;

	var col_setup = "";
	for(var t in terminal){
		col_setup += '#'+terminal[t].body.getAttribute("id")+' .cmd-prompt {color:'+terminal[t].cols.output+';}\n';
		col_setup += '#'+terminal[t].body.getAttribute("id")+' .cmd-err {color:'+terminal[t].cols.error+';}\n';
		col_setup += '#'+terminal[t].body.getAttribute("id")+' .cmd-feedback {color:'+terminal[t].cols.feedback+';}\n';
		col_setup += '#'+terminal[t].body.getAttribute("id")+' a {color:'+terminal[t].cols.feedback+';}\n';
	}
	document.getElementById('dynamic-cols').innerHTML = col_setup;
	// I do not like the feel of the method above (with the inline style in the head), but it allows for future elements to have their css altered also.
}
//TODO: start using the below xhrPromise method!
// New method to use to replace all xhr calls that hide and re-show the terminal:
// 		e.g. let response = await me.xhrPromise(url);
Terminal.prototype.xhrPromise = function(url, method='GET'){
	//TODO: could open this up to different responseType too (i.e. function(url, method='GET', type='json'))
	return new Promise(function(resolve, reject){
		let xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.onload = function(){
			resolve(this.responseText);
		};
		xhr.onerror = function(err){
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send(null);
	});
};
Terminal.prototype.exit = function(callingID){
	var w = this.ID;
	// work out which are open based on which terminal[n] is an object, e.g. 0,1,3
	// then bitshift for a switch on how the layout should look. So [0,1,3] becomes 1011 in binary becomes 11 in decimal.
	// maybe not. that's a lot of overlapping layout scenarios for individual screens. hmm. Done below anyway.
	delete terminal[w];
	// TODO: this is weird, check it and simplify if possible:
	document.getElementById("term_"+w).innerHTML = "<div id=\"cmd-history_"+w+"\" class=\"cmd-history\"></div>\n\t\t<div id=\"input-line_"+w+"\" class=\"input-line\">\n\t\t\t<div class=\"cmd-prompt\" id=\"cmd-prompt_"+w+"\">$></div>\n\t\t\t<div id=\"cmd-input_"+w+"\" class=\"cmd-input\"><input id=\"main-input_"+w+"\" class=\"main-input\" type=\"text\" spellcheck=\"false\"/></div>"; // reset the terminal container
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
