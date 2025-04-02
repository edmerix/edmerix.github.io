async function mlbReader(args, trmnl) {
    if (typeof args[0] === "undefined" || args[0] == "") {
        return [1, "Need to specify a team to look up (2 or 3 digit code)"];
    }
    let acceptable = [
        "ARI",
        "ATL",
        "BAL",
        "BOS",
        "CHC",
        "CWS",
        "CIN",
        "CLE",
        "COL",
        "DET",
        "FLA",
        "HOU",
        "KAN",
        "LAA",
        "LAD",
        "MIL",
        "MIN",
        "NYM",
        "NYY",
        "OAK",
        "PHI",
        "PIT",
        "SD",
        "SF",
        "SEA",
        "STL",
        "TB",
        "TEX",
        "TOR",
        "WAS",
    ];
    let teamCode = args[0].toUpperCase();
    if (acceptable.indexOf(teamCode) < 0) {
        return [1, "Cannot find team by code " + teamCode];
    }
    let today = new Date();
    let forceNew = today.getTime();
    if (args.length > 1 && typeof args[1] !== "undefined" && args[1] != "") {
        today = new Date(args[1] + " 12:00:00");
        if (today == "Invalid Date") {
            return [1, "Couldn't parse the submitted date"];
        }
        forceNew = "0"; // if it's not a game from today, chances are we don't need to refresh a cached version
    }
    let offset = 0;
    if (today.getHours() < 3) {
        offset = -1;
    }
    const day = ("0" + (today.getDate() + offset)).slice(-2);
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const year = today.getFullYear();

    trmnl.output("Checking MLB data...");

    let url = "https://statsapi.mlb.com/api/v1/teams?sportID=1&now=" + forceNew;
    let teamID = -1;
    let teamName = "";

    try {
        let response = await trmnl.xhrPromise(url);
        let data = JSON.parse(response);
        for (let t = 0; t < data.teams.length; t++) {
            if (
                data.teams[t].abbreviation === teamCode &&
                data.teams[t].sport.id === 1
            ) {
                teamID = data.teams[t].id;
                teamName = data.teams[t].teamName;
            }
        }
        if (teamID < 0) {
            // shouldn't reach this given we already checked against acceptable variable, but just in case
            return [0, `No match for team ${teamCode}, please try again`];
        }
    } catch (err) {
        return [1, "Error loading team data, check console"];
    }

    try {
        const gameURL = `https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&date=${year}-${month}-${day}&now=${forceNew}`;
        const response = await trmnl.xhrPromise(gameURL);
        const data = JSON.parse(response);
        let games = data.dates[0].games;
        let awayGames = [];
        let homeGames = [];
        for (let g = 0; g < games.length; g++) {
            if (games[g].teams.away.team.id == teamID) {
                awayGames.push(g);
            } else if (games[g].teams.home.team.id == teamID) {
                homeGames.push(g);
            }
        }
        let allGames = awayGames.concat(homeGames);
        if (allGames.length < 1) {
            return [0, `No ${teamName} game found for today`]; // TODO: if user supplied own date change this to say the provided date instead!
        }
        let homeawayInv = {}; // easy way to search the opposite value
        homeawayInv.home = "away";
        homeawayInv.away = "home";
        let homeaway = "unknown";
        for (let n = 0; n < allGames.length; n++) {
            if (allGames.length > 1) {
                trmnl.output(
                    `<small><i>Game ${n + 1} of ${allGames.length} today:</i></small><br />`,
                );
            }
            const status = games[allGames[n]].status.statusCode;
            if (homeGames.includes(allGames[n])) {
                homeaway = "home";
            } else if (awayGames.includes(allGames[n])) {
                homeaway = "away";
            }
            const gameURL = `https://statsapi.mlb.com/${games[allGames[n]].link}`;
            // going double nested on xhr promises now, consider re-organizing this into a separate function now that it's been split from core.js
            try {
                const gameResponse = await trmnl.xhrPromise(gameURL);
                const fullData = JSON.parse(gameResponse);
                switch (status) {
                    case "F": // Final
                    case "O": // Game over
                        let winlose = "";
                        if (games[allGames[n]].teams[homeaway].isWinner) {
                            winlose = ": ![win!]";
                        } else {
                            winlose = " :( ";
                        }
                        const awayData = fullData.gameData.teams.away;
                        const homeData = fullData.gameData.teams.home;
                        trmnl.output(`<b>FINAL</b>${winlose}<br />`);
                        trmnl.output(`<small>(<i>${awayData.record.wins}-${awayData.record.losses}</i>)</small> \
               ${awayData.teamName} \
               ![${fullData.liveData.linescore.teams.away.runs}] - ![${fullData.liveData.linescore.teams.home.runs}] \
               ${homeData.teamName} \
               <small>(<i>${homeData.record.wins}-${homeData.record.losses}</i>)</small>`);
                        trmnl.linesep();
                        printScoreboard(trmnl, fullData);
                        break;
                    case "S": // Scheduled
                    case "P": // Pre-game
                    case "PW": // Pre-game, warmup
                        printGamePreview(trmnl, fullData);
                        break;
                    case "I": // In-game
                        printLiveGame(trmnl, fullData);
                        break;
                    default:
                        return [1, `Unknown game state: ${status}`];
                }
            } catch (err) {
                console.log(err.message);
                return [1, "Error loading specific game data, check console"];
            }
            if (n < allGames.length - 1) {
                trmnl.linesep();
            }
        }
    } catch (err) {
        console.log(err.message);
        return [1, "Error loading game data, check console"];
    }
    // Done processing everything without any errors, return access to user:
    return 0;
}

function printScoreboard(trmnl, data) {
    const inningsData = data.liveData.linescore.innings;
    const teamData = data.liveData.linescore.teams;
    let inningsLine = "<tr><th></th>";
    let awayScoreLine = `<tr><td><i>${data.gameData.teams.away.teamName}</i></td>`;
    let homeScoreLine = `<tr><td><i>${data.gameData.teams.home.teamName}</i></td>`;
    for (let i = 0; i < inningsData.length; i++) {
        inningsLine += `<td>${inningsData[i].ordinalNum}</td>`;
        if (inningsData[i].away.hasOwnProperty("runs")) {
            awayScoreLine += `<td>${inningsData[i].away.runs}</td>`;
        } else {
            awayScoreLine += "<td>-</td>";
        }
        if (inningsData[i].home.hasOwnProperty("runs")) {
            homeScoreLine += `<td>${inningsData[i].home.runs}</td>`;
        } else {
            homeScoreLine += "<td>-</td>";
        }
    }

    inningsLine +=
        "<th style='border-left: 1px solid #888; padding-left: 10px;'>R</th><th>H</th><th>E</th><th>LOB</th>";
    let awayRunsHighlight = "";
    let homeRunsHighlight = "";
    if (teamData.away.runs > teamData.home.runs) {
        awayRunsHighlight = " class='cmd-feedback'";
    } else if (teamData.away.runs < teamData.home.runs) {
        homeRunsHighlight = " class='cmd-feedback'";
    }
    let awayHitsHighlight = "";
    let homeHitsHighlight = "";
    if (teamData.away.hits > teamData.home.hits) {
        awayHitsHighlight = " class='cmd-feedback'";
    } else if (teamData.away.hits < teamData.home.hits) {
        homeHitsHighlight = " class='cmd-feedback'";
    }
    let awayErrorsHighlight = "";
    let homeErrorsHighlight = "";
    if (teamData.away.errors > teamData.home.errors) {
        awayErrorsHighlight = " class='cmd-err no-margin'";
    } else if (teamData.away.errors < teamData.home.errors) {
        homeErrorsHighlight = " class='cmd-err no-margin'";
    }

    awayScoreLine += `<td${awayRunsHighlight} style="border-left: 1px solid #888; padding-left: 10px;">${teamData.away.runs}</td>`;
    awayScoreLine += `<td${awayHitsHighlight}>${teamData.away.hits}</td>`;
    awayScoreLine += `<td${awayErrorsHighlight}>${teamData.away.errors}</td>`;
    awayScoreLine += `<td>${teamData.away.leftOnBase}</td>`;
    homeScoreLine += `<td${homeRunsHighlight} style="border-left: 1px solid #888; padding-left: 10px;">${teamData.home.runs}</td>`;
    homeScoreLine += `<td${homeHitsHighlight}>${teamData.home.hits}</td>`;
    homeScoreLine += `<td${homeErrorsHighlight}>${teamData.home.errors}</td>`;
    homeScoreLine += `<td>${teamData.home.leftOnBase}</td>`;

    inningsLine += "</tr>";
    awayScoreLine += "</tr>";
    homeScoreLine += "</tr>";
    trmnl.output(
        `<table>${inningsLine}${awayScoreLine}${homeScoreLine}</table>`,
    );
}

function printLiveGame(trmnl, data) {
    const currentPlay = data.liveData.plays.currentPlay;
    const teamData = data.gameData.teams;
    const ordinals = ["st", "nd", "rd", "th"];
    const ordinal = ordinals[Math.min(currentPlay.about.inning, 4) - 1];
    const linescore = data.liveData.linescore;
    //const innings = linescore.innings;
    //const inning = innings[linescore.currentInning - 1];
    const pitcher = linescore.defense.pitcher.fullName;
    const atBat = linescore.offense.batter.fullName;
    const battingOrder = linescore.offense.battingOrder;
    const inHole = linescore.offense.inHole.fullName;
    const onDeck = linescore.offense.onDeck.fullName;
    const flags = data.gameData.flags; // not currently used, see below for what's in here
    const icons = { Top: "&#x2191;", Bottom: "&#x2193", Middle: "&#x21C6;" };
    // flags.homeTeamNoHitter; flags.homeTeamPerfectGame; flags.awayTeamNoHitter; flags.awayTeamPerfectGame;

    trmnl.output(
        `![<b>LIVE</b>]: ${icons[linescore.inningState]} of the ${currentPlay.about.inning}<sup>${ordinal}</sup>`,
    );

    // is anyone on base?
    let bases = [
        "<sub>&#x25C7;</sub>",
        "<sup>&#x25C7;</sup>",
        "<sub>&#x25C7;</sub>",
    ];
    if (currentPlay.matchup.hasOwnProperty("postOnFirst")) {
        bases[2] = `<sub class='cmd-feedback' title='${currentPlay.matchup.postOnFirst.fullName} on 1st'>&#x25c6;</sub>`;
    }
    if (currentPlay.matchup.hasOwnProperty("postOnSecond")) {
        bases[1] = `<sub class='cmd-feedback' title='${currentPlay.matchup.postOnSecond.fullName} on 2nd'>&#x25c6;</sub>`;
    }
    if (currentPlay.matchup.hasOwnProperty("postOnThird")) {
        bases[0] = `<sub class='cmd-feedback' title='${currentPlay.matchup.postOnThird.fullName} on 3rd'>&#x25c6;</sub>`;
    }

    trmnl.output(`<b>${teamData.away.teamName}</b> ![${linescore.teams.away.runs}] &ndash; ![${linescore.teams.home.runs}] \
	<b>${teamData.home.teamName}</b>`);

    // make hollow or filled circles for number of outs:
    let outmarkers = ["&#9675;", "&#9675;", "&#9675;"];
    for (let p = 0; p < linescore.outs; p++) {
        outmarkers[p] = "&#9679;";
    }
    trmnl.output(
        `${bases.join("")} ${linescore.balls}&ndash;${linescore.strikes} ${outmarkers.join("")}`,
    );

    // print the full scoreboard:
    trmnl.linesep();
    printScoreboard(trmnl, data);

    // print matchup data:
    trmnl.linesep();
    trmnl.output(`Pitching: <i>${pitcher}</i>`);
    trmnl.output(`At bat: ${battingOrder}. <i>${atBat}</i>`);
    trmnl.output(
        `<small><i>${onDeck} on deck, ${inHole} in the hole</i></small>`,
    );

    // if there's a recent description, show it:
    if (currentPlay.result.hasOwnProperty("description")) {
        trmnl.linesep();
        trmnl.output(
            `<small><i>Latest</i>: ${currentPlay.result.description}</small>`,
        );
    }
}

function printGamePreview(trmnl, data) {
    const firstPitch = new Date(Date.parse(data.gameData.datetime.dateTime));
    const awayTeamData = data.gameData.teams.away;
    const homeTeamData = data.gameData.teams.home;
    const venueName = data.gameData.venue.name;
    const weatherData = data.gameData.weather;

    const probPitcherAway = data.gameData.probablePitchers.away.fullName;
    const probPitcherHome = data.gameData.probablePitchers.home.fullName;

    trmnl.output(
        `![Scheduled]: ${awayTeamData.teamName} @ ${homeTeamData.teamName}, first pitch at ${firstPitch.toLocaleTimeString()} (<i>${venueName}</i>)`,
    );
    if (
        weatherData.hasOwnProperty("condition") &&
        weatherData.hasOwnProperty("temp")
    ) {
        trmnl.output(
            `<i>${weatherData.condition} and ${weatherData.temp}&deg;F</i>`,
        );
    }
    if (weatherData.hasOwnProperty("wind")) {
        trmnl.output(`<i>Wind: ${weatherData.wind}</i>`);
    }
    trmnl.linesep();
    trmnl.output(
        `![${awayTeamData.teamName}]: ${awayTeamData.record.wins}-${awayTeamData.record.losses} (${awayTeamData.record.winningPercentage})`,
    );
    trmnl.output(
        `<span class="inset"><i>Probable pitcher</i>: ${probPitcherAway}</span>`,
    );
    trmnl.linesep();
    trmnl.output(
        `![${homeTeamData.teamName}]: ${homeTeamData.record.wins}-${homeTeamData.record.losses} (${homeTeamData.record.winningPercentage})`,
    );
    trmnl.output(
        `<span class="inset"><i>Probable pitcher</i>: ${probPitcherHome}</span>`,
    );
}
