async function subwayParser(args, trmnl) {
    if(stations == -1 || (Object.keys(stations).length === 0 && sellers.constructor === Object)){
        return [1, 'Subway station data failed to load correctly'];
    }

    if(args[0] == undefined || args[0] == ""){
        return [1, 'Need a station name to search for (e.g. 103_st)'];
    }

    let s_id = -1;
    let lineCode = -1;

    let stationName = args[0].toLowerCase().trim();
    stationName = stationName.split("-")[0].trim();
    stationName = stationName.split("/")[0].trim();
    stationName = stationName.split(" ").join("_");

    if(!(stationName in stations)){
        return [1, `Couldn't find ${args[0]} in station data. Note we use the official MTA naming, but replace spaces, hyphens and slashes with underscores.`]
    }

    if(args.length > 1 && typeof(args[1]) !== 'undefined'){
        lineCode = args[1].toUpperCase();
    }

    if(lineCode == -1){
        if(stations[stationName]._unique.length > 1 && lineCode == -1){
            return [1, `${stations[stationName]._unique.length} different stations matched ${stationName}: please add the lowest line number/letter at that station to the query (all lines to be re-added shortly)`]
        }
        s_id = stations[stationName]._unique[0];
    }else{
        if(!(lineCode in stations[stationName])){
            return [1, `${lineCode} doesn't appear to run through ${stationName}`];
        }
        s_id = stations[stationName][lineCode];
    }
    if(typeof(s_id) === 'undefined'){
        return [1, `Couldn't get a station code for ${stationName} with line ${lineCode}`];
    }

    trmnl.output('Fetching live subway data...');
    const url = `https://api.wheresthefuckingtrain.com/by-id/${s_id}`;
    try {
        let response = await trmnl.xhrPromise(url);
        const trainData = JSON.parse(response);
        if (trmnl.piping){ // TODO: need to add this to the mlb command as well
            trmnl.output("Piping for asynchronous API calls is in progress", 0);
        }
        if(trainData.updated === null){
            return [0, `Currently no information for ${trainData.data[0].name} subway station`];
        }
        trmnl.output(`![${trainData.data[0].name} subway station:]`);
        let timetable = '<table><tr><th>Uptown &#9650;</th><th>Downtown &#9660;</th></tr>';
        const uptownData = trainData.data[0].N;
        const downtownData = trainData.data[0].S;
        const nRows = Math.max(uptownData.length, downtownData.length);
        let rowData = [];
        let waitTime = '';
        for (let n = 0; n < nRows; n++){
            rowData[n] = `<tr><td>`;
            rowData[n] += n >= uptownData.length ? `-` : `<span class='mta mta_${uptownData[n].route}'>${uptownData[n].route}</span> ${parseWait(uptownData[n].time)}`;
            rowData[n] += "</td><td>";
            rowData[n] += n >= downtownData.length ? `-` : `<span class='mta mta_${downtownData[n].route}'>${downtownData[n].route}</span> ${parseWait(downtownData[n].time)}`;
            rowData[n] += "</td></tr>";
        }
        timetable += rowData.join('');
        timetable += '</table>';
        trmnl.output(timetable);
	}catch (err){
	   console.log(err.message);
	   return [1, 'Could not load subway data, check console. Please note that this API requires CORS to be off in your browser.'];
	}
	return 0; // hit no errors, return control to user
};

function parseWait(time) {
    const trainTime = new Date(time);
    const now = new Date();
    const tdiff = Math.floor((trainTime.getTime() - now.getTime())/1000);
    if(tdiff > 0){
        let minuteWait = Math.floor(tdiff/60);
        return `in ${minuteWait} min, ${tdiff-(60*minuteWait)} sec`
    }else{
        return '<i><small>train already left</small></i>';
    }
}
