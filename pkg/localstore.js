//TODO: maybe rename this var?
var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.localstore = function(args,trmnl){
	//e.g. localStorage.setItem('bgcolor', terminal.cols.bg);
	trmnl.output("<b>localstore has been superseded, use @{var} instead in future</b>");
	if(args[0] == undefined || args[0] == ""){
		return trmnl.base.workspace(args,trmnl);
	}else{
		return trmnl.base.var(args,trmnl); // just wrap back to it for now.
	}
    return 0;
};
pkgs.localstore.help = "<b>localstore</b> command: store pervasive variables in localStorage (machine-specific).\n\
Syntax requires no spaces if using whitespace-based input e.g. @{localstore foo=bar} or @{localstore(foo = bar)}\n\
<b>Superseded by @{var} keyword and @{echo}/@{workspace}/@{clear} functions</b>";
