var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.session = function(args,trmnl){
	instances++;
	if(instances >= 4){
		return [0, "Session is currently limited to just 4 instances"]
	}
	[args,flags] = trmnl.parse_flags(args);

	var avail = 0;
	while(typeof(terminal[avail]) == "object" && avail < 4){
		avail++;
	}

	terminal[avail] = new Terminal(avail,"$>","main-input_"+avail,"cmd-history_"+avail,"cmd-prompt_"+avail,"term_"+avail,"themes.json");

	update_positions();
	if(flags.indexOf('&') < 0 && flags.indexOf('noswap') < 0){
		terminal[avail].input_div.focus();
	}else{
		trmnl.input_div.focus();
		//setTimeout(function(){trmnl.input_div.focus();},100); // just to make sure
	}
	// append the new divs to body, and assign them to a new Terminal object.
	return [0, "New terminal instance created (terminal:"+terminal[avail].ID+")"];
};
pkgs.session.help = "<b>@{session}</b> command opens a new terminal session/window in parallel<br /><small>In most situations, alt+tab cycles through open sessions<br />Use --noswap or -& flag to keep focus on current terminal rather than new one</small>";
