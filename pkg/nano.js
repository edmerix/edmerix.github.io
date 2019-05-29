var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.nano = function(args,trmnl){
	// sort out arguments later, and put them here.
	var id = trmnl.ID;

	trmnl.active = false; // vital to stop what you type potentially propagating back to the terminal

	trmnl.input_div.style.display = "none";
	trmnl.prompt_div.style.display = "none";
	trmnl.output_div.style.display = "none";

	trmnl.running = trmnl.running || {};
	trmnl.running.nano = new Nano(trmnl);

	trmnl.running.nano.screen.onkeydown = function(e){
		var code = e.keyCode || e.which;
		if(e.ctrlKey){
			if(code == 88){ // '^X'
				// check if the contents have been saved first, then the below (actually do that within the exit function to make sure we never accidentally exit without checking)
				trmnl.running.nano.exit();
			}else if(code == 87){ // ^W
				trmnl.running.nano.statusbar.innerHTML = "<table style='width: 100%;'><tr><td style='width: 1px; white-space: nowrap;'>Search:</td><td><input id='nanosrch' style='width: 100%; background: transparent; border: none; outline: none;'/></td></tr></table>";
				document.getElementById("nanosrch").focus();
				document.getElementById("nanosrch").onkeydown = function(e){
					var code = e.keyCode || e.which;
					if(code == 13){
						e.preventDefault();
						trmnl.running.nano.find(this.value);
					}
				};
			}
			/* add all the extra keyboard commands here, i.e.: (no idea what some of these do)
			^G: Get Help
			^O: WriteOut
			^R: Read File
			^Y: Prev Page
			^K: Cut Text
			^C: Cur Pos
			^X: Exit
			^J: Justify
			^W: Where Is
			^V: Next Page
			^U: UnCut Text
			^T: To Spell
			*/
		}
	};
	// set the trmnl.running.nano.screen.value here, based on if argument was supplied.
	trmnl.running.nano.screen.focus();
	return [0, "<span class='cmd-feedback'>Opening nano</span>"];
};

pkgs.nano.help = "<b>@{nano}</b>-inspired text editor";

var Nano = function(trmnl){
	// see https://www.nano-editor.org/dist/v2.2/nano.html for info on what to code here.
	this.termID = trmnl.ID;
	this.version = "0.0.1";

	this.bg = trmnl.cols.bg;
	this.high_bg = trmnl.cols.feedback;
	this.color = trmnl.cols.output;

	this.shortcuts = {
		g: 'Get Help',
		o: "WriteOut",
		r: "Read File",
		y: "Prev Page",
		k: "Cut Text",
		c: "Cur Pos",
		x: "Exit",
		j: "Justify ",
		w: "Where Is",
		v: "Next Page",
		u: "UnCut Text",
		t: "To Spell"
	};

	// actual screen:
	this.main = document.createElement("div");
	this.main.setAttribute("id","nano_"+trmnl.ID);
	this.main.setAttribute("class","noprop nano");
	var styleString = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-size: 14px; background: "+this.bg+";";
	this.main.style = styleString;
	trmnl.body.appendChild(this.main);

	var lineHeight = 14;
	var pad = 2;


	this.screen = document.createElement("textarea");
	styleString = "position: absolute; width: calc(100% - 20px); height: calc(100% - "+(10+(4*(lineHeight+pad)))+"px);";
	styleString += " max-width: calc(100% - 20px); max-height: calc(100% - "+(10+(4*(lineHeight+pad)))+"px); top: "+(lineHeight+pad)+"px; left: 0;";
	styleString += " border: none; outline: none; padding: 5px 10px; margin: 0;";
	styleString += " font-family: 'Inconsolata', 'Courier New', monospace; font-size: 15px;"
	styleString += " background: transparent;";
	styleString += " color: "+this.color+";";
	this.screen.style = styleString;
	this.main.appendChild(this.screen);

	// top message:
	this.titlebar = document.createElement("div");
	styleString = "position: absolute; top: 0; left: 0; height: "+lineHeight+"px; line-height: "+lineHeight+"px; right: 0; background: "+this.high_bg+"; color: "+this.bg+"; padding-bottom: "+pad+"px;";
	this.titlebar.style = styleString;
	this.main.appendChild(this.titlebar);
	this.titlebar.innerHTML = "<table style='width: 100%;'><tr><td style='width: 33%;'>emerix nano "+this.version+"</td><td style='width: 33%; text-align: center;'>New buffer</td><td style='width: 33%;'>&nbsp;</td>"; // adjust this, temporary

	/* The titlebar is the line displayed at the top of the editor. There are three sections: left, center and right. The section on the left displays the version of nano being used. The center section displays the current filename, or "New Buffer" if the file has not yet been named. The section on the right will display "Modified" if the file has been modified since it was last saved or opened. */

	// status bar:
	this.statusbar = document.createElement("div");
	styleString = "position: absolute; bottom: "+(2*(lineHeight+pad))+"px; left: 0; height: "+lineHeight+"px;";
	styleString += " line-height: "+lineHeight+"px; right: 0; color: "+this.color+"; font-size: "+lineHeight+"px; padding-bottom: "+pad+"px;";
	this.statusbar.style = styleString;
	this.main.appendChild(this.statusbar);
	/* The statusbar is the third line from the bottom of the screen, or the bottom line in Expert Mode. See See Expert Mode, for more info. It shows important and informational messages. Any error messages that occur from using the editor will appear on the statusbar. Any questions that are asked of the user will be asked on the statusbar, and any user input (search strings, filenames, etc.) will be input on the statusbar. */

	// shortcut list:
	this.shortcutbar = document.createElement("div");
	styleString = "position: absolute; bottom: 0px; left: 0; height: "+(2*lineHeight)+"px;";
	styleString += " line-height: "+lineHeight+"px; right: 0; color: "+this.high_bg+"; padding-bottom: "+(2*pad)+"px;";
	this.shortcutbar.style = styleString;
	this.main.appendChild(this.shortcutbar);

	this.listShortcuts(12);
}

Nano.prototype.listShortcuts = function(tot){
	var shortStr = "<table style='width: 100%; height: 100%; border: none; border-collapse: collapse;'>";
	shortStr += "<tr>";
	// automate the below instead:
	var c = 0;
	for(s in this.shortcuts){
		shortStr +="<td><span style='background: "+this.high_bg+"; color: "+this.bg+";'>^"+s.toUpperCase()+"</span>&nbsp;"+this.shortcuts[s]+"</td>";
		c++;
		if(c == Math.round(tot/2)) shortStr += "</tr><tr>";
		if(c >= tot) break; // only list the first 12.
	}
	shortStr += "</tr></table>";
	this.shortcutbar.innerHTML = shortStr;
}

// methods:
Nano.prototype.exit = function(){
	//TODO: check if modified first.
	terminal[this.termID].output("<span class='cmd-feedback'>Closing nano</span>");
	terminal[this.termID].input_div.style.display = "block";
	terminal[this.termID].prompt_div.style.display = "block";
	terminal[this.termID].output_div.style.display = "block";

	terminal[this.termID].running.nano.main.remove();
	delete terminal[this.termID].running.nano

	terminal[this.termID].active = true;

	terminal[this.termID].scrollDown();

	terminal[this.termID].input_div.focus();
}
Nano.prototype.writeout = function(){

}
Nano.prototype.find = function(srch){
	var data = this.screen.value;
	ind = data.indexOf(srch); // actually, ought to search for next instance from cursor, and tell you if wraps.
	// i.e. data = data.substring(caretpos,end)+data.substring(0,caretpos-1) in pseudocode, then search, and if result is greater than end-caretpos, say search wrapped.
	if(ind > -1){
		this.setSelectionRange(ind,ind); // need to do how many occurences, as per real nano
		this.statusbar.innerHTML = ""; // unless we need to say how many instances, or if search wrapped.
	}else{
		this.statusbar.innerHTML = "<span>[ \""+srch+"\" not found ]</span>";
	}
}
Nano.prototype.setSelectionRange = function(start,end){
	if(this.screen.setSelectionRange){
		this.screen.focus();
		this.screen.setSelectionRange(start,end);
		console.log("Setting selection range from "+start+" to "+end);
	}else if(this.screen.createTextRange){
		console.log("Setting text range from "+start+" to "+end);
		var range = this.screen.createTextRange();
		range.collapse(true);
		range.moveEnd('character', end);
		range.moveStart('character', start);
		range.select();
	}
}
