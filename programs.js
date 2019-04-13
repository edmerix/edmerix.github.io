/*-----------------------------------------------------------------------------*\
| PROGRAMS: programs are sub-functions of the terminal, which hijack			|
| 			the command prompt and have their own commands.						|
| 			All programs in programs.js are auto-loaded at terminal start-up.	|
\*-----------------------------------------------------------------------------*/

const programs = {};

/*---- DB ----*/
programs.db = {};
programs.db.protected = {};
programs.db.protected.fallback = function(cmd,fn,args,trmnl){
	return [1, "Unknown DB command: "+fn];
}
programs.db.exit = function(args,trmnl){
	trmnl.program = "base";
	trmnl.next_prompt = trmnl.base_prompt;
	return 0;
}
programs.db.help = function(args,trmnl){
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

/*---- MATH ----*/
programs.math = {};
programs.math.protected = {}; // used to write the fallback function, without adding it to the user accessible commands
programs.math.protected.fallback = function(cmd,fn,args,trmnl){
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
programs.math.exit = function(args,trmnl){
	trmnl.program = "base";
	trmnl.next_prompt = trmnl.base_prompt;
	return 0;
}
programs.math.help = function(args,trmnl){
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
/*---- SCIENCE ----*/
programs.science = {};
programs.science.protected = {};
programs.science.protected.fallback = function(cmd,fn,args,trmnl){
	return [1, "Unknown command for the SCIENCE section: "+fn];
}
programs.science.exit = function(args,trmnl){
	trmnl.program = "base";
	trmnl.next_prompt = trmnl.base_prompt;
	return 0;
}
programs.science.projects = function(args,trml){
	var blurb = "<b>Currently under-way projects</b>:<br />";
	blurb += "<div class='cmd-feedback inset'>The role of interneurons at seizure onset</div>";
	blurb += "<ul class='inset'><li>Inhibitory interneurons have been insinuated in ictal propagation - we're showing that's like suggesting fire-fighters cause fires.</li></ul>";
	blurb += "<div class='cmd-feedback inset'>The effect of seizures on individual neurons</div>";
	blurb += "<ul class='inset'>";
	blurb += "<li>We previously showed that spike sorting fails when the cortical tissue is recruited to the actual seizure (<a href='https://doi.org/10.1093/brain/awv208' target='_blank'>article</a>)</li>";
	blurb += "<li>We are now delving into what's actually happening to the neurons intracellularly, and what that means for seizure propagation</li>";
	blurb += "</ul>";
	blurb += "<div class='cmd-feedback inset'>Neural substrates of consciousness - recovery of awareness in the post-ictal state</div>";
	blurb += "<ul class='inset'>";
	blurb += "<li>Patients continue to show symptoms after a seizure has passed, but the post-ictal period is little-studied</li>";
	blurb += "<li>Analyses of neuronal firing during this period highlight a unique state of cortical processing, and a window into awareness</li>";
	blurb += "</ul>";
	blurb += "<div class='cmd-feedback inset'>Tracking of neuron identities over days to weeks</div>";
	blurb += "<ul class='inset'>";
	blurb += "<li>I've developed algorithms to track individual cells over many days in humans, showing neurons can be followed despite alterations to wave shape</li>";
	blurb += "<li>Importantly, cognition research in humans frequently reports the activity of single units as separate neurons across sessions</li>";
	blurb += "<li>This over-represents the stereotypy of neuronal responses to stimuli, but doesn't do justice to the stability of individual cell's responses</li>";
	blurb += "</ul>";
	return [0, blurb];
}
programs.science.help = function(args,trmnl){
	var avail_commands = 'Commands in the SCIENCE section (this is a proof-of-concept, so there aren\'t many):<hr /><span class="cmd-feedback"><table><tr>';
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