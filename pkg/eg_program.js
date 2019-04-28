var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.eg_program = function(args,trmnl){
	trmnl.program = "eg_program";
	trmnl.next_prompt = 'EXAMPLE>';
	return 0;
};
pkgs.eg_program.help = "<b>eg_program</b> program: barebones example of a non-base program for explanation purposes.";

/*****
The window override bit: (use this to write functions that divert to a separate prompt window within the terminal)
*****/
var baseWindow = baseWindow || {};

baseWindow.eg_program = {};
// Use protected for functionality that shouldn't be accessible by the user at the prompt.
baseWindow.eg_program.protected = {};
// FALLBACK function within protected must be supplied, it describes what to do
// when the user inputs something other than a defined command for your program
baseWindow.eg_program.protected.fallback = function(cmd,fn,args,trmnl){
	return [1, "Unknown EXAMPLE_PROGRAM command: "+fn];
};
// MUST exist in order to be able to return from your program:
baseWindow.eg_program.exit = function(args,trmnl){
	trmnl.program = "base";
	trmnl.next_prompt = trmnl.base_prompt;
	return 0;
};
baseWindow.eg_program.help = function(args,trmnl){
	var avail_commands = 'Available EXAMPLE_PROGRAM commands:<hr /><span class="cmd-feedback"><table><tr>';
	if(trmnl.eg_program.hasOwnProperty('autocomplete')){ // make use of the autocomplete data if populated
		for(var c = 0; c < trmnl.eg_program.autocomplete.length; c++){
			avail_commands += '<td>'+trmnl.eg_program.autocomplete[c]+'</td>';
			if((c+1)%6 == 0 && c != 1) avail_commands += '</tr><tr>';
		}
	}else{
		var c = 0;
		for(key in trmnl.eg_program){
			if(typeof(trmnl.eg_program[key]) == 'function'){
				avail_commands += '<td>'+key+'</td>';
				c++;
				if(c%6 == 0 && c != 1) avail_commands += '</tr><tr>';
			}
		}
	}
	avail_commands += '</tr></table>'; // will double up the </tr> if total commands is divisible by 5. Fix.
	return [0, avail_commands];
};
