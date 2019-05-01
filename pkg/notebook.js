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
		const code = e.keyCode || e.which;
		if(!trmnl.running.notebook.editing){
			switch(code){
				case 81: // q (quit)
					trmnl.running.notebook.exit();
					break;
				case 69: // e (edit)
					trmnl.running.notebook.edit();
					break;
			}
		}else{
			// put in the key commands for during edit here (i.e. enter or esc to save or cancel edits)
			switch(code){
				case 13: // enter (save note)
					trmnl.running.notebook.save_edit();
					break;
				case 27: // esc (cancel edit)
					trmnl.running.notebook.cancel_edit();
					break;

			}
		}
	};
	// This one is the keydowns:
	trmnl.running.notebook.main.onkeydown = function(e){
		const code = e.keyCode || e.which;
		if(!trmnl.running.notebook.editing){
			switch(code){
				case 38: // up arrow
					trmnl.running.notebook.activate_previous();
					break;
				case 40: // down arrow
					trmnl.running.notebook.activate_next();
					break;
				case 68: // d (delete)
				case 8:  // backspace
				case 46: // delete
					trmnl.running.notebook.delete_note();
					break;
				case 90: // z (undo)
					trmnl.running.notebook.undo();
					break;
				case 67: // c (complete)
					trmnl.running.notebook.complete();
					break;
				case 73: // i (incomplete)
					trmnl.running.notebook.incomplete();
					break;
				case 13: // enter (toggle complete)
					trmnl.running.notebook.toggle_complete();
					break;
			}
		}
	};
	return [0, "![Opening Notebook]"];
};
pkgs.notebook.help = "<b>notebook</b> program: use to navigate your locally stored @{notes}.";

//TODO: I want this to be a const and to only create it if Notebook hasn't already been installed in a different terminal. Annoying.
var Notebook = function(trmnl){
	this.terminal = trmnl;
	this.version = "0.1";
	this.active_note = -1;
	this.editing = false;
	this.backup = []; // store deleted notes for the session in case of undo
	this.oldPositions = []; // where the deleted not should go

	// set colors based on terminal theme:
	this.bg = trmnl.cols.bg;
	this.highlight = trmnl.cols.feedback;
	this.color = trmnl.cols.output;
	// load local notes:
	this.load();
	// main window:
	this.main = document.createElement("div");
	this.main.setAttribute("id",`notebook_${this.terminal.ID}`);
	this.main.setAttribute("class","noprop notebook");
	this.main.setAttribute("tabindex","0"); // necessary for key presses to work while limiting it to this app
	let styleString = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-size: 14px; background: ${this.bg}; outline: none;`;
	this.main.style = styleString;
	this.terminal.body.appendChild(this.main);
	// title:
	const title = document.createElement("h1");
	title.innerHTML = "Notebook";
	styleString = `position: absolute; margin: 0; top: 5px; left: 5px; font-variant: small-caps; color: ${this.highlight};`;
	title.style = styleString;
	this.main.appendChild(title);
	// shortcut list:
	const shortcutsL = document.createElement("div");
	styleString = `position: absolute; bottom: 4px; left: 4px; text-align: left; color: ${this.color}; opacity: 0.7;`;
	shortcutsL.style = styleString;
	shortcutsL.innerHTML = "q to quit<br />arrow keys to navigate<br />e to edit<br />z to undo delete <i>(lost upon exiting Notebook)</i>";
	this.main.appendChild(shortcutsL);
	const shortcutsR = document.createElement("div");
	styleString = `position: absolute; bottom: 4px; right: 4px; text-align: right; color: ${this.color}; opacity: 0.7;`;
	shortcutsR.style = styleString;
	shortcutsR.innerHTML = "enter to toggle complete<br />c to mark complete<br />i to mark incomplete<br />d/backspace to delete";
	this.main.appendChild(shortcutsR);
	// blurb:
	const blurb = document.createElement("div");
	styleString = `position: absolute; top: 40px; left: 10px; font-size: 12px; color: ${this.color};`;
	blurb.style = styleString;
	blurb.innerHTML = `You have ${this.notes.length} locally stored notes`;
	this.main.appendChild(blurb);
	// notes table and its holder:
	const tableHolder = document.createElement("div");
	styleString = `position: absolute; top: 60px; left: 5px; right: 5px; bottom: 70px; overflow: auto; border: 1px solid ${this.highlight};`;
	tableHolder.style = styleString;
	this.main.appendChild(tableHolder);
	this.notesTable = document.createElement("table");
	this.notesTable.style.width = "100%";

	this.note_row = [];
	this.td = {};
	this.td.id = [];
	this.td.note = [];
	this.td.creation = [];
	this.td.modification = [];

	tableHolder.appendChild(this.notesTable);
	this.draw();
	// start by selecting the first note:
	this.activate(0);
	// need to focus on the window to capture key presses:
	this.main.focus();
};
Notebook.prototype.load = function(){
	this.notes = JSON.parse(localStorage.getItem('notes'));
	if(this.notes === null){
		this.notes = [];
	}
};

Notebook.prototype.save = function(){
	localStorage.setItem("notes",JSON.stringify(this.notes));
};

Notebook.prototype.draw = function(){
	this.notesTable.innerHTML = "<tr><th>ID</th><th>Note</th><th>Creation date</th><th>Last modified</th></tr>";
	for(let n = 0; n < this.notes.length; n++){
		this.note_row[n] = document.createElement("tr");
		this.td.id[n] = document.createElement("td");
		this.td.note[n] = document.createElement("td");
		this.td.creation[n] = document.createElement("td");
		this.td.creation[n].style.fontSize = "10px";
		this.td.modification[n] = document.createElement("td");
		this.td.modification[n].style.fontSize = "11px";
		this.td.id[n].innerHTML = n;
		this.td.note[n].innerHTML = this.notes[n].note;
		this.td.creation[n].innerHTML = this.notes[n].c;
		this.td.modification[n].innerHTML = this.notes[n].m || '<i>original</i>';
		if(this.notes[n].complete){
			this.note_row[n].style.textDecoration = "line-through";
		}
		this.note_row[n].appendChild(this.td.id[n]);
		this.note_row[n].appendChild(this.td.note[n]);
		this.note_row[n].appendChild(this.td.creation[n]);
		this.note_row[n].appendChild(this.td.modification[n]);
		this.note_row[n].style.opacity = 0.7;
		this.notesTable.appendChild(this.note_row[n]);
	}
	this.activate(this.active_note);
	this.main.focus();
};

Notebook.prototype.activate = function(id){
	for(let n = 0; n < this.notes.length; n++){
		if(n == id){
			this.note_row[n].style.opacity = 1;
			this.note_row[n].style.color = this.highlight;
		}else{
			this.note_row[n].style.opacity = 0.7;
			this.note_row[n].style.color = this.color;
		}
	}
	this.active_note = id;
};

Notebook.prototype.complete = function(){
	this.notes[this.active_note].complete = true;
	this.save();
	this.load();
	this.draw();
};

Notebook.prototype.incomplete = function(){
	this.notes[this.active_note].complete = false;
	this.save();
	this.load();
	this.draw();
};

Notebook.prototype.toggle_complete = function(){
	this.notes[this.active_note].complete = !this.notes[this.active_note].complete;
	this.save();
	this.load();
	this.draw();
};

Notebook.prototype.activate_next = function(){
	let n = this.active_note + 1;
	n = n >= this.notes.length ? this.notes.length-1 : n;
	this.activate(n);
};

Notebook.prototype.activate_previous = function(){
	let n = this.active_note - 1;
	n = n < 0 ? 0 : n;
	this.activate(n);
};

Notebook.prototype.edit = function(){
	//TODO: sanity check that note with this.active_note ID exists, etc.
	const note_input = document.createElement("input");
	note_input.setAttribute("type","text");
	note_input.style = "background: transparent; width: 100%; margin: 0; padding: 0; color: inherit;";
	note_input.setAttribute("value", this.notes[this.active_note].note);
	this.td.note[this.active_note].innerHTML = "";
	this.td.note[this.active_note].appendChild(note_input);
	note_input.focus();
	this.editing = true;
};

Notebook.prototype.save_edit = function(){
	const note = this.td.note[this.active_note].children[0].value;
	this.notes[this.active_note].note = note;
	this.notes[this.active_note].m = Date();
	this.save(); // could call this.load() now to make sure it's showing up-to-date, in case save failed. //TODO: think about this.
	this.draw();
	//this.td.note[this.active_note].innerHTML = note;
	//this.td.modification[this.active_note].innerHTML = this.notes[this.active_note].m;
	this.editing = false;
};

Notebook.prototype.cancel_edit = function(){
	this.td.note[this.active_note].innerHTML = this.notes[this.active_note].note;
	this.editing = false;
	this.main.focus();
};

Notebook.prototype.delete_note = function(){
	this.backup.push(this.notes.splice(this.active_note,1));
	this.oldPositions.push(this.active_note);
	this.save();
	this.draw();
};

Notebook.prototype.undo = function(){
	if(this.backup.length > 0){
		const note = this.backup.pop();
		const where = this.oldPositions.pop();
		this.notes.splice(where, 0, note[0]); // put it back in the right place
		this.save();
		this.load(); // I want to be sure it's gone back in the right place and saved
		this.draw();
	}
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
