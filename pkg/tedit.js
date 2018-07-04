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
			console.log(code);
			if(code == 88){ // '^X' // change this to ^W or maybe ^Q
				// check if the contents have been saved first, then the below (actually do that within the exit function to make sure we never accidentally exit without checking)
				trmnl.running.tedit.exit();
			}else if(code == 192){ // '^~' (bring up console)
				$(trmnl.running.tedit.console).show();
				$("#teditconsole").focus();
				$("#teditconsole").keydown(function(e){
					var code = e.keyCode || e.which;
					if(code == 13){
						e.preventDefault();
						//trmnl.running.tedit.find($(this).val()); // this is search. We will parse input instead
					}
				});
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
	styleString = "position: absolute; bottom: "+(2*(lineHeight+pad))+"px; left: 0; height: "+lineHeight+"px;";
	styleString += " line-height: "+lineHeight+"px; right: 0; color: "+this.color+"; font-size: "+lineHeight+"px; padding-bottom: "+pad+"px;";
	this.statusbar.style = styleString;
	$(this.main).append(this.statusbar);
	
	// console:
	this.console = document.createElement("div");
	styleString = "display: none; position: absolute; bottom: 0px; left: 0; height: "+(2*lineHeight)+"px;";
	styleString += " line-height: "+lineHeight+"px; right: 0; color: "+this.high_bg+"; padding-bottom: "+(2*pad)+"px;";
	this.console.style = styleString;
	$(this.console).html("<table style='width: 100%;'><tr><td style='width: 1px; white-space: nowrap;'>TEDit>></td><td><input id='teditconsole' style='width: 100%; background: transparent; border: none; outline: none;'/></td></tr></table>");
	$(this.main).append(this.console);
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
	var curPos = this.getCaretPosition();
	var postdata = data.substr(curPos.end);
	var predata = data.substring(0,curPos.end);
	ind = postdata.indexOf(srch.toLowerCase());
	if(ind > -1){
		this.setSelectionRange(ind+curPos.end,ind+curPos.end+srch.length);
		$(this.statusbar).html("");
	}else{
		// not in the text after current caret position, try before and alert that wrapped
		ind = predata.indexOf(srch.toLowerCase());
		if(ind > -1){
			this.setSelectionRange(ind,ind+srch.length);
			$(this.statusbar).html("<span>\"Search wrapped\"</span>");
		}else{
			$(this.statusbar).html("<span>\""+srch+"\" not found in file</span>");
		}
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
TEdit.prototype.getCaretPosition = function(){
	if(document.selection){
		// IE < 9 Support
		this.screen.focus();
		var range = document.selection.createRange();
		var rangelen = range.text.length;
		range.moveStart ('character', -this.screen.value.length);
		var start = range.text.length - rangelen;
		return {'start': start, 'end': start + rangelen };
	}else if(this.screen.selectionStart || this.screen.selectionStart == '0'){
		// IE >=9 and other browsers
		return {'start': this.screen.selectionStart, 'end': this.screen.selectionEnd };
	}else{
		return {'start': 0, 'end': 0};
	}
}
