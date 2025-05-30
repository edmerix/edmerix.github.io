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
	//These should probably go in their own html files. But seems unnecessary to make extra asynchronous calls to fetch data.
	let blurb = "<b>Currently under-way projects</b>:<br />";
	blurb += "<div class='cmd-feedback inset'>The role of interneurons at seizure onset</div>";
	blurb += "<ul class='inset'>";
		blurb += "<li>Inhibitory interneurons have been insinuated in ictal propagation - we're showing that's like suggesting fire-fighters cause fires.</li>";
		blurb += "<li>We're examining the exact role of fast-spiking interneurons after the seizure starts, but prior to its local arrival, and how this relates to brain structure</li>";
	        blurb += "<li>![Update!]: Pre-print from this project is now available on <a target=\"blank\" href=\"https://doi.org/10.1101/2024.01.26.24301821\">medRχiv</a> and is currently under review!</li>";
	blurb += "</ul>";
	blurb += "<div class='cmd-feedback inset'>The effect of seizures on individual neurons</div>";
	blurb += "<ul class='inset'>";
		blurb += "<li>We previously showed that spike sorting fails when the cortical tissue is recruited to the actual seizure (<a href='https://doi.org/10.1093/brain/awv208' target='_blank'>article</a>)</li>";
		blurb += "<li>We are now delving into what's actually happening to the neurons intracellularly, and what that means for seizure propagation</li>";
		blurb += "<li>![Update!]: This project is now published at <a target=\"blank\" href=\"https://doi.org/10.1523/JNEUROSCI.0417-20.2020\">JNeurosci</a>!</li>";
	blurb += "</ul>";
	blurb += "<div class='cmd-feedback inset'>Neural substrates of consciousness - recovery of awareness in the post-ictal state</div>";
	blurb += "<ul class='inset'>";
		blurb += "<li>Patients continue to show symptoms after a seizure has passed, but the post-ictal period is little-studied</li>";
		blurb += "<li>Analyses of neuronal firing during this period highlight a unique state of cortical processing, and a window into awareness</li>";
	blurb += "</ul>";
	blurb += "<div class='cmd-feedback inset'>Markers of ictal recruitment in non-invasive recordings</div>";
	blurb += "<ul class='inset'>";
		blurb += "<li>Invasive recordings using microelectrodes are necessarily rare, but allow us to translate findings to more accessible recording methods</li>";
		blurb += "<li>We're investigating how specific markers of brain being recruited to a seizure can be picked up with standard ECoG electrodes, using ≤ 250 Hz signals</li>";
		blurb += "<li>![Update!]: This project is now published at <a target=\"blank\" href=\"https://doi.org/10.1093/brain/awad262\">Brain</a>!</li>";
	blurb += "</ul>";
	blurb += "<div class='cmd-feedback inset'>Tracking of neuron identities over days to weeks</div>";
	blurb += "<ul class='inset'>";
		blurb += "<li>We've developed algorithms to track individual cells over many days in humans, showing neurons can be followed despite alterations to wave shape</li>";
		blurb += "<li>Importantly, cognition research in humans frequently reports the activity of single units as separate neurons across sessions</li>";
		blurb += "<li>This over-represents the stereotypy of neuronal responses to stimuli, but doesn't do justice to the stability of individual cells' responses</li>";
	blurb += "</ul>";
	return [0, blurb];
}
programs.science.publications = function(args,trmnl){
	let papers = "<b>Book chapters <i>(peer-reviewed)</i>:</b>";
  papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1093/med/9780197549469.003.0016" target="_blank">Human Single-Neuron Recordings in Epilepsy</a></div>';
		papers += '<div class="cite-authors"><b>Edward M Merricks</b> and Catherine A Schevon</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2024) in <i> Jasper\'s Basic Mechanisms of the Epilepsies, 5th edn.</i></span>';
			papers += '<div class="cite-volume">eds.: Noebels, J.L., Avoli, M., Rogawski, M.A., Vezzani, A., Delgado-Escueta, A.V.</div>';
			papers += '<div class="cite-issue">Oxford University Press</div>';
		papers += '</div>';
	papers += '</div>';

	papers += "<b>Publications <i>(listing peer-reviewed only)</i>:</b>";
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://authors.elsevier.com/c/1kTSf3BtfH9Bip" target="_blank">Glioma-induced alterations in excitatory neurons are reversed by mTOR inhibition</a></div>';
		papers += '<div class="cite-authors">Alexander R Goldberg, Athanassios Dovas, Daniela Torres, Sohani Das Sharma, Angeliki Mela, <b>Edward M Merricks</b>, Markel Olabarria, Leila Abrishami Shokooh, Hanzhi T Zhao, Corina Kotidis, Peter Calvaresi, Ashwin Viswanathan, Matei A Banu, Aida Razavilar, Tejaswi D Sudhakar, Ankita Saxena, Cole Chokran, Nelson Humala, Aayushi Mahajan, Weihao Xu, Jordan B Metz, Cady Chen, Eric A Bushong, Daniela Boassa, Mark H Ellisman, Elizabeth MC Hillman, Guy M McKhann, Brian JA Gill, Steven S Rosenfeld, Catherine A Schevon, Jeffrey N Bruce, Peter A Sims, Darcy S Peterka, Peter Canoll</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2025) Neuron, </span>';
			papers += '<span class="cite-volume"><i>in press</i> </span>';
			papers += '<span class="cite-issue"><a href="https://doi.org/10.1016/j.neuron.2024.12.026">10.1016/j.neuron.2024.12.026</a></span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://authors.elsevier.com/c/1kHhy6T90~igx" target="_blank">A selective small-molecule agonist of G protein-gated inwardly-rectifying potassium channels reduces epileptiform activity in mouse models of tumor-associated and provoked seizures</a></div>';
		papers += '<div class="cite-authors">Robert A Rifkin, Xiaoping Wu, Brianna Pereira, Brian JA Gill, <b>Edward M Merricks</b>, Andrew J Michalak, Alexander R Goldberg, Nelson Humala, Athanassios Dovas, Ganesha Rai, Guy M McKhann, Paul A Slesinger, Peter Canoll, Catherine Schevon</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2025) Neuropharmacology, </span>';
			papers += '<span class="cite-volume">265 </span>';
			papers += '<span class="cite-issue">110259</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1093/brain/awad262" target="_blank">Cell-type specific and multiscale dynamics of human focal seizures in limbic structures</a></div>';
		papers += '<div class="cite-authors">Alexander H Agopyan-Miu<sup>*</sup>, <b>Edward M Merricks</b><sup>*</sup>, Elliot H Smith, Guy M McKhann, Sameer A Sheth, Neil A Feldstein, Andrew J Trevelyan, Catherine A Schevon</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2023) Brain, </span>';
			papers += '<span class="cite-volume">146 </span>';
			papers += '<span class="cite-issue">(12) 5209-5223</span><div><sup>*</sup> = co-first authors</div>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1038/s42003-023-04696-3" target="_blank">Spatiotemporal spike-centered averaging reveals symmetry of temporal and spatial components of the spike-LFP relationship during human focal seizures</a></div>';
		papers += '<div class="cite-authors">Somin Lee, Sarita S Deshpande, <b>Edward M Merricks</b>, Emily Schlafly, Robert Goodman, Guy M McKhann, Emad N Eskandar, Joseph R Madsen, Sydney S Cash, Michel JAM van Putten, Catherine A Schevon, Wim van Drongelen</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2023) Communications Biology, </span>';
			papers += '<span class="cite-volume">6 </span>';
			papers += '<span class="cite-issue">(1) 317</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1093/brain/awac291" target="_blank">Distinct signatures of loss of consciousness in focal impaired awareness versus tonic-clonic seizures</a></div>';
		papers += '<div class="cite-authors">Elsa Juan, Urszula Górska, Csaba Kozma, Cynthia Papantonatos, Tom Bugnon, Colin Denis, Vaclav Kremen, Greg Worrell, Aaron F Struck, Lisa M Bateman, <b>Edward M Merricks</b>, Hal Blumenfeld, Giulio Tononi, Catherine Schevon, Melanie Boly</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2023) Brain, </span>';
			papers += '<span class="cite-volume">146 </span>';
			papers += '<span class="cite-issue">(1) 109–123</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1093/brain/awac168" target="_blank">Single unit analysis and wide-field imaging reveal alterations in excitatory and inhibitory neurons in glioma</a></div>';
		papers += '<div class="cite-authors">Brian JA Gill<sup>*</sup>, Farhan A Khan<sup>*</sup>, Alexander R Goldberg<sup>*</sup>, <b>Edward M Merricks</b><sup>*</sup>, Xiaoping Wu, Alexander A Sosunov, Tejaswi D Sudhakar, Athanassios Dovas, Wudu Lado, Andrew J Michalak, Jia Jie Teoh, Jyun-you Liou, Wayne N Frankel, Guy M McKhann, Peter Canoll, Catherine A Schevon</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2022) Brain, </span>';
			papers += '<span class="cite-volume">145 </span>';
			papers += '<span class="cite-issue">(10) 3666–3680</span><div><sup>*</sup> = co-first authors</div>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1523/JNEUROSCI.0338-22.2022" target="_blank">Multiple sources of fast traveling waves during human seizures: resolving a controversy</a></div>';
		papers += '<div class="cite-authors">Emily D Schlafly, François A Marshall, <b>Edward M Merricks</b>, Uri T Eden, Sydney S Cash, Catherine A Schevon, Mark A Kramer</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2022) Journal of Neuroscience, </span>';
			papers += '<span class="cite-volume">42 </span>';
			papers += '<span class="cite-issue">(36) 6966–6982</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1038/s41562-021-01261-y" target="_blank">Multiscale temporal integration organizes hierarchical computation in human auditory cortex</a></div>';
		papers += '<div class="cite-authors">Sam V Norman-Haignere, Laura K Long, Orrin Devinsky, Werner Doyle, Ifeoma Irobunda, <b>Edward M Merricks</b>, Neil A Feldstein, Guy M McKhann, Catherine A Schevon, Adeen Flinker, Nima Mesgarani</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2022) Nature Human Behaviour, </span>';
			papers += '<span class="cite-volume">6 </span>';
			papers += '<span class="cite-issue">(3) 455–469</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.7554/eLife.73541" target="_blank">Human interictal epileptiform discharges are bidirectional traveling waves echoing ictal discharges</a></div>';
		papers += '<div class="cite-authors">Elliot H Smith, Jyun-you Liou, <b>Edward M Merricks</b>, Tyler Davis, Kyle Thomson, Bradley Greger, Paul House, Ronald G Emerson, Robert Goodman, Guy M McKhann, Sameer Sheth, Catherine Schevon, John D Rolston</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2022) eLife, </span>';
			papers += '<span class="cite-volume">11 </span>';
			papers += '<span class="cite-issue">e73541</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1523/JNEUROSCI.0417-20.2020" target="_blank">Neuronal firing and waveform alterations through ictal recruitment in humans</a></div>';
		papers += '<div class="cite-authors"><b>Edward M Merricks</b>, Elliot H Smith, Ronald G Emerson, Lisa M Bateman, Guy M McKhann, Robert R Goodman, Sameer A Sheth, Bradley Greger, Paul A House, Andrew J Trevelyan, Catherine A Schevon</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2021) Journal of Neuroscience, </span>';
			papers += '<span class="cite-volume">41 </span>';
			papers += '<span class="cite-issue">(4) 766-779</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1038/s41598-020-76138-7" target="_blank">Dual mechanisms of ictal high frequency oscillations in rhythmic onset seizures</a></div>';
		papers += '<div class="cite-authors">Elliot H Smith, <b>Edward M Merricks</b>, Jyun-You Liou, Camilla Casadei, Lucia Melloni, Daniel Friedman, Werner Doyle, Robert Goodman, Ronald Emerson, Guy McKhann, Sameer Sheth, John Rolston, Catherine Schevon</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2020) Scientific Reports, </span>';
			papers += '<span class="cite-volume">10 </span>';
			papers += '<span class="cite-issue">(1) 1-14</span>';
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
			papers += '<span class="cite-journal">(2016) Nature Communications, </span>';
			papers += '<span class="cite-volume">7 </span>';
			papers += '<span class="cite-issue">11098</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://doi.org/10.1093/brain/awv208" target="_blank">Single unit action potentials in humans and the effect of seizure activity</a></div>';
		papers += '<div class="cite-authors"><b>Edward M Merricks</b>, Elliot H Smith, Guy M McKhann, Robert R Goodman, Lisa M Bateman, Ronald G Emerson, Catherine A Schevon, Andrew J Trevelyan</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2015) Brain, </span>';
			papers += '<span class="cite-volume">138 </span>';
			papers += '<span class="cite-issue">(10) 2891-2906</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="https://journals.lww.com/clinicalneurophys/fulltext/2015/06000/The_Role_of_Inhibition_in_Epileptic_Networks.6.aspx" target="_blank">The role of inhibition in epileptic networks</a></div>';
		papers += '<div class="cite-authors">Andrew J Trevelyan, Sarah F Muldoon, <b>Edward M Merricks</b>, Claudia Racca, Kevin J Staley</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2015) Journal of Clinical Neurophysiology, </span>';
			papers += '<span class="cite-volume">32 </span>';
			papers += '<span class="cite-issue">(3) 227-234</span>';
		papers += '</div>';
	papers += '</div>';
	papers += '<div class="citation">';
		papers += '<div class="cite-title"><a href="http://www.jneurosci.org/content/35/20/7715.short" target="_blank">The contribution of raised intraneuronal chloride to epileptic network activity</a></div>';
		papers += '<div class="cite-authors">Hannah Alfonsa, <b>Edward M Merricks</b>, Neela K Codadu, Mark O Cunningham, Karl Deisseroth, Claudia Racca, Andrew J Trevelyan</div>';
		papers += '<div class="cite-metadata">';
			papers += '<span class="cite-journal">(2015) Journal of Neuroscience, </span>';
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
