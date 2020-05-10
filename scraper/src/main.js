const axios = require('axios');
const $ = require('cheerio');
const baseUrl = "https://www.fanchants.com";
const leagues = [
    "/football-league/german-bundesliga-1/",
    "/football-league/premiership/",
    "/football-league/spanish-liga-1/",
    "/football-league/italy-serie/",
    "/football-league/french-ligue-1/"
];

async function scrapeChantsFromPage(url) {
    const html = await axios.get(url);
    const page = $.load(html.data);
    const chantContainers = page('#all-chants [data-has-audio=True] .play-button');
    const relativeUrls = chantContainers.map(function(el,i) {return $(this).attr("href")}).get();
    return relativeUrls.map(el => baseUrl + el);
}

async function scrapeChantsFromLeague(leagueUrl) {
    const html = await axios.get(leagueUrl);
    const page = $.load(html.data);
    const chantContainers = page('a');
    return chantContainers.map(function(el,i) {
        return $(this).attr("href")
    }).get().filter(url => url.includes("/football-team/"));
}

async function scrapeAllLeagues() {
    const data = {};
    await Promise.all(leagues.map(async league => {
        data[league] = {};
        const teamUrls = await scrapeChantsFromLeague(baseUrl + league);
        await Promise.all(teamUrls.map(async teamUrl => {
            let chants = await scrapeChantsFromPage(baseUrl + teamUrl);
            data[league][teamUrl] = chants;
        }));
    }));
    console.log(JSON.stringify(data));
}

scrapeAllLeagues();