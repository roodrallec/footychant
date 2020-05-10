const axios = require("axios")
const $ = require('cheerio');

const baseUrl = "https://www.fanchants.com";

async function scrapeChantsFromPage(url) {
    const html = await axios.get(url);
    const page = $.load(html.data);
    const chantContainers = page('#all-chants [data-has-audio=True] .play-button');
    const relativeUrls = chantContainers.map(function(el,i) {return $(this).attr("href")}).get();
    return relativeUrls.map(el => baseUrl + el);
}

scrapeChantsFromPage("https://www.fanchants.com/football-team/liverpool/").then(
    chants=> console.log(JSON.stringify(chants))
);