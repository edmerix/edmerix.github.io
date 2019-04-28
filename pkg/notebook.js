var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.notebook = function(args,trmnl){
	return [0, "Yet to code"];
};
pkgs.notebook.help = "<b>notebook</b> program: use to navigate your locally stored @{notes}.";

// Changed my mind about how this will work. Gonna make it a navigable "app" a la TEdit rather than a "non-base program"
