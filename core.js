/*-------------------------------------------------------------------------*\
| CORE: 	These are the core functions of the terminal.					|
| 			Functions in core.js are auto-loaded at each terminal start-up	|
\*-------------------------------------------------------------------------*/

/*************************************************************************/
/*** write in further functions alphabetically (this.base.function = ) ***/
/*************************************************************************/

// Note, though, that extra functions that aren't programs (see programs.js)
// can be added in their own files in ./pkg/ This allows them to be
// "installed" with the builtin install command, though they won't
// be available at "startup"

// Use @{functionName arguments} in outputs/help sections to auto-create
// clickable links to automatically run it in the current terminal

const core = {};

/*---- ARGLIST ----*/
core.arglist = function(args,trmnl){
	var flags;
	[args,flags] = trmnl.parse_flags(args);
	var arglist = "";
	for(var a in args){
		arglist += "["+a+"]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--> "+args[a]+"<br />";
	}
	for(var f in flags){
		arglist += "[flag_"+f+"]&nbsp;--> "+flags[f]+"<br />";
	}
	return [0,arglist];
};
core.arglist.help = '<b>@{arglist}</b> command: prints supplied arguments to screen<br/>Can be useful in piped functions or testing your argument parsing in other functions';
/*---- BG ----*/
core.bg = function(args,trmnl){
	if(args.length > 1) args = args[0];
	if(args == "") return [1, "Need a color to change background to"];
	if(args == "reset"){
		trmnl.cols.bg = '#000';
	}else{
		if(!/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(args[0])){
			return [1, args[0]+" is not a valid hexadecimal color"];
		}
		trmnl.cols.bg = args[0];
	}
	trmnl.update_colors();
	return 0;
};
core.bg.help = '<b>@{bg}</b> command: change the background color to a specified hexadecimal color code<br />Use @{bg reset} to return to default (not the default of current theme)';
/*---- BIORXIV ----*/
core.biorxiv = async function (args, trmnl) {
    // coding design: if no arguments, default to all categories on biorxiv, just today
    // optional arguments:
    //      from (date)
    //      to (date)
    //      journal (biorxiv, medrxiv, etc. Use as flags, and medrxiv will be its own command that just calls this with that flag)
    //      day, week (use as flags, i.e., --day or -d, --week or -w) (Note that --day/-d does not get processed since it defaults to that option)
    //      max (maximum number of articles to fetch/print to screen)
    //      category (see homepages for options, e.g., neuroscience is one for biorxiv, neurology is one for medrxiv)
    //      --verbose, -v (print lots of details for each article)
    //      --terse, -t (print minimal details for each article, e.g., just abbreviated title and first author)
    // everything other than from/to dates, number of results and the category is a flag, so we can automatically work out what argument is what
    // if two dates given, order them, if one then check for the day/week flags and then apply that amount before
    // if no flags, default to just one day
    // if there's a non-date non-finite (number) argument, assume it's a category.
    // If no category found (i.e., data.messages[0].category is 'all' instead of matching the argument), then alert the user and show full results
    // If there's a raw number argument then it's the max number of articles, which otherwise defaults to 10
    // If both verbose and terse flags are given, then give terse output but with unabbreviated title
    // Note that if there are >100 results (stored in data.messages[0].total) we can do another call and offset the cursor accordingly to get the rest
    // only do that if the user has set maxResults >100 and total is >100 though, and then concatenate the results before printing
    let maxResults = 10;
    let journal = 'biorxiv';
    let category = 'all';
    let verbose = false;
    let terse = false;
    let cursor = 0; // only used if the user requested >100 results and data.messages[0].total is also >100
    let dates = [];

    let flags = [];
    [args,flags] = trmnl.parse_flags(args);
    if (flags.indexOf('medrxiv') > -1 || flags.indexOf('m') > -1) {
        journal = 'medrxiv';
    }
    verbose = flags.indexOf('verbose') > -1 || flags.indexOf('v') > -1;
    terse = flags.indexOf('terse') > -1 || flags.indexOf('t') > -1;
    for (let a = 0; a < args.length; a++){
        if (args[a].indexOf('/') > -1 || args[a].indexOf('-') > -1) { // try to parse it as a date
            let dateAttempt = new Date(`${args[a]} 12:00:00`);
            if (dateAttempt == "Invalid Date"){
                trmnl.output(`Could not parse ${args[a]} as a date, using default instead`);
            }else{
                dates.push(dateAttempt);
            }
        }else if(isFinite(args[a])) { // parse it as the number of results requested
            maxResults = args[a];
        }else{ // not an obvious date or a number, try it as the category
            category = args[a];
        }
    }
    // check if dates.length is 2, if so, sort and use, otherwise check flags and sort it out
    if (dates.length == 0) {
        dates.push(new Date()); // use today
    }
    if (dates.length == 1) {
        const date = new Date(dates[0]); // avoid passing by reference
        if (flags.indexOf('week') > -1 || flags.indexOf('w') > -1) {
            dates.push(new Date(date.setDate(date.getDate() - 7)));
        }else{
            dates.push(new Date(date.setDate(date.getDate() - 1)));
        }
    }
    dates.sort((a,b)=>a.getTime() - b.getTime());
    const dateFrom = dates[0].toISOString().split('T')[0];
    const dateTo = dates[1].toISOString().split('T')[0];

    const url = `https://api.biorxiv.org/details/${journal}/${dateFrom}/${dateTo}/${cursor}?category=${category}`;
    trmnl.output(`Loading articles from <i>![${journal}]</i> between <i>${dateFrom}</i> and <i>${dateTo}</i>, filed under category "<i>${category}</i>"...`);
    try {
        const response = await trmnl.xhrPromise(url);
        const data = JSON.parse(response);
        if (data.collection.length < 1 || data.messages[0].status !== 'ok') {
            return [0, data.messages[0].status]; // TODO: maybe send this to the console and work out a different message to print to user, in case it's ever weird?
        }
        trmnl.linesep();
        if (data.messages[0].category !== category){
            trmnl.output(`Could not find ![${category}] category at ${journal}, defaulting to all`);
        }
        trmnl.output(`![${data.messages[0].total}] articles found, showing first ![${Math.min(data.messages[0].total,maxResults)}]:`);
        let printout = '';
        let title = '';
        let authors = [];
        let authorString = '';
        for (let a = 0; a < Math.min(maxResults, data.collection.length); a++) {
            title = data.collection[a].title;
            if (terse) {
                authors = data.collection[a].authors.split(';');
                if (authors.length <= 2){
                    authorString = authors.join(' & ');
                }else{
                    authorString = `${authors[0]} <i>et al.</i>`;
                }
                if (!verbose && title.length > 100) {
                    title = `${title.substring(0, 96)}...`;
                }
            }else{
                authorString = data.collection[a].authors;
            }
            printout = `<div class="citation"><div class="cite-title"><a target='_blank' href='https://doi.org/${data.collection[a].doi}'>${title}</a></div>`;
            printout += `<div class='cite-authors'>${authorString}</div>`;
            if (verbose && !terse) {
                printout += `<div class='cite-metadata'>${data.collection[a].abstract}</div>`;
            }
            printout += `</div>`;
            trmnl.output(printout);
        }
    } catch (err) {
        console.log(err.message);
        return [1, 'Error loading data over API, check the console'];
    }
    return 0;
};
core.biorxiv.help = `<b>@{biorxiv}</b> command: Check articles posted to the biorxiv or medrxiv preprint servers.
    With no arguments it will fetch details for articles posted in any category to biorxiv in the past day
    <i>![Optional inputs]</i>:
    <span class='inset'>1 to 2 dates: <i>dates to search between. If only providing one, it will check between that day and the one before</i></span>
    <span class='inset'>a category <i>one of the categories from the biorxiv (or medrxiv) server</i></span>
    <span class='inset'>the number of articles to print to the screen <i>(defaults to 10)</i></span>
    <i>![Optional flags]</i>:
    <span class='inset'>![--week] or ![-w]: <i>Search for the preceding week instead of one day</i></span>
    <span class='inset'>![--medrxiv] or ![-m]: <i>Search medrxiv instead of biorxiv</i></span>
    <span class='inset'>![--verbose] or ![-v]: <i>Print abstracts as well</i></span>
    <span class='inset'>![--terse] or ![-t]: <i>Abbreviate titles and author lists</i></span>
    If both verbose and terse flags are given, it will abbreviate author lists but not the titles, and not print abstracts
    Arguments and flags can be provided in any order.
    <i>![Examples]</i>:
    <span class='inset'>@{biorxiv -mtw 20} will show the first 20 articles under any category from the past week at medrxiv</span>
    <span class='inset'>@{biorxiv --terse 5 2025/01/14 2025/01/17} will search those 3 days in all categories on biorxiv, and show the first 5 in abbreviated form</span>
    <span class='inset'>@{biorxiv 2024-01-27 neurology --medrxiv -v} will search the "neurology" category at medrxiv for January 26th, 2024 and the day before, and show abstracts</span>
    <small>Provide the same date twice if only searching for that exact date rather than the 24 hours or week leading up to it</small>`;
/*---- BITCONV ----*/
core.bitconv = function(args,trmnl){
	if(args.length != 2){
		return [1, 'Requires exactly 2 arguments: a value with units, and the units to convert to'];
	}
	console.log('---BITCONV debugging:---');
	var val, amt, conv_amt, units_out, val_in;
	for(var a = 0; a < args.length; a++){
		val = parseFloat(args[a].match( /[+-]?\d+(\.\d+)?/g));
		console.log('val is '+val);
		if(isNaN(val)){
			// units to convert to
			console.log(args[a]+' is the units to convert to');
			units_out = args[a];
			conv_amt = 1;
			if(args[a].toLowerCase().indexOf('t') > -1){ // TODO rejig this, there's a much simpler/cleaner method!
				conv_amt = conv_amt / (1024 * 1024 * 1024 * 1024);
			}else if(args[a].toLowerCase().indexOf('g') > -1){
				conv_amt = conv_amt / (1024 * 1024 * 1024);
			}else if(args[a].toLowerCase().indexOf('m') > -1){
				conv_amt = conv_amt / (1024 * 1024);
			}else if(args[a].toLowerCase().indexOf('k') > -1){
				conv_amt = conv_amt / 1024;
			}
			if(args[a].indexOf('B') > -1) conv_amt /= 8; // bits to bytes if capital B present
			console.log('Interpretted multiplier for conversion is '+conv_amt);
		}else{
			// value
			console.log(args[a]+' is the value to convert');
			val_in = args[a];
			if(args[a].toLowerCase().indexOf('t') > -1){ // TODO as above (in rate section)
				val = val * 1024 * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('g') > -1){
				val = val * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('m') > -1){
				val = val * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('k') > -1){
				val = val * 1024;
			}
			if(args[a].indexOf('B') > -1) val *= 8; // bits to bytes if capital B present
			console.log('Interpretted value is '+val+' bits');
			amt = val;
		}
	}
	var converted = amt * conv_amt;
	return [0, val_in+' is '+converted+' '+units_out];
};
core.bitconv.help = '<b>@{bitconv}</b> command: convert between gigabytes, bits, megabits and kilobytes etc.'
/*---- CLEAR ----*/
core.clear = function(args,trmnl){
	//TODO: might be cool to add the creation/modification date to the variables (like note), which would be included in workspace command.
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need the name of at least one currently stored variable to clear from workspace.\n\
		Use @{workspace} to see current variables"];
	}
	let vars = JSON.parse(localStorage.getItem("vars"));
	if(vars == null){
		return [0, "No variables currently stored, so not clearing anything"];
	}
	let name, value, pop, output = "";
	for(let a = 0; a < args.length; a++){
		if(vars.hasOwnProperty(args[a])){
			delete vars[args[a]]; // eek.
			output += "Cleared <i>"+args[a]+"</i> variable\n";
		}else{
			output += "Not clearing <i>"+args[a]+"</i> variable because it didn't exist\n";
		}
	}
	localStorage.setItem("vars",JSON.stringify(vars));

	return [0, output];
};
core.clear.help = '<b>@{clear}</b> function is used to clear variables that were set with <i>var</i> keyword.\n\
e.g. @{clear foo} (won\'t do anything unless you\'ve set a variable called "foo")';
/*---- CLS ----*/
core.cls = function(args,trmnl){
	trmnl.output_div.innerHTML = "";
	return 0;
};
core.cls.help = 'Well, it clears the screen';
/*---- COLCONV ----*/
core.colconv = function(args,trmnl){
	var output = "", r, g, b, boom, hex, rgb, mat, coltype, parsed = false;
	for(var a in args){
		parsed = false;
		switch(args[a].charAt(0)){
			case "[":
				coltype = "mat";
				boom = args[a].split(",");
				if(boom.length != 3){
					output += "Could not parse "+args[a]+" as a [0:1, 0:1, 0:1] type color, skipping.";
					parsed = true;
				}else{
					r = Math.round(parseFloat(boom[0].replace("[","").replace("(","").trim())*255);
					g = Math.round(parseFloat(boom[1].trim())*255);
					b = Math.round(parseFloat(boom[2].replace("]","").replace(")","").trim())*255);
				}
				break;
			case "#":
				coltype = "hex";
				if(args[a].length == 4){
					r = parseInt(args[a].charAt(1).toString()+args[a].charAt(1).toString(),16);
					g = parseInt(args[a].charAt(2).toString()+args[a].charAt(2).toString(),16);
					b = parseInt(args[a].charAt(3).toString()+args[a].charAt(3).toString(),16);
				}else if(args[a].length == 7){
					r = parseInt(args[a].substr(1,2),16);
					g = parseInt(args[a].substr(3,2),16);
					b = parseInt(args[a].substr(5,2),16);
				}else{
					output += "Could not parse "+args[a]+" as a hexadecimal color, skipping.";
					parsed = true;
				}
				break;
			case "r":
				coltype = "rgb";
				boom = args[a].split(",");
				if(boom.length != 3){
					output += "Could not parse "+args[a]+" as an rgb() type color, skipping.";
					parsed = true;
				}else{
					r = parseInt(boom[0].replace("rgb(","").replace("rgba(","").trim());
					g = parseInt(boom[1].trim());
					b = parseInt(boom[2].replace(")","").trim());
				}
				break;
			default:
				output += "Could not parse "+args[a]+" as a color, skipping.";
				parsed = true;
		}
		if(!parsed){
			hex = "#"
				+(("00"+r.toString(16)).slice(-2))
				+(("00"+g.toString(16)).slice(-2))
				+(("00"+b.toString(16)).slice(-2));
			hex = hex.toUpperCase();
			rgb = "rgb("+r+","+g+","+b+")";
			mat = "["+(r/255).toFixed(4)+","+(g/255).toFixed(4)+","+(b/255).toFixed(4)+"]";
			output += "<span style=\"color: "+hex+"\" title=\""+args[a]+"\">"+args[a]+"</span> is:<br />";
			if(coltype != "hex") output += "&nbsp;&nbsp;&nbsp;&nbsp;!["+hex+"] as a hexadecimal code<br />";
			if(coltype != "rgb") output += "&nbsp;&nbsp;&nbsp;&nbsp;!["+rgb+"] as an rgb code<br />";
			if(coltype != "mat") output += "&nbsp;&nbsp;&nbsp;&nbsp;!["+mat+"] as a MATLAB style code<br />";
		}
	}
	return [0, output];
};
core.colconv.help = '<b>@{colconv}</b> command: supply a color code in either rgb(), hex (must include #) or [0:1,0:1,0:1] format<br/>and the same color in the other formats will be printed to screen.<br />Can supply as many colors as separate arguments as desired';
/*---- COLOR ----*/
core.color = function(args,trmnl){
	var which, col;
	if(args.length > 1){
		which = args[0];
		if(!trmnl.cols.hasOwnProperty(which)){
			return [1, which+' is not a valid parameter to change the color of']
		}
		col = args[1];
	}else{
		which = 'output';
		col = args[0];
	}
	if(col == "") return [1, "Need a color to change to"];
	if(args == "reset"){
		trmnl.cols.output = '#FFF';
		trmnl.cols.feedback = '#9CF';
		trmnl.cols.error = '#E85555';
	}else{
		if(!/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(col)){
			return [1, col+" is not a valid hexadecimal color"];
		}
		trmnl.cols[which] = col;
	}
	trmnl.update_colors();
	return 0;
};
core.color.help = '<b>@{color}</b> command: change the font color to a specified hexadecimal color code<br />Use <i>color reset</i> to return to default<br />feedback or error colors can be changed by passing in their name as first argument and the color as second';
/*---- COWSAY ----*/
core.cowsay = function(args,trmnl){
	var minL = 8, moostr = args[0], m = 0;
	if(moostr == undefined || moostr == ""){
		return [1, 'Cows rarely speak unless it is something worth saying.'];
	}
	if(moostr.length < 8){
		var pad = minL-moostr.length;
		if(pad%2 != 0){
			for(m = 0; m < Math.floor(pad/2); m++){
				moostr = ' '+moostr;
			}
			for(m = 0; m < Math.ceil(pad/2); m++){
				moostr += ' ';
			}
		}else{
			for(m = 0; m < pad/2; m++){
				moostr = ' '+moostr+' ';
			}
		}
	}
	var lining = Array(moostr.length+1).join('_');
	moostr = moostr.replace(/ /g, '&nbsp;');
	var mooster_cow = '&nbsp;'+lining+'<br/>/'+moostr+'\\<br/>\\'+lining+'/<br/>';
	mooster_cow += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\&nbsp;&nbsp;&nbsp;^__^<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\&nbsp;&nbsp;(oo)\\_______<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(__)\\&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)\\/\\<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||----w&nbsp;|<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||';
	return [0, mooster_cow];
};
core.cowsay.help = 'Hmmm. Make the cow say whatever you want. (It\'s a bit busted right now.)';
/*---- CURRENCY ----*/
core.currency = async function(args,trmnl){
	// e.g. currency USD GBP w:300 h:140 m:6 t:1 p:15
	// where w, h, m, t and p can also be supplied as width, height, months, threshold/thr and padding respectively
	let monthsBack = 3; // user supplied, otherwise default to 3 months.
	let threshold = 1; // SD away from mean in either direction to signify a good time to transfer in particular direction
	let currencies = ['USD','GBP'];
	let boxWidth = 640;
	let boxHeight = 150;
	let padding = 15;
	if(args.length > 0 && typeof(args[0]) !== "undefined" && args[0].indexOf(':') < 0){
		currencies[0] = args.shift().toUpperCase();
	}
	// still args[0] because we popped off the previous first one:
	if(args.length > 0 && typeof(args[0]) !== "undefined" && args[0].indexOf(':') < 0){
		currencies[1] = args.shift().toUpperCase();
	}
	// leftover arguments after removing currency values
	for(let a = 0; a < args.length; a++){
		const pop = args[a].split(":");
		switch(pop[0]){
			case 'w':
			case 'width':
				boxWidth = parseFloat(pop[1]);
				break;
			case 'h':
			case 'height':
				boxHeight = parseFloat(pop[1]);
				break;
			case 'm':
			case 'months':
				monthsBack = parseInt(pop[1]);
				break;
			case 't':
			case 'thr':
			case 'threshold':
				threshold = parseFloat(pop[1]);
				break;
			case 'p':
			case 'padding':
				padding = parseFloat(pop[1]);
				break;
			default:
				return [1, `Unknown input type: ${pop[0]}`];
		}
	}

	if(!Number.isInteger(monthsBack)){
		return [1, 'Months value <small>(m:<i>value</i> or months:<i>value</i>)</small> must be an integer'];
	}
	if(!Number.isFinite(threshold)){
		return [1, 'Threshold value <small>(t:<i>value</i>, thr:<i>value</i> or threshold:<i>value</i>)</small> must be a number'];
	}
	if(!Number.isFinite(boxWidth)){
		return [1, 'Width value <small>(w:<i>value</i> or width:<i>value</i>)</small> must be a number'];
	}
	if(!Number.isFinite(boxHeight)){
		return [1, 'Height value <small>(h:<i>value</i> or height:<i>value</i>)</small> must be a number'];
	}
	if(!Number.isFinite(padding)){
		return [1, 'Padding value <small>(p:<i>value</i> or padding:<i>value</i>)</small> must be a number'];
	}

	const bgCol = trmnl.cols.bg;
	const mnCol = trmnl.cols.feedback;
	const dotCol = trmnl.cols.output;

	const now = new Date();
	const past = new Date();
	past.setMonth(now.getMonth() - monthsBack);

	const date_start = past.toISOString().split('T')[0];
	const date_end = now.toISOString().split('T')[0];
    trmnl.output(`Querying exchange rate for ${currencies[0]} to ${currencies[1]}...`);
    const url = `https://api.apilayer.com/exchangerates_data/timeseries?start_date=${date_start}&end_date=${date_end}&base=${currencies[0]}&symbols=${currencies[1]}`;
    try {
        let response = await trmnl.xhrPromise(url,'GET','apikey','2aVOc6x280DGTa1fg9tnVlc31W5cztW3');
        const data = JSON.parse(response);
        if (trmnl.piping){
            trmnl.output("Piping for asynchronous API calls is in progress", 0);
        }
        if(!data.hasOwnProperty('rates')){
            console.log(data);
            return [1, "Data structure of response did not include rates. Check console."];
    	}
        const unorderedDates = Object.keys(data.rates);
        const dates = unorderedDates.sort();
        let values = [];
        for(let obj in data.rates){
            if(!data.rates[obj].hasOwnProperty(currencies[1])){
                values[dates.indexOf(obj)] = NaN;
            }else{
                values[dates.indexOf(obj)] = data.rates[obj][currencies[1]];
            }
        }
        const xmlns = "http://www.w3.org/2000/svg";

        const svg = document.createElementNS(xmlns, "svg");
        svg.setAttributeNS(null, "viewBox", `0 0 ${boxWidth} ${boxHeight}`);
        svg.setAttributeNS(null, "width", boxWidth);
        svg.setAttributeNS(null, "height", boxHeight);
        svg.style.display = "block";
        svg.style.background = bgCol;

        const meanValY = boxHeight - padding - ((boxHeight-(2*padding)) * (math.mean(values) - Math.min(...values))/(Math.max(...values)-Math.min(...values)));

        const sdShading = document.createElementNS(xmlns,"rect");
        sdShading.setAttribute("x",1);
        sdShading.setAttribute("width",boxWidth-2);
        const lowerBound = boxHeight - padding - ((boxHeight-(2*padding)) * ((math.mean(values)-(threshold*math.std(values))) - Math.min(...values))/(Math.max(...values)-Math.min(...values)));
        const upperBound = boxHeight - padding - ((boxHeight-(2*padding)) * ((math.mean(values)+(threshold*math.std(values))) - Math.min(...values))/(Math.max(...values)-Math.min(...values)));
        sdShading.setAttribute("y",upperBound);
        sdShading.setAttribute("height",lowerBound-upperBound);
        sdShading.style.fill = "rgba(0,0,0,0.15)";//"rgb(30,48,75)";
        svg.appendChild(sdShading);

        const meanLine = document.createElementNS(xmlns,"line");
        meanLine.setAttribute("x1",0);
        meanLine.setAttribute("y1",meanValY);
        meanLine.setAttribute("x2",boxWidth);
        meanLine.setAttribute("y2",meanValY);
        meanLine.setAttribute("stroke-linecap","round");
        meanLine.style.strokeWidth = 2;
        meanLine.style.stroke = mnCol;

    	let ttl = document.createElementNS(xmlns,"title");
    	ttl.innerHTML = `Mean value over ${monthsBack} months: 1 ${currencies[0]} = ${math.mean(values)} ${currencies[1]}`;
    	meanLine.appendChild(ttl);

        svg.appendChild(meanLine);

        const maxDateDiff = Math.round((now - past) / (1000*60*60*24));
        let polylinePts = "";
        for(let i = 0; i < values.length; i++){
            const yVal = boxHeight - padding - ((boxHeight-(2*padding)) * (values[i] - Math.min(...values))/(Math.max(...values)-Math.min(...values)));
            const thisDate = new Date(dates[i]);
            const dayDiff = Math.round((thisDate - past) / (1000*60*60*24));
            const xVal = padding + ((boxWidth-(2*padding)) * (dayDiff/maxDateDiff));
            polylinePts += `${xVal},${yVal} `;
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx",xVal);
            dot.setAttribute("cy",yVal);
            dot.setAttribute("r",3.5);
            dot.style.fill = dotCol;
            ttl = document.createElementNS(xmlns,"title");
            ttl.innerHTML = `${dates[i]}: 1 ${currencies[0]} = ${values[i]} ${currencies[1]}`;
            dot.appendChild(ttl);
            svg.appendChild(dot);
        }
        const mvgLine = document.createElementNS(xmlns,"polyline");
        mvgLine.setAttribute("points",polylinePts);
        mvgLine.style.fill = "none";
        mvgLine.style.strokeWidth = 1;
        mvgLine.style.stroke = dotCol;
        mvgLine.style.opacity = 0.75;
        svg.appendChild(mvgLine);

        const difference = (values[values.length-1]-math.mean(values))/math.std(values);
        const abovebelow = difference > 0 ? 'above' : 'below';
        response = `![Current conversion rate:] 1 ${currencies[0]} = ${values[values.length-1]} ${currencies[1]} (1 ${currencies[1]} = ${1/values[values.length-1]} ${currencies[0]})<br />which is ![${Math.abs(Math.round(100*difference)/100)} SD ${abovebelow}] the mean of the last ${monthsBack} months`;
        if(difference >= threshold){
    		if(currencies.indexOf('USD') > -1 && currencies.indexOf('GBP') > -1){
           	response += "<br/>It's a good time to pay off the UK credit card, but not a good time to use it <small>(USD currently buys greater than average GBP)</small>";
    		}else{
    			response += `<br />It's a good time to convert ${currencies[0]} into ${currencies[1]}`;
    		}
        }else if(difference <= -threshold){
            if(currencies.indexOf('USD') > -1 && currencies.indexOf('GBP') > -1){
           	response += "<br/>It's a good time to use the credit card for USD purchases, but not a good time to pay it off <small>(GBP currently buys greater than average USD)</small>";
    		}else{
    			response += `<br />It's a good time to convert ${currencies[1]} into ${currencies[0]}`;
    		}
        }else{
            response += `<br />We're pretty close to the mean exchange rate for the past ${monthsBack} months, so it's not a significantly good time to convert in either direction`;
        }

    	trmnl.output(response,false);
    	trmnl.output(`![Past ${monthsBack} months] <small>(shading shows the threshold of ![${threshold} SDs])</small>:`,false);
    	trmnl.output(`<small>&uarr;&nbsp;${currencies[0]} buys more ${currencies[1]}</small>`);
        trmnl.output_div.appendChild(svg);
    	trmnl.output(`<small>&darr;&nbsp;${currencies[1]} buys more ${currencies[0]}</small>`);
    } catch (err) {
        console.log(err.message);
        return [1, 'Error parsing currency data, check console']
    }
    return 0;
};
core.currency.help = `<b>@{currency}</b> command plots a graph of the conversion rate between two currencies, and suggests if
it's a good time to convert them.

Called with no arguments it defaults to USD to GBP over the past 3 months, otherwise
specify any desired changes to these currencies as first arguments.
The number of months to look back, the threshold for a significant deviation in value, and
the display of the graph can be altered with arguments:
&nbsp;&nbsp;![m:]<i>n</i> or ![months:]<i>n</i> sets the number of months to look back over to <i>n</i> months (must be an integer)
&nbsp;&nbsp;![t:]<i>n</i>, ![thr:]<i>n</i> or ![threshold:]<i>n</i> sets the threshold to <i>n</i> SD away from the mean
&nbsp;&nbsp;![w:]<i>n</i> or ![width:]<i>n</i> sets the graph width to <i>n</i> pixels
&nbsp;&nbsp;![h:]<i>n</i> or ![height:]<i>n</i> sets the graph height to <i>n</i> pixels
&nbsp;&nbsp;![p:]<i>n</i> or ![padding:]<i>n</i> sets the graph padding to <i>n</i> pixels

e.g. @{currency USD EUR m:24 w:1400 t:2.5} looks at the last 2 years of conversion
rates between US dollars and Euros, with a threshold of &plusmn;2.5 SD and a graph width of 1200 pixels
<small>Note: uses theme colors for graph, but old graphs don't update on changing theme</small>`;
core.currency.autocomplete = () => {
	return []; //TODO: code this autocomplete
};
/*---- DB ----*/
core.db = function(args,trmnl){
	trmnl.program = "db";
	trmnl.next_prompt = 'DB>';
	return 0;
};
core.db.help = '<b>@{db}</b> program';
/*---- ECHO ----*/
core.echo = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need a variable name to print. Use @{workspace} to show current variables"];
	}
	const vars = JSON.parse(localStorage.getItem("vars"));
	if(vars == null){
		return [0, "No <i>"+args[0]+"</i> variable stored"];
	}
	// TODO: do some sanity checking on input here (args[0])
	if(typeof(vars[args[0]]) === "undefined"){
		return [1, "No <i>"+args[0]+"</i> variable stored"];
	}

	return [0, vars[args[0]]];
};
core.echo.help = '<b>@{echo}</b> prints a variable to the screen. Assign variables with <i>var</i> function, e.g. @{var foo=bar}';
core.echo.autocomplete = () => {
	const vars = JSON.parse(localStorage.getItem("vars"));
	return Object.keys(vars);
};
/*---- EXIT ----*/
core.exit = function(args,trmnl){
	trmnl.exit();
	return 0;
};
core.exit.help = '<b>@{exit}</b> the current terminal window. Useful when using session.<br />Will result in blank screen if you exit the last terminal...';
/*---- HELP ----*/
core.help = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){ // 'help' on its own auto finds all the base commands and lists them
		var avail_commands = 'Available commands:<hr /><table><tr>';
		if(trmnl.base.hasOwnProperty('autocomplete')){ // make use of the autocomplete data if it has been populated
			for(var c = 0; c < trmnl.base.autocomplete.length; c++){
				avail_commands += `<td>@{${trmnl.base.autocomplete[c]}}</td>`; // Oh look, I started updating the variable in strings method at last!
				if((c+1)%6 == 0 && c != 1) avail_commands += '</tr><tr>';
			}
		}else{
			var c = 0;
			for(key in trmnl.base){
				if(typeof(trmnl.base[key]) == 'function'){
					avail_commands += `<td>@{${key}}</td>`;
					c++;
					if(c%6 == 0 && c != 1) avail_commands += '</tr><tr>';
					//avail_commands += '&nbsp;&nbsp;'+key+'<br />';
				}
			}
		}
		avail_commands += '</tr></table>\
		Use help <i>function name</i> for more info\n\
		<small>Commands can be:<br /><ul>\
		<li>piped to one another with | (e.g. @{randcol | showcol})</li>\
		<li>run sequentially (if the previous command was successful) with &&\
		<li>pushed to a different terminal by appending its ID after :: anywhere in the arguments, which can be repeated multiple times</li>\
		<li>repeated multiple times with !<i>n</i> anywhere in the arguments, where <i>n</i> is the number of times to run the command</li>\
		<li>the previous command can be re-run with @{!!}</li>\
		</ul>\
		e.g. To open 3 extra terminals once session is installed, run: @{session -& !3}\n\
		and to install the basic package to all terminals run: @{install -b0123}</small>';

		return [0, avail_commands];
	}else{
		if(typeof(trmnl.base[args[0]]) !== 'function'){
			return [1, args[0]+' is not a function'];
		}
		var help_res = trmnl.base[args[0]].help;
		if(typeof(help_res) == "undefined"){
			help_res = "<i>No help for <b>"+args[0]+"</b> function yet</i>";
		}
		return [0, help_res];
	}
	return 0;
};
core.help.help = '<b>@{help}</b> command: in-depth help for the help command needs to be written here.';
core.help.autocomplete = (trmnl) => {
	return trmnl.base.autocomplete;
};
/*---- HISTSIZE ----*/
core.histsize = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [0, "Command history size: "+trmnl.cmd_hist_size];
	}
	if(args.length > 1) trmnl.output("Only need 1 input, ignoring subsequent parameters...");
	var n = parseInt(args[0]);
	trmnl.cmd_hist_size = n;
	return [0, "Set command history size to "+n];
};
core.histsize.help = '<b>@{histsize}</b>: with no argument, prints current command history size to screen,<br />with exactly 1 argument – sets the number of items to store in the local storage command history';
/*---- INSTALL ----*/
core.install = function(args,trmnl){
	// TODO: parse flags out of args, and set -p/--permanent flag to add the program to the local settings of permanently installed functions/programs, which will be silently auto-installed at start up.
	// beginning of that:
	[args,flags] = trmnl.parse_flags(args);
	if(flags.indexOf('basic') > -1 || flags.indexOf('b') > -1){
		args.push('session','tedit','display');
	}
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need to specify a program to install"];
	}
	// can set flags to say which terminal to install to (or multiple), this parses them out:
	let installTo = [];
	for(let f in flags){
		if(flags[f] >= 0 && flags[f] < 4){
			if(typeof(terminal[parseInt(flags[f])]) == "object"){
				installTo.push(parseInt(flags[f]));
			}else{
				trmnl.error("Skipping install to terminal "+flags[f]+" because it cannot be found");
			}
		}
	}
	if(installTo.length < 1) installTo = [trmnl.ID];
	let d = new Date();
	for(let a in args){
		// test if it's already installed first here!
		let app = args[a];
		// we need to go async now.
		trmnl.input_div.innerHTML = "";
		trmnl.input_div.style.display = "none";

		let xhr = new XMLHttpRequest(); // TODO: update this to use trmnl.xhrPromise() method instead and go async properly
		xhr.open('GET', "pkg/"+app+".js?d="+d.getTime());

		xhr.onload = function(){
			try{ // always check if terminal.piping == true in async callbacks!
				if(trmnl.piping){
					trmnl.output("Cannot pipe installation. Actually you can, but it'll just pass success or error. Yet to code that in though.",0);
				}
				// install here by creating a script element then deleting it.
				var s = document.createElement("script");
				s.type = "text/javascript";
				// wait, do I need to ajax at all here?! I could just s.src = "pkg/"+app+".js" instead...
				s.innerHTML = this.responseText;
				document.body.appendChild(s);
				for(let i in installTo){
					if(terminal[installTo[i]].base.hasOwnProperty(app)){
						// worth rechecking as we might have duplicated within this request of multiple apps...
						terminal[installTo[i]].error(app+" is already installed, skipping");
					}else{
						terminal[installTo[i]].base[app] = pkgs[app];
						terminal[installTo[i]].base.autocomplete.push(app);
						terminal[installTo[i]].base.autocomplete.sort();
						// test to see if the program has a "window" set of functions, and if so, add to terminal:
						if(typeof baseWindow !== 'undefined' && baseWindow.hasOwnProperty(app)){
							terminal[installTo[i]][app] = baseWindow[app];
							terminal[installTo[i]].update_autocomplete(app);// add this program to the autocomplete
						}
						terminal[installTo[i]].output(app+" program installed",0);
					}
				}
				s.innerHTML = ""; // just in case
				document.body.removeChild(s);
				pkgs = {}; // just in case
			}catch(err){
				console.log(err.message);
				trmnl.error("Could not parse received program data");
			}
			trmnl.input_div.style.display = "block";
		};
		xhr.onerror = function(err){
			trmnl.error("Could not find program");
			trmnl.input_div.style.display = "block";
		}
		xhr.send(null);
	}
	var retval = "Attempting install of "+args.length+" program";
	if(args.length != 1) retval += "s";
	for(var a in args){
		retval += "<br />["+a+"] -> "+args[a];
	}
	return [0, retval];
};
core.install.help = "<b>@{install}</b> command: install the specified program(s)<br /><small>(Use <b>@{pkg}</b> command to list available programs)<br />Accepts flags for collections of functions. Currently only --basic/-b for my commonly used ones</small>";
core.install.autocomplete = (trmnl) => {
	//TODO: It'd be nice to list options as per pkg command here, but it requires async which would make the keydown function have to go async
    trmnl.base.pkg('',trmnl);
    trmnl.focus();
	return;
};
/*---- KILL ----*/
core.kill = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need to specify a terminal ID to terminate"];
	}
	var retval = "";
	for(var a in args){
		var n = parseInt(args[a]);
		if(typeof(terminal[n]) === "object" && typeof(terminal[n].exit) === "function"){
			terminal[n].exit(trmnl.ID);
			retval += "Stopped terminal:"+n+"<br />";
		}else{
			retval += "Failed to find terminal with ID: "+n;
		}
	}
	return [0, retval];
};
core.kill.help = '<b>@{kill}</b> the specified terminal window. Useful when using session.<br />Will result in blank screen if you kill the last terminal...';
/*---- MATH ----*/
core.math = function(args,trmnl){
	trmnl.program = "math";
	trmnl.next_prompt = 'MATH>';
	//trmnl.reset('MATH>');
	return 0;
};
core.math.help = '<b>@{math}</b> program';
/*---- medrxiv ----*/
core.medrxiv = async (args, trmnl) => {
    if (args == undefined || args == ""){
        args = ['--medrxiv'];
    }else{
        args.push('--medrxiv');
    }
    return await trmnl.base.biorxiv(args,trmnl)
};
core.medrxiv.help = `<b>@{medrxiv}</b> command: wrapper for biorxiv function to go directly to medrxiv results without flags.
    See @{help biorxiv} for more information`;
/*---- MLB ----*/
core.mlb = (args,trmnl)=>mlbReader(args, trmnl);
core.mlb.help = '<b>@{mlb}</b> command: pass in the 2 or 3 digit code for a MLB team to see live info about any game being played today\nPass in a date to check games from a different day, e.g. 4/12/19\ne.g. @{mlb nyy} or @{mlb sf 4/18/19}\n@{mlb list} or @{mlb ls} lists team code options';
core.mlb.autocomplete = () => { return ["ARI", "ATL", "BAL", "BOS", "CHC", "CWS", "CIN", "CLE", "COL", "DET", "FLA", "HOU", "KAN", "LAA", "LAD", "MIL", "MIN", "NYM", "NYY", "OAK", "PHI", "PIT", "SD", "SF", "SEA", "STL", "TB", "TEX", "TOR", "WAS"]; };
/*---- NOTE ----*/
core.note = function(args,trmnl){
	// use localStorage for notes. Need to getItem first to append note to the array of notes.
	//TODO: (MAJOR) MAKE SURE TO SANITIZE THE NOTE FIRST
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need to write a note to save"];
	}
	var notes = JSON.parse(localStorage.getItem("notes"))
	if(notes === null){
		notes = [];
	}
	if(typeof(notes) !== "object"){ // if there's only one note it's a string, not an array/object
		notes = notes.split(); // this shouldn't be the case anymore, now that it includes dates
	}
	var newnote = {};
	newnote.note = args.join(" ");
	newnote.c = Date();
	newnote.m = 0; // never modified, yet.
	notes.push(newnote); //update to have creation and modification times, i.e. notes[n].text, notes[n].c and notes[n].m
	var tot_notes = notes.length;
	notes = JSON.stringify(notes);
	localStorage.setItem("notes",notes);
	return [0, "New note created. You now have "+tot_notes+" notes stored"];
};
core.note.help = '<b>@{note}</b> command: make a new note. Use <b>@{notes}</b> command to read notes<br /><b>@{notebook}</b> program allows for more advanced navigation of notes.<br />N.B. that notes are local to the machine, not across multiple terminal sessions on different devices.<br />Cloud notes will be added soon.';
/*---- NOTES ----*/
core.notes = function(args,trmnl){
	// need to update the below to work with notes[n].text, notes[n].c and notes[n].m instead
	var getSnippet = function(text, length) {
		if(text.length > length){
			var rx = new RegExp("^.{" + length + "}[^ ]*");
			return rx.exec(text)[0];
		}
		return text;
	}
	var notes = JSON.parse(localStorage.getItem("notes"))
	if(notes === null){
		return [0, "<i>You currently have no notes stored</i>"];
	}
	if(args[0] == undefined || args[0] == ""){
		if(typeof(notes) !== "object"){ // if there's only one note it's a string, not an array/object
			return [0, "[0] -> "+notes];
		}
		var output = "You have "+notes.length+" notes:<br /><table>";
		var d, c_format, n_format;
		for(var n = 0; n < notes.length; n++){
			//d = new Date(notes[n].c);
			c_format = notes[n].c;
			m_format = notes[n].m;
			//c_format = (d.getMonth()+1)+"/"+d.getDate()+" ";
			//c_format += ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);
			n_format = getSnippet(notes[n].note,35);
			if(n_format.length != notes[n].note.length) n_format += "...";
			output += "<tr";
			if(notes[n].complete){
				output += " style=\"text-decoration: line-through;\""
			}
			output += "><td>[!["+n+"]] -> </td><td>"+n_format+"</td><td><i>"+c_format+"</i></td><td><i>"+m_format+"</i></td></tr>";
		}
		output += "</table>";
		return [0, output];
	}else{
		var n = parseInt(args[0]);
		// check it's an integer, then load up notes as above, check that note number exists, then print the whole thing to screen as output.
		if(typeof(notes[n]) !== "object"){
			return [1, "Cannot find note ["+n+"]"];
		}
		var output = "Note "+n+":<br />";
		output += "<div class='cmd-feedback'>"+notes[n].note+"</div>"; // maybe do an automate linebreak every last space before n chars?
		output += "<i>Created: "+notes[n].c+"; <i>modified: "+notes[n].m+"</i>";
		return [0, output];
	}
	return [1, "Notes had an issue"]; // shouldn't ever reach this, but just in case
};
core.notes.help = '<b>@{notes}</b> command: called with no arguments will list a snippet of all notes plus their IDs. Call <b>notes</b> with an ID to show that note in full.<br /><b>notebook</b> program allows for more advanced navigation of notes.';
/*---- NSXLOAD ----*/
core.nsxload = function(args,trmnl){
	if(args.length < 2 || args[0] == undefined || args[0] == "" || args[1] == undefined || args[1] == ""){
		return [1, "Need 2 arguments, number of channels and sampling frequency, in either order (# channels denoted by ch)"];
	}else{
		var chans, Fs, val;
		console.log('---nsxload debugging:---');
		for(var a = 0; a < args.length; a++){
			val = parseFloat(args[a].match( /[+-]?\d+(\.\d+)?/g));
			console.log('Value is '+val);
			if(args[a].toLowerCase().indexOf('ch') > -1){
				// channel
				console.log('It is number of channels');
				chans = val;
			}else{
				// Fs
				console.log('It is Fs');
				if(args[a].indexOf('k') > -1) val *= 1000;
				console.log('Interpretted value is '+val+' Hz');
				Fs = val;
			}
		}
		var load = Math.ceil(100*((((chans * Fs * 16) / 8) / 1024 / 1024 / 1024) * 60 * 60))/100;
		return [0, "Recording will require "+load+" GB  per hour ("+Math.ceil(load*24)+" GB per day)"];
	}
};
core.nsxload.help = '<b>@{nsxload}</b> command: calculates how many gigabytes will be created per hour/day for specified<br />number of electrodes and sampling rate with BlackRock nsx files<br />Specify number of electrodes by pre- or post-fixing with "ch"<br />e.g. @{nsxload 16ch 30k} <i>or</i> @{nsxload 2000 ch64} (i.e. any order for arguments or "ch")';
/*---- PAPERS ----*/
core.papers = function(args,trmnl){
	return trmnl.science.publications();
};
core.papers.help = '<b>@{papers}</b> command: list my publications (inherited from @{science} program)';
/*---- PKG ----*/
core.pkg = function(args,trmnl){
	// TODO: don't have any arguments for this at the moment, update
	// we need to go async now. (TODO: turn this into a promise to avoid this!)
	trmnl.input_div.innerHTML = "";
	trmnl.input_div.style.display = "none";
	let d = new Date();
	let xhr = new XMLHttpRequest(); // TODO: update this to use trmnl.xhrPromise() method and go async properly
	xhr.open('GET', 'pkg/manifest.json?d='+d.getTime(), true);
	xhr.onload = function(){
		//TODO: sanity check the JSON response here first!
		let manifest = JSON.parse(xhr.responseText);
		let retval = "Version !["+manifest.version+"] (last build: !["+manifest.lastbuild+"])";
		retval += "<br />Description: <i>"+manifest.description+"</i><hr /><table><tr>";
		retval += "<th>Identifier</th>";
		retval += "<th>Name</th>";
		retval += "<th>Version</th>";
		retval += "<th>Description</th>";
		retval += "</tr>";
		for(var app in manifest.apps){
			retval += "<tr><td class='cmd-feedback' ";
			if(manifest.apps[app].tag in trmnl.base){ // app is installed already
				retval += " style='opacity: 0.5; font-style: oblique;' title='"+manifest.apps[app].name+" is installed'";
			}
			retval += ">"+manifest.apps[app].tag+"</td><td>"+manifest.apps[app].name+"</td><td>"+manifest.apps[app].version+"</td><td><i>"+manifest.apps[app].description+"</i></td></tr>";
		}
		retval += "</table>";
		trmnl.output(retval);
		trmnl.input_div.style.display = "block";
	}
	xhr.onerror = function(err){
		console.log(err);
		trmnl.error("Couldn't retrieve list of packages");
		trmnl.input_div.style.display = "block";
	}
	xhr.send(null);
	return [0, "Retrieving pkg list"];
};
core.pkg.help = '<b>@{pkg}</b> command: list available programs for install';
/*---- RANDCOL ----*/
core.randcol = function(args,trmnl){
	return [0, '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6)];
};
core.randcol.help = '<b>@{randcol}</b> command: return a random hexadecimal color code';
/*---- SCIENCE ----*/
core.science = function(args,trmnl){
	var info = "",
		quick_release = false;
	if(args.length > 0){
		if(args[0] == "info"){
			quick_release = true;
		}
	}
	/*
<div itemscope itemtype="https://schema.org/Person"><a itemprop="sameAs" content="https://orcid.org/0000-0001-8172-3152" href="https://orcid.org/0000-0001-8172-3152" target="orcid.widget" rel="me noopener noreferrer" style="vertical-align:top;"><img src="https://orcid.org/sites/default/files/images/orcid_16x16.png" style="width:1em;margin-right:.5em;" alt="ORCID iD icon">https://orcid.org/0000-0001-8172-3152</a></div>
	*/
	trmnl.output("@__Ed is currently an Associate Research Scientist at <a target='_blank' href='https://www.cuimc.columbia.edu'>Columbia University Medical Center</a> in the <a target='_blank' href='http://www.columbianeurology.org'>Dept. of Neurology</a>\n\
	His research focuses on the activity of populations of single neurons in epilepsy patients during seizures,<br />especially the activity of individual inhibitory cells at seizure onset, and alterations to firing patterns<br />in what's known as the '<i>post-ictal</i>' period.\
	@__Click to go to his <a target='_blank' href='https://scholar.google.com/citations?user=PnKpxtIAAAAJ&hl=en&oi=ao'>Google Scholar page</a>, <a target='_blank' href='https://www.ncbi.nlm.nih.gov/pubmed/?term=(edward+merricks%5Bauthor%5D)'>publications</a>, <a target='_blank' href='https://github.com/edmerix/'>GitHub</a>, <a target='_blank' href='https://www.researchgate.net/profile/Edward_Merricks'>ResearchGate</a>, or <a target='_blank' href='https://orcid.org/0000-0001-8172-3152'><img src='https://orcid.org/sites/default/files/images/orcid_16x16.png' style='width:1em;margin-right:.5em;'' alt='ORCID iD icon'>ORCiD</a>\n\
	He has code to open <a target='_blank' href='https://github.com/edmerix/NSxFile'>NSx neural data files in an an object-oriented approach in MATLAB</a> or <a target='_blank' href='https://github.com/edmerix/openNSx-swift'>Swift</a>, do the <a target='_blank' href='https://github.com/edmerix/SplitMerge'>manual stage of spike sorting</a>, or<br /><a target='_blank' href='https://github.com/edmerix/NeuroClass'>analyze populations of single unit data</a>, among others (ask for more).\
	@__There have been a lot of questions about spike sorting through time recently...\n\
	Click <a href='SpikeSorting' target='_blank'>here</a> for a (very) quick overview of spike sorting through time");

	if(!quick_release){
		trmnl.program = "science";
		trmnl.next_prompt = 'SCIENCE>';
		info = "<hr />Entering SCIENCE info program... Type help for more info, and exit to return home.";
	}
	return [0,info];
}
core.science.help = '<b>@{science}</b> command: use to find some info about my scientific work.<br />science with no arguments will start the SCIENCE "program"<br />Using the argument "info" will just print the basic details to screen then return home.';
core.science.autocomplete = () => ["info"];
/*---- SHOWCOL ----*/
core.showcol = function(args,trmnl){
	if(args[0] == undefined || args[0] == ""){
		return [1, 'Need a hexadecimal color code to print'];
	}
	if(!/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(args[0])){
		return [1, args[0]+" is not a valid hexadecimal color code"];
	}
	return [0, args[0]+'['+args[0]+']'];
};
core.showcol.help = '<b>@{showcol}</b> command: print the given hexadecimal color code in its color. Try piping from randcol, i.e. @{randcol | showcol}';
/*---- STARTUP ----*/
core.startup = function(args,trmnl){
	return [0, 'Currently coding this one'];

};
core.startup.help = '<b>@{startup}</b> command will set all supplied arguments to run at each startup on this machine. @{startup} with no arguments lists the current startup commands';
/*---- SUBWAY ----*/
core.subway =  (args,trmnl)=>subwayParser(args, trmnl);
core.subway.help = 'Subway status. Needs a station name as argument, and if there are multiple stations with that name,\n\
a subway line that goes through that station should be the second argument to differentiate\n\
The station name should correspond to the official MTA name for that station, but replace spaces, dashes or slashes with underscores.\n\
If unsure of the station name, use tab to see autocomplete options.\n\
After entering station name, autocomplete shows viable lines for stations with that name.\n\
Example usages: @{subway times_sq} or @{subway 96_st 1}';
core.subway.autocomplete = (trmnl,arg,fullCommand) => {
    const commandPop = fullCommand.split(" ");
    if (commandPop[1] !== undefined && Object.keys(stations).includes(commandPop[1])){
        const opts = Object.keys(stations[commandPop[1]]);
        return opts.filter(item => item != '_unique');
    }
    return Object.keys(stations)
};
/*---- THEME ----*/
core.theme = function(args,trmnl){
	let flags = [];
	[args,flags] = trmnl.parse_flags(args);
	if(args[0] == undefined || args[0] == ""){
		return [1, "need a theme name to change to"];
	}
	if(trmnl.themes.hasOwnProperty(args[0])){
		//trmnl.cols = trmnl.themes[args[0]]; // actually, this passes by reference(-ish), allowing it to update the theme upon using bg or color commands, until refresh.
		trmnl.cols.bg = trmnl.themes[args[0]].bg;
		trmnl.cols.error = trmnl.themes[args[0]].error;
		trmnl.cols.output = trmnl.themes[args[0]].output;
		trmnl.cols.prompt = trmnl.themes[args[0]].prompt;
		trmnl.cols.feedback = trmnl.themes[args[0]].feedback;
		if(flags.indexOf('p') > -1 || flags.indexOf('permanent') > -1){
			localStorage.setItem("theme",`"${args[0]}"`);
		}
	}else{
		return [1, 'unknown theme name: '+args];
	}
	trmnl.update_colors();
	return 0;
};
core.theme.help = `<b>@{theme}</b> command: change terminal to a different theme. Available themes will be populated once specified theme file has been loaded.
Use -p or --permanent flag to set the chosen theme as the default for this machine`;
core.theme.autocomplete = (trmnl) => {
	return Object.keys(trmnl.themes);
};
/*---- TRANSWAIT ----*/
core.transwait = function(args,trmnl){
	if(args.length != 2){
		return [1, 'Requires exactly 2 arguments: a rate, and an amount'];
	}
	var rate, amt, val;
	console.log('---TRANSWAIT debugging:---');
	for(var a = 0; a < args.length; a++){
		val = parseFloat(args[a].match( /[+-]?\d+(\.\d+)?/g));
		console.log('Value is '+val);
		if(args[a].toLowerCase().indexOf('ps') > -1){
			// rate
			console.log('It is a rate');
			if(args[a].toLowerCase().indexOf('t') > -1){ // TODO rejig this, there's a much simpler/cleaner method!
				val = val * 1024 * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('g') > -1){
				val = val * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('m') > -1){
				val = val * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('k') > -1){
				val = val * 1024;
			}
			if(args[a].indexOf('B') > -1) val *= 8; // bits to bytes if capital B present
			console.log('Interpretted value is '+val+ ' bits per second');
			rate = val;
		}else{
			// amt
			console.log('It is an amount');
			if(args[a].toLowerCase().indexOf('t') > -1){ // TODO as above (in rate section)
				val = val * 1024 * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('g') > -1){
				val = val * 1024 * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('m') > -1){
				val = val * 1024 * 1024;
			}else if(args[a].toLowerCase().indexOf('k') > -1){
				val = val * 1024;
			}
			if(args[a].indexOf('B') > -1) val *= 8; // bits to bytes if capital B present
			console.log('Interpretted value is '+val+' bits');
			amt = val;
		}
	}
	// we now have rate in bits per second and amt in bits
	var delay = amt/rate;
	var remainder = 0;
	// convert into mins or hours here if large enough
	if(delay > 60*60){ // again. Cleaner method. TODO make this shiny.
		delay = delay/60/60;
		remainder = delay - Math.floor(delay);
		remainder = remainder*60; // convert into time (multiples of 60 mins)
		delay = Math.floor(delay)+' hours and '+Math.round(remainder)+' minutes';
	}else if(delay > 60){
		delay = delay/60;
		remainder = delay - Math.floor(delay);
		remainder = remainder*60; // convert into time (multiples of 60 secs)
		delay = Math.floor(delay)+' minutes and '+Math.round(remainder)+' seconds';
	}else{
		delay = Math.round(delay)+ ' seconds';
	}
	return [0, delay+' left'];
};
core.transwait.help = '<b>@{transwait}</b> command: calculate how long a transfer will take<br />Requires 2 input arguments, the rate and the amount to transfer. Note that calculation is bit/byte specific using b/B notation!<br />e.g. @{transwait 12.34GB 123Mbps}\n(Arguments can come in either order. Only <u>B</u>yte vs <u>b</u>it is case sensitive.)';
/*---- VAR ----*/
core.var = function(args,trmnl){
	//TODO: might be cool to add the creation/modification date to the variables (like note), which would be included in workspace command.
	if(args[0] == undefined || args[0] == ""){
		return [1, "Need at least one argument, with assignment, e.g. @{var foo=bar} or @{var(foo = bar, pi = 3.1415)}"];
	}
	let vars = JSON.parse(localStorage.getItem("vars"));
	if(vars == null){
		vars = {};
	}
	let name, value, pop, output = "";
	for(let a = 0; a < args.length; a++){
		pop = args[a].split('=');
		if(pop.length < 2){
			return [1, "Variables must be assigned when instantiated, i.e. "+args[a]+"=<i>something</i>"];
		}
		value = pop[pop.length-1].trim();
		for(let n = 0; n < pop.length - 1; n++){ // for example foo=bob=bar would set foo and bob to a value of bar
			name = pop[n].trim();
			vars[name] = value;
			output += name+" <i>set to</i> "+value+"\n";
		}
		//TODO: do some sanity checking that the variable was successfully created, and if not, alter the above output line
	}
	localStorage.setItem("vars",JSON.stringify(vars));

	return [0, output];
};
core.var.help = '<b>@{var}</b> keyword is used to assign pervasive (machine-specific) variables, e.g. @{var foo=bar}';
/*---- VERSION ----*/
core.version = function(args,trmnl){
	return [0, "![emerix terminal v"+trmnl.version+"<br /><i>Release date: "+trmnl.releaseDate+"</i>]"]
};
core.version.help = "<b>@{version}</b> command shows details about the current version of the emerix terminal";
/*---- WEATHER ----*/
core.weather = function(args,trmnl){
	var flags = [],
		longprint = false;
	[args,flags] = trmnl.parse_flags(args);
	if(args[0] == undefined || isNaN(parseFloat(args[0]))){
		return [1, args[0]+" is not a valid ZIP code"];
	}
	for(var f = 0; f < flags.length; f++){
		switch(flags[f]){
			case 'f':
			case 'full':
				longprint = true;
				break;
			default:
				trmnl.output("Unknown flag: "+flags[f]+", ignoring");
		}
	}
	// we need to go async now.
	trmnl.input_div.innerHTML = "";
	trmnl.input_div.style.display = "none";

	var xhr = new XMLHttpRequest();
	xhr.open('GET', "https://api.openweathermap.org/data/2.5/forecast?zip="+args[0]+"&units=metric&appid=2075d49b34d2618a3b73f7eaa58d97d8", true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		try{ // normally we should check if piping is true, but the weather table is just gonna async print.
			let res = this.response;
			let weather = "![Weather data for "+res.city.name+", "+res.city.country+":]<br /><table>";
			weather += "<tr><th>Date</th><th>Hour</th><th>Condition</th><th>Temp</th><th>Cloudiness</th><th>Humidity</th></tr>";
			let count_to = 5;
			if(longprint){
				count_to = res.cnt;
			}
			for(let r = 0, dt, hr; r < count_to; r++){
				dt = new Date(res.list[r].dt*1000);
				hr = "0"+dt.getHours();
				weather += "<tr><td>"+(dt.getMonth()+1)+"/"+dt.getDate()+"</td>";
				weather += "<td>"+hr.substr(-2)+":00</td>";
				weather += "<td>"+res.list[r].weather[0].description+"</td>";
				weather += "<td>"+Math.round(res.list[r].main.temp)+"&deg;C</td>";
				weather += "<td>"+res.list[r].clouds.all+"%</td>";
				weather += "<td>"+res.list[r].main.humidity+"%</td></tr>";
			}
			weather += "</table>";
			trmnl.output(weather,0);
		}catch(err){
			console.log(err.message);
			trmnl.error("Could not parse received weather data");
		}
		trmnl.input_div.style.display = "block";
	};
	xhr.onerror = function(err){
		trmnl.error("Could not load data");
		trmnl.input_div.style.display = "block";
	};
	xhr.send(null);

	return [0, "loading weather data..."]
};
core.weather.help = '<b>@{weather}</b> command: get forecast for a given ZIP code<br />e.g. "@{weather 10025}"<br />Defaults to displaying results for next 5 hours, use -f or --full flag to display all results"';
/*---- WHOAMI ----*/
core.whoami = function(args,trmnl){
	/* this is the static version of the site. No ajax to php files.
	// we need to go async now.
	trmnl.input_div.innerHTML = "";
	trmnl.input_div.style.display = "none";

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		try{ // always check if terminal.piping == true in async callbacks!
			let res = this.response;
			if(trmnl.piping){
				res.user = res.user.replace(/,/g,'&comma;'); // there shouldn't ever be a comma in user...
				trmnl.parse_command(trmnl.pipe_function+"("+res.user+")",0);
			}else{
				if(res.id >= 0){
					trmnl.output("Logged in as "+res.user,0);
				}else{
					trmnl.output("Browsing as guest",0);
				}
			}
		}catch(err){
			console.log(err.message);
			trmnl.error("Could not parse received data");
		}
		trmnl.input_div.style.display = "block";
	};
	xhr.onerror = function(err){
		trmnl.error("Could not load user data");
		trmnl.input_div.style.display = "block";
	};
	xhr.send(null);

	return 0;
	*/
	return [0, "Browsing as guest"]; // always, since this is the static version. Bit rubbish.
};
core.whoami.help = '<b>@{whoami}</b> command: tells you who you are logged in as, if any';
/*---- WORKSPACE ----*/
core.workspace = function(args,trmnl){
	// currently just auto-discards any arguments/flags
	const vars = JSON.parse(localStorage.getItem("vars"));
	if(vars == null){
		return [0, "You have no variables stored"];
	}
	let output = "You have "+Object.keys(vars).length+" variables:<br /><table>";
	for(let key in vars){
		if(key != null){
			output += "<tr><td>!["+key+"]</td><td>-></td><td>"+vars[key]+"</td></tr>";
		}
	}
	output += "</table>";
	return [0, output];
};
core.workspace.help = '<b>@{workspace}</b> prints all currently stored variables to the screen. Variables are pervasive and machine-specific';
