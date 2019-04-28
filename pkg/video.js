var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.video = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need a path to a video to play"]
	}
	let mw = 100,
		mh = 100,
		alpha = 1;
	for(var a = 1; a < 4; a++){
		if(args[a] != undefined && args[a][args[a].length-1] == "h"){
			mh = parseFloat(args[a].slice(0,-1));
		}else if(args[a] != undefined && args[a][args[a].length-1]== "w"){
			mw = parseFloat(args[a].slice(0,-1));
		}else if(args[a] != undefined && args[a][args[a].length-1]== "a"){
			alpha = parseFloat(args[a].slice(0,-1));
		}
	}
	//TODO: Add error handler that removes videos when the promise is rejected.
	//		e.g. can use "onerror='this.remove();terminal["+trmnl.ID+"].error(\""+args[0]+"...\");'" for images
	//		but videos will need to wait until the promise is rejected or check manually for a 404 error.
	return [0, "<video controls style='max-width: "+mw+"vw; max-height: "+mh+"vh; opacity: "+alpha+";'><source src='"+args[0]+"' /></video>"];
};
pkgs.video.help = "<b>video</b> command plays a video at the address specified as the first argument.\n\
Optional following arguments are values for maximum width, height and the alpha (opacity) of the image:\n\
<i>w</i>,<i>h</i>, and <i>a</i> respectively\n\
e.g. to display a video at address \"test.mp4\" with maximum width of 50% the window, at 70% opacity, type:\n\
@{display test.mp4 50w 0.7a}";
