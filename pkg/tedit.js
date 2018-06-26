var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.tedit = function(args,trmnl){
	// sort out arguments later, and put them here.
	var id = trmnl.ID;
	
	trmnl.active = false; // vital to stop what you type potentially propagating back to the terminal
	
	$(trmnl.input_div).hide();
	$(trmnl.prompt_div).hide();
	$(trmnl.output_div).hide();
	
	trmnl.running = trmnl.running || {};
	trmnl.running.tedit = new TEdit(trmnl);
	
	$(trmnl.running.tedit.screen).keydown(function(e){
		var code = e.keyCode || e.which;
		if(e.ctrlKey){
			if(code == 88){ // '^X' // change this to ^W or maybe ^Q
				// check if the contents have been saved first, then the below (actually do that within the exit function to make sure we never accidentally exit without checking)
				trmnl.running.tedit.exit();
			}
		}
	});
	// set the $(trmnl.running.tedit.screen).val() here, based on if argument was supplied.
	$(trmnl.running.tedit.screen).focus();
	return [0, "<span class='cmd-feedback'>Opening TEdit</span>"];
};

pkgs.tedit.help = "<b>TEdit</b>- simple Text EDITor";

var TEdit = function(trmnl){
	this.termID = trmnl.ID;
	this.version = "0.0.1";
	
	this.bg = trmnl.cols.bg;
	this.high_bg = trmnl.cols.feedback;
	this.color = trmnl.cols.output;
	
	// actual screen:
	this.main = document.createElement("div");
	this.main.setAttribute("id","tedit_"+trmnl.ID);
	this.main.setAttribute("class","noprop tedit");
	var styleString = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-size: 14px; background: "+this.bg+";";
	this.main.style = styleString;
	$(trmnl.body).append(this.main);
	
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
	$(this.main).append(this.screen);
	
	// title bar:
	this.titlebar = document.createElement("div");
	styleString = "position: absolute; top: 0; left: 0; height: "+lineHeight+"px; line-height: "+lineHeight+"px; right: 0; background: "+this.high_bg+"; color: "+this.bg+"; padding-bottom: "+pad+"px;";
	this.titlebar.style = styleString;
	$(this.main).append(this.titlebar);
	$(this.titlebar).html("<table style='width: 100%;'><tr><td style='width: 33%;'>TEdit "+this.version+"</td><td style='width: 33%; text-align: center;'><i>New file</i></td><td style='width: 33%;'>&nbsp;</td>");
	
	// status bar:
	this.statusbar = document.createElement("div");
	styleString = "position: absolute; bottom: 0px; left: 0; height: "+lineHeight+"px;";
	styleString += " line-height: "+lineHeight+"px; right: 0; color: "+this.color+"; font-size: "+lineHeight+"px; padding-bottom: "+pad+"px;";
	this.statusbar.style = styleString;
	$(this.main).append(this.statusbar);
}

// methods:
TEdit.prototype.exit = function(){
	//TODO: check if modified first.
	terminal[this.termID].output("<span class='cmd-feedback'>Closing TEdit</span>");
	$(terminal[this.termID].input_div).show();
	$(terminal[this.termID].prompt_div).show();
	$(terminal[this.termID].output_div).show();
	
	terminal[this.termID].running.tedit.main.remove();
	delete terminal[this.termID].running.tedit
	
	terminal[this.termID].active = true;
	
	var d = $(terminal[this.termID].body);
	d.scrollTop(d.prop("scrollHeight"));
	
	terminal[this.termID].input_div.focus();
}
TEdit.prototype.writeout = function(){
	
}
TEdit.prototype.find = function(srch){
	var data = $(this.screen).val().toLowerCase();
	ind = data.indexOf(srch.toLowerCase()); // actually, ought to search for next instance from cursor, and tell you if wraps.
	// i.e. data = data.substring(caretpos,end)+data.substring(0,caretpos-1) in pseudocode, then search, and if result is greater than end-caretpos, say search wrapped.
	if(ind > -1){
		this.setSelectionRange(ind,ind+srch.length);
		$(this.statusbar).html(""); // unless we need to say how many instances, or if search wrapped.
	}else{
		$(this.statusbar).html("<span>\""+srch+"\" not found in file</span>")
	}
}
TEdit.prototype.setSelectionRange = function(start,end){
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
