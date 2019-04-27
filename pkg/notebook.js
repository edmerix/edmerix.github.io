var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.notebook = function(args,trmnl){
	trmnl.program = "notebook";
	trmnl.next_prompt = 'NOTEBOOK>';
	return 0;
};
pkgs.notebook.help = "<b>notebook</b> program: use to navigate your locally stored @{notes}.";

/*****
The window override bit: (use this to write functions that divert to a separate prompt window within the terminal)
*****/
// haven't actually done anything with this one yet. Notes have been implemented though.
var baseWindow = baseWindow || {};

baseWindow.notebook = {};
baseWindow.notebook.protected = {};
baseWindow.notebook.protected.fallback = function(cmd,fn,args,trmnl){
	return [1, "Unknown NOTEBOOK command: "+fn];
}
baseWindow.notebook.exit = function(args,trmnl){
	trmnl.program = "base";
	trmnl.next_prompt = trmnl.base_prompt;
	return 0;
}
baseWindow.notebook.help = function(args,trmnl){
	var avail_commands = 'Available NOTEBOOK commands:<hr /><span class="cmd-feedback"><table><tr>';
	if(trmnl.notebook.hasOwnProperty('autocomplete')){ // make use of the autocomplete data if populated
		for(var c = 0; c < trmnl.notebook.autocomplete.length; c++){
			avail_commands += '<td>'+trmnl.notebook.autocomplete[c]+'</td>';
			if((c+1)%6 == 0 && c != 1) avail_commands += '</tr><tr>';
		}
	}else{
		var c = 0;
		for(key in trmnl.notebook){
			if(typeof(trmnl.notebook[key]) == 'function'){
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
