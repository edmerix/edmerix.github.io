var pkgs = pkgs || {}; // this is just in case we overwrite something, but this shouldn't ever be an issue.
pkgs.chuck = function(args,trmnl){
	// we need to go async now.
	trmnl.input_div.html("").hide();
	$.ajax({
		url: "http://api.icndb.com/jokes/random",
		dataType: "json",
		success: function(res){
			try{ // always check if terminal.piping == true in async callbacks!
				if(trmnl.piping){
					res.value.joke = res.value.joke.replace(/,/g,'&comma;');
					trmnl.parse_command(trmnl.pipe_function+"("+res.value.joke+")",0);
				}else{
					trmnl.output(res.value.joke,0);
				}
			}catch(err){
				console.log(err.message);
				trmnl.error("Could not parse received data");
			}
			trmnl.input_div.show();
		},
		error: function(err){
			trmnl.error("Could not load data");
			trmnl.input_div.show();
		}
	});
	return 0;
};
pkgs.chuck.help = "... <i>just type it and find out.</i>";