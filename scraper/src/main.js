const axios = require('axios');
const $ = require('cheerio');
const fs = require('fs')
const baseUrl = "https://www.fanchants.com";
const leagues = [
    "/football-league/german-bundesliga-1/",
    "/football-league/premiership/",
    "/football-league/spanish-liga-1/",
    "/football-league/italy-serie/",
    "/football-league/french-ligue-1/"
];

const leaguesCountries = {
    "/football-league/german-bundesliga-1/": {
        name: "Germany",
        icon: "048-germany.svg"
    },
    "/football-league/premiership/": {
        name: "England",
        icon: "110-england.svg"
    },
    "/football-league/spanish-liga-1/": {
        name: "Spain",
        icon: "017-spain.svg"
    },
    "/football-league/italy-serie/": {
        name: "Italy",
        icon: "013-italy-1.svg"
    },
    "/football-league/french-ligue-1/": {
        name:"France",
        icon: "065-france.svg"
    }
}

async function scrapeChantsFromPage(url) {
    const html = await axios.get(url);
    const page = $.load(html.data);
    const chantContainers = page('#all-chants [data-has-audio=True] .play-button');
    const name = page('#pjax-container > div > div:nth-child(3) > div > section > h2').text().replace("Fan's Songs", "").trim();
    const relativeUrls = chantContainers.map(function(el,i) {return $(this).attr("href")}).get();
    return [name, relativeUrls.map(el => baseUrl + el)];
}

async function scrapeChantsFromLeague(leagueUrl) {
    const html = await axios.get(leagueUrl);
    const page = $.load(html.data);
    const chantContainers = page('tbody > tr > td > a');
    return chantContainers.map(function(el,i) {
        return $(this).attr("href")
    }).get().filter(url => url.includes("/football-team/"));
}

async function scrapeAllLeagues() {
    const data = {};
    const teams = [];
    await Promise.all(leagues.map(async league => {
        data[league] = {};
        const teamUrls = await scrapeChantsFromLeague(baseUrl + league);
        await Promise.all(teamUrls.map(async teamUrl => {
            let [name, chants] = await scrapeChantsFromPage(baseUrl + teamUrl);
            data[league][teamUrl] = chants;
            teams.push({name, country: leaguesCountries[league], chants: chants.map(chant=>({name:"",url:chant,icon:""}))});
        }));
    }));
    console.log(JSON.stringify(data));
    fs.writeFile("../../chrome-extension/src/assets/teams.json", JSON.stringify(teams), err => {
        if (err) {
            console.error(err)
        }
    })
}

scrapeAllLeagues();