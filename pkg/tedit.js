//TODO: Big issue with the use of $("#teditconsole") at present.
//Need to populate it in a better way (as per the screen tedit item), as otherwise we cannot run simultaneous
//instances of TEdit across screen sessions.
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
		if(e.ctrlKey || e.metaKey){
			console.log(code);
			if(code == 70){ // 'f'
				e.preventDefault();
				$("#teditconsole").val("find ");
				trmnl.running.tedit.showConsole();
			}else if(code == 81){ // 'q'
				// check if the contents have been saved first, then the below (actually do that within the exit function to make sure we never accidentally exit without checking)
				trmnl.running.tedit.exit();
			}else if(code == 192){ // '~' (bring up console)
				trmnl.running.tedit.showConsole();
			}
		}
		if(code == 27){
			trmnl.running.tedit.hideConsole();
		}
	});
	$("#teditconsole").keydown(function(e){
		$(this).attr("placeholder",""); // remove the error-spawned placeholder text on interaction
		var code = e.keyCode || e.which;
		if(code == 13){
			e.preventDefault();
			//trmnl.running.tedit.find($(this).val()); // this is search. We will parse input instead
			var cmd = $(this).val();
			trmnl.running.tedit.parse_command(cmd,1);
		}else if(code == 27){ // 'ESC' (hide console)
			trmnl.running.tedit.hideConsole();
		}else if((e.ctrlKey || e.metaKey) && code == 70){
			e.preventDefault();
			$("#teditconsole").val("find ");
			trmnl.running.tedit.showConsole();
		}
	});
	// set the $(trmnl.running.tedit.screen).val() here, based on if argument was supplied.
	$(trmnl.running.tedit.screen).focus();
	return [0, "<span class='cmd-feedback'>Opening TEdit</span>"];
};

pkgs.tedit.help = "<b>TEdit</b>- simple Text EDITor";
//TODO: implement "background" apps (open in new tab) Probably add an html file for apps that are background capable,
// i.e. for this it would be "tedit.html" which allows just going to edmerix.github.io/pkg/tedit.html (though it'd be
// nice to make it index.html within tedit. Perhaps we do that. In fact, like that, all index.html files can be
// almost, if not exactly, the same – a barebones version of the terminal page without command functionality etc.)
var TEdit = function(trmnl){
	this.bg_capable = true; // if true, calling the app with "&" after opens it in a new tab as a standalone app
	this.termID = trmnl.ID;
	this.version = "0.0.1";
	
	this.bg = trmnl.cols.bg;
	this.high_bg = trmnl.cols.feedback;
	this.color = trmnl.cols.output;
	// some settings for functionality:
	this.savetime = 0;
	this.modified = false; //TODO: code this stuff in
	
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
	//TODO: update below where it says <i>New file</i> to be correct when opening a file, and remember to update this when saving
	$(this.titlebar).html("<table style='width: 100%;'><tr><td style='width: 33%;'>TEdit "+this.version+"</td><td style='width: 33%; text-align: center;'><i>New file</i></td><td style='width: 33%;'>&nbsp;</td>");
	
	// status bar:
	this.statusbar = document.createElement("div");
	styleString = "position: absolute; bottom: "+(2*(lineHeight+pad))+"px; left: 5px; height: "+lineHeight+"px;";
	styleString += " line-height: "+lineHeight+"px; right: 5px; color: "+this.color+"; font-size: "+lineHeight+"px; padding-bottom: "+pad+"px;";
	this.statusbar.style = styleString;
	$(this.main).append(this.statusbar);
	
	// console:
	this.console = document.createElement("div");
	styleString = "display: none; position: absolute; bottom: 0px; left: 0; height: "+(2*lineHeight)+"px;";
	styleString += " line-height: "+lineHeight+"px; right: 0; color: "+this.high_bg+"; padding-bottom: "+(2*pad)+"px;";
	this.console.style = styleString;
	$(this.console).html("<table style='width: 100%;'><tr><td style='width: 1px; white-space: nowrap;'>TEDit>></td><td><input id='teditconsole' style='width: 100%; background: transparent; border: none; outline: none;'/></td></tr></table>");
	$(this.main).append(this.console);
	this.consoleActive = false;
	
	// "writeout" link (hidden):
	this.downloadLink = document.createElement("a");
	this.downloadLink.style = "display: none; opacity: 0;";
	$(this.main).append(this.downloadLink);
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
TEdit.prototype.localsave = function(){
	// update this.savetime and this.modified here. Use this.modified to doublecheck exiting tedit during this.exit();
};
TEdit.prototype.writeout = function(fname){
	if(fname == undefined || fname == "" || fname == null){
		fname = 'tedit.txt';
	}
	// Yet to actually code up, this is from the JSFiddle at http://jsfiddle.net/vb7z1jeu/
	var textToWrite = this.screen.value;
	var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	var fileNameToSaveAs = fname;
	
	//var downloadLink = document.createElement("a");
	this.downloadLink.download = fileNameToSaveAs;
	this.downloadLink.innerHTML = "Download File";
	if(window.webkitURL != null){
		this.downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	}else{
		this.downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
	}
	this.downloadLink.click();
	console.log("Downloading file... ...hopefully?");
	terminal[this.termID].output("<span class='cmd-feedback'>Writing file to local machine as \""+fname+"\"</span>");
};
TEdit.prototype.find = function(srch){
	var data = $(this.screen).val().toLowerCase();
	var curPos = this.getCaretPosition();
	var postdata = data.substr(curPos.end);
	var predata = data.substring(0,curPos.end);
	ind = postdata.indexOf(srch.toLowerCase());
	if(ind > -1){
		this.setSelectionRange(ind+curPos.end,ind+curPos.end+srch.length);
		$(this.statusbar).html("");
		return 0;
	}else{
		// not in the text after current caret position, try before and alert that wrapped
		ind = predata.indexOf(srch.toLowerCase());
		if(ind > -1){
			this.setSelectionRange(ind,ind+srch.length);
			$(this.statusbar).html("<span>Search wrapped</span>").show();
			this.statusFade();
			return 0;
		}else{
			//$(this.statusbar).html("<span>\""+srch+"\" not found in file</span>");
			ind = data.indexOf(srch.toLowerCase());
			if(ind > -1){
				this.setSelectionRange(ind,ind+srch.length);
			}else{
				return [1, "\""+srch+"\" not found in file"];
			}
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
TEdit.prototype.showConsole = function(){
	$(this.console).show();
	$("#teditconsole").focus();
	this.consoleActive = true;
};
TEdit.prototype.hideConsole = function(){
	$(this.console).hide();
	$("#teditconsole").val("");
	$(this.screen).focus();
};
TEdit.prototype.statusFade = function(){
	$(this.statusbar).stop().delay(3000).fadeOut(1000);
	var that = this;
	setTimeout(function(){that.revealStatus();},4500);
};
TEdit.prototype.revealStatus = function(){
	console.log("Re-showing TEdit status bar");
	$(this.statusbar).html("").show();
};
// console command parse:
TEdit.prototype.parse_command = function(cmd){
	if(cmd.replace(/ /g,'') != ""){
		cmd = cmd.trim();
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

		var cmdOut = escapeHTML(cmd);

		var response;
		if(typeof(this.fn[fn]) == 'function'){
			response = this.fn[fn](args,this);
		}else{
			response = [1, fn + "&nbsp;<--&nbsp;unknown&nbsp;command"];
		}
		//this.input_div.val(""); // moved to outside the post && split loop
		//this.cmd_hist_pos = 0; // moved to outside the post && split loop
		if(typeof(response) !== "object"){
			resCode = response;
		}else{
			resCode = response[0];
		}
	}
	// based on resCode we need to determine whether to hide the console or not
	// for now:
    if(resCode){
		//TODO: update this so that the <-- message changes depending on the error response
		// NOTE, the response already contains the desired error message as the second item in the array.
		$("#teditconsole").attr("placeholder",response[1]);
        $("#teditconsole").val("");
    }else{
        this.hideConsole();
    }
};
// console functions:
TEdit.prototype.fn = {};
TEdit.prototype.fn.help = function(args,that){
    [args,flags] = terminal[that.termID].parse_flags(args);
	$(that.statusbar).html("<span>Help was called. Yet to code. See console for argument/flag details</span>").show();
	that.statusFade();
	console.log("help was called with these args: "+args);
    console.log("and these flags: "+flags);
    return 0;
};
TEdit.prototype.fn.find = function(args,that){
	[args,flags] = terminal[that.termID].parse_flags(args);
	// might make use of flags in the future, so keeping them here.
	resp = that.find(args.join(" ")); //TODO: run tests on whether re-joining arguments is a good idea. (prob not.)
	return resp; // can probably just do this immediately on the line above without making resp variable
};
TEdit.prototype.fn.replace = function(args,that){
	[args,flags] = terminal[that.termID].parse_flags(args);
	$(that.statusbar).html("<span>Replace was called. Yet to code...</span>").show();
	that.statusFade();
	return 0;
};
TEdit.prototype.fn.save = function(args,that){
	[args,flags] = terminal[that.termID].parse_flags(args);
	$(that.statusbar).html("<span>Writing to local file...</span>").show();
	that.writeout(args.join(" ")); //TODO: same tests on re-joining arguments (a silly idea, but temporary)
	that.statusFade();
	return 0; // it'd be nice to get some sort of confirmation. At least the user should see the download happen.
};
TEdit.prototype.fn.exit = function(args,that){
    [args,flags] = terminal[that.termID].parse_flags(args);
    // might use args and flags later.
    that.exit();
    return 0;
};
