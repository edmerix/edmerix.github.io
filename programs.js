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
	var avail_commands = 'Math evaluates your mathematical inputs. Beyond that, available math commands are:<hr /><span class="cmd-feedback"><table><tr>';
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
programs.science.erdos = function(args,trmnl){
	let silly = `The <a href="https://en.wikipedia.org/wiki/Erd&odblac;s_number" target="_blank">![Erd&odblac;s number]</a> is the number of co-authors separating a scientist and epic mathematician Paul Erd&odblac;s
	<small><i>(It's the inspiration for <a href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon" target="_blank">Six Degrees of Kevin Bacon</a>)</i></small>

	Ed's <i>Erd&odblac;s number</i> is ![3]: (using earliest publications between co-authors)`;
	silly += '<ol class="inset">\
		<li><b>![Paul Erd&odblac;s]</b> and <b>Boris Aranov</b> published together in <i>Combinatorica</i> in <a href="https://doi.org/10.1007/BF01215345" target="_blank">1994</a></li>\
		<li><b>Boris Aranov</b> and <b>Catherine A. Schevon</b> published together in <i>SIAM Journal on Computing</i> in <a href="https://doi.org/10.1137/S0097539793253371" target="_blank">1997</a></li>\
		<li><b>Catherine A. Schevon</b> and <b>![Edward M. Merricks]</b> published together in <i>Brain</i> in <a href="https://doi.org/10.1093/brain/awv208" target="_blank">2015</a></li>\
	</ol>';
	silly += `\nThis scrapes him into the top 15.2% of people with Erd&odblac;s numbers according to <a href="https://oakland.edu/enp/trivia/" target="_blank">Oakland University</a>...
	@__Similarly, his "<i>Einstein number</i>" is ![5], following the same route a little further:`;
	silly += '<ol class="inset">\
		<li><b>![Albert Einstein]</b> and <b>Ernst Gabor Straus</b> published together in <i>Rev. Mod. Phys.</i> in <a href="https://doi.org/10.1103/RevModPhys.17.120" target="_blank">1945</a></li>\
		<li><b>Ernst Gabor Straus</b> and <b>Paul Erd&odblac;s</b> published together in <i>Discrete Math.</i> in <a href="https://doi.org/10.1016/0012-365X(82)90187-X" target="_blank">1982</a></li>\
		<li><b>Paul Erd&odblac;s</b> and <b>Boris Aranov</b> published together in <i>Combinatorica</i> in <a href="https://doi.org/10.1007/BF01215345" target="_blank">1994</a></li>\
		<li><b>Boris Aranov</b> and <b>Catherine A. Schevon</b> published together in <i>SIAM Journal on Computing</i> in <a href="https://doi.org/10.1137/S0097539793253371" target="_blank">1997</a></li>\
		<li><b>Catherine A. Schevon</b> and <b>![Edward M. Merricks]</b> published together in <i>Brain</i> in <a href="https://doi.org/10.1093/brain/awv208" target="_blank">2015</a></li>\
	</ol>';

	silly += `\n<b>Overall, it doesn't really mean anything, but here we are.</b>`;
	return [0, silly];
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
	blurb += "<li>![Update!]: This project is now available as a <a target=\"blank\" href=\"https://www.biorxiv.org/content/10.1101/2020.01.11.902817v2\">pre-print on biorxiv</a></li>";
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
programs.science.papers = function(args,trmnl){
	let papers = "<b>Publications:</b>";
	papers += '<div class="citation">';
	papers += '<div class="cite-title"><a href="https://www.medrxiv.org/content/10.1101/2020.01.09.20017053v1.abstract" target="_blank">Dual mechanisms of ictal high frequency oscillations in rhythmic onset seizures</a></div>';
	papers += '<div class="cite-authors">Elliot H Smith, <b>Edward Merricks</b>, Jyun-You Liou, Camilla Casadei, Lucia Melloni, Daniel Friedman, Werner Doyle, Robert Goodman, Ronald Emerson, Guy McKhann, Sameer Sheth, John Rolston, Catherine Schevon</div>';
	papers += '<div class="cite-metadata">';
	papers += '<span class="cite-journal">(2020) medrxiv, </span>';
	papers += '<span class="cite-volume">pre-print </span>';
	papers += '<span class="cite-issue"><a target="_blank" href="https://doi.org/10.1101/2020.01.09.20017053">doi.org/10.1101/2020.01.09.20017053</a></span>';
	papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
	papers += '<div class="cite-title"><a href="https://www.biorxiv.org/content/10.1101/2020.01.11.902817v1.abstract" target="_blank">Neuronal firing and waveform alterations through ictal recruitment in humans</a></div>';
	papers += '<div class="cite-authors"><b>Edward M Merricks</b>, Elliot H Smith, Ronald G Emerson, Lisa M Bateman, Guy M McKhann, Robert R Goodman, Sameer A Sheth, Bradley Greger, Paul A House, Andrew J Trevelyan, Catherine A Schevon</div>';
	papers += '<div class="cite-metadata">';
	papers += '<span class="cite-journal">(2020) biorxiv, </span>';
	papers += '<span class="cite-volume">pre-print </span>';
	papers += '<span class="cite-issue"><a target="_blank" href="https://doi.org/10.1101/2020.01.11.902817">doi.org/10.1101/2020.01.11.902817</a></span>';
	papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
	papers += '<div class="cite-title"><a href="https://www.physiology.org/doi/abs/10.1152/jn.00392.2019" target="_blank">Role of paroxysmal depolarization in focal seizure activity</a></div>';
	papers += '<div class="cite-authors">Andrew K Tryba<sup>*</sup>, <b>Edward M Merricks</b><sup>*</sup>, Somin Lee, Tuan Pham, SungJun Cho, Douglas R Nordli Jr, Tahra L Eissa, Robert R Goodman, Guy M McKhann Jr, Ronald G Emerson, Catherine A Schevon, Wim van Drongelen</div>';
	papers += '<div class="cite-metadata">';
	papers += '<span class="cite-journal">(2019) Journal of Neurophysiology, </span>';
	papers += '<span class="cite-volume">122 </span>';
	papers += '<span class="cite-issue">(5) 1861-1873</span><div><sup>*</sup> = co-first authors</div>';
	papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
	papers += '<div class="cite-title"><a href="https://www.sciencedirect.com/science/article/pii/S0969996119300038" target="_blank">Multiscale recordings reveal the dynamic spatial structure of human seizures</a></div>';
	papers += '<div class="cite-authors">Catherine A Schevon, Steven Tobochnik, Tahra Eissa, <b>Edward Merricks</b>, Brian Gill, R Ryley Parrish, Lisa M Bateman, Guy McKhann, Ronald G Emerson, Andrew J Trevelyan</div>';
	papers += '<div class="cite-metadata">';
	papers += '<span class="cite-journal">(2019) Neurobiology of Disease, </span>';
	papers += '<span class="cite-volume">127 </span>';
	papers += '<span class="cite-issue">303-311</span>';
	papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
	papers += '<div class="cite-title"><a href="https://www.nature.com/articles/ncomms11098/" target="_blank">The ictal wavefront is the spatiotemporal source of discharges during spontaneous human seizures</a></div>';
	papers += '<div class="cite-authors">Elliot H Smith, Jyun-you Liou, Tyler S Davis, <b>Edward M Merricks</b>, Spencer S Kellis, Shennan A Weiss, Bradley Greger, Paul A House, Guy M McKhann II, Robert R Goodman, Ronald G Emerson, Lisa M Bateman, Andrew J Trevelyan, Catherine A Schevon</div>';
	papers += '<div class="cite-metadata">';
	papers += '<span class="cite-journal">(2016) Nature Communications </span>';
	papers += '<span class="cite-volume">7 </span>';
	papers += '<span class="cite-issue">11098</span>';
	papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
	papers += '<div class="cite-title"><a href="https://doi.org/10.1093/brain/awv208" target="_blank">Single unit action potentials in humans and the effect of seizure activity</a></div>';
	papers += '<div class="cite-authors"><b>Edward M Merricks</b>, Elliot H Smith, Guy M McKhann, Robert R Goodman, Lisa M Bateman, Ronald G Emerson, Catherine A Schevon, Andrew J Trevelyan</div>';
	papers += '<div class="cite-metadata">';
	papers += '<span class="cite-journal">(2015) Brain </span>';
	papers += '<span class="cite-volume">138 </span>';
	papers += '<span class="cite-issue">(10) 2891-2906</span>';
	papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
	papers += '<div class="cite-title"><a href="https://journals.lww.com/clinicalneurophys/fulltext/2015/06000/The_Role_of_Inhibition_in_Epileptic_Networks.6.aspx" target="_blank">The role of inhibition in epileptic networks</a></div>';
	papers += '<div class="cite-authors">Andrew J Trevelyan, Sarah F Muldoon, <b>Edward M Merricks</b>, Claudia Racca, Kevin J Staley</div>';
	papers += '<div class="cite-metadata">';
	papers += '<span class="cite-journal">(2015) Journal of Clinical Neurophysiology </span>';
	papers += '<span class="cite-volume">32 </span>';
	papers += '<span class="cite-issue">(3) 227-234</span>';
	papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
	papers += '<div class="cite-title"><a href="http://www.jneurosci.org/content/35/20/7715.short" target="_blank">The contribution of raised intraneuronal chloride to epileptic network activity</a></div>';
	papers += '<div class="cite-authors">Hannah Alfonsa, <b>Edward M Merricks</b>, Neela K Codadu, Mark O Cunningham, Karl Deisseroth, Claudia Racca, Andrew J Trevelyan</div>';
	papers += '<div class="cite-metadata">';
	papers += '<span class="cite-journal">(2015) Journal of Neuroscience </span>';
	papers += '<span class="cite-volume">35 </span>';
	papers += '<span class="cite-issue">(20) 7715-7726</span>';
	papers += '</div>';
	papers += '</div>';
	return [0, papers];
};
programs.science.help = function(args,trmnl){
	var avail_commands = 'Commands in the SCIENCE section (this is a proof-of-concept, so there aren\'t many):<hr /><span class="cmd-feedback"><table><tr>';
	if(trmnl.science.hasOwnProperty('autocomplete')){
		// make use of the autocomplete data if it has been populated
		for(var c = 0; c < trmnl.science.autocomplete.length; c++){
			avail_commands += '<td>@{'+trmnl.science.autocomplete[c]+'}</td>';
			if((c+1)%6 == 0 && c != 1) avail_commands += '</tr><tr>';
		}
	}else{
		var c = 0;
		for(key in trmnl.science){
			if(typeof(trmnl.science[key]) == 'function'){
				avail_commands += '<td>@{'+key+'}</td>';
				c++;
				if(c%6 == 0 && c != 1) avail_commands += '</tr><tr>';
				//avail_commands += '&nbsp;&nbsp;'+key+'<br />';
			}
		}
	}
	avail_commands += '</tr></table>'; // will double up the </tr> if total commands is divisible by 5. Fix.
	return [0, avail_commands];
}
