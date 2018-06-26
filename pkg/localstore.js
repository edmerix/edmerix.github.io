var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.localstore = function(args,trmnl){
	//e.g. localStorage.setItem('bgcolor', terminal.cols.bg);
	return [0, "Yet to code. (It's a dangerous thing to open up)"];
};
pkgs.localstore.help = "<b>LOCALSTORE</b> command: store data in the localStorage. !!UNSECURE, BE CAREFUL!!";