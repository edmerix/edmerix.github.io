var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.notebook = function(args,trmnl){
	const id = trmnl.ID;

	trmnl.active = false; // vital to stop what you type potentially propagating back to the terminal

	trmnl.input_div.style.display = "none";
	trmnl.prompt_div.style.display = "none";
	trmnl.output_div.style.display = "none";

	trmnl.running = trmnl.running || {};
	trmnl.running.notebook = new Notebook(trmnl);

	//NOTE! this is onkeyup, not onkeydown. Necessary for exiting without keypress reaching underlying terminal.
	//		User onkeydown for main interaction with arrow keys, deleting, modifying etc.
	trmnl.running.notebook.main.onkeyup = function(e){
		var code = e.keyCode || e.which;
		console.log("Keycode "+code+" from Notebook program");
		if(code == 81){ // q
			trmnl.running.notebook.exit();
		}
	};
	return [0, "![Opening Notebook]"];
};
pkgs.notebook.help = "<b>notebook</b> program: use to navigate your locally stored @{notes}.";

const Notebook = function(trmnl){
	this.terminal = trmnl;
	this.version = "0.1";
	/* // This shouldn't be necessary anymore:
	this.backupKeydown = this.terminal.input_div.onkeydown;
	this.terminal.input_div.onkeydown = function(){return false;};
	*/
	this.bg = trmnl.cols.bg;
	this.high_bg = trmnl.cols.feedback;
	this.color = trmnl.cols.output;

	this.main = document.createElement("div");
	this.main.setAttribute("id","notebook_"+this.terminal.ID);
	this.main.setAttribute("class","noprop notebook");
	this.main.setAttribute("tabindex","0"); // necessary for key presses to work while limiting it to this app
	var styleString = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-size: 14px; background: "+this.bg+"; outline: none;";
	this.main.style = styleString;
	this.terminal.body.appendChild(this.main);
	this.main.focus();
};

Notebook.prototype.exit = function(){
	this.terminal.output("![Closing Notebook]");
	this.terminal.input_div.style.display = "block";
	this.terminal.prompt_div.style.display = "block";
	this.terminal.output_div.style.display = "block";

	this.terminal.running.notebook.main.remove();
	delete this.terminal.running.notebook;

	this.terminal.scrollDown();

	this.terminal.input_div.focus();
	this.terminal.active = true;
};
