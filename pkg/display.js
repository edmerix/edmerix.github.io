var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.display = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need a path to an image to display"]
	}
	var mw = 75,
		mh = 75,
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
	return [0, "<img src='"+args[0]+"' style='max-width: "+mw+"vw; max-height: "+mh+"vh; opacity: "+alpha+";' onError='this.remove();terminal["+trmnl.ID+"].error(\""+args[0]+" does not appear to be an image...\");'/>"];
};
pkgs.display.help = "<b>DISPLAY</b> command displays an image at the address specified as the first argument.<br />Optional following arguments are values for maximum width, height and the alpha (opacity) of the image:<br /><i>w</i>,<i>h</i>, and <i>a</i> respectively<br />e.g. to display an image at address \"test.png\" with maximum width of 50% the window, at 70% opacity, type:<br />display test.png 50w 0.7a";