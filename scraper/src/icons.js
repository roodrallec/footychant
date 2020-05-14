const axios = require('axios');
const $ = require('cheerio');
const fs = require('fs')
const baseUrl = "https://en.wikipedia.org"
const searchUrl = "/w/index.php?cirrusUserTesting=control&sort=relevance&title=Special:Search&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1&search=";
const icons = JSON.parse(fs.readFileSync('icons.json', 'utf8'));

async function scrape() {
    let iconsGen = {};
    await Promise.all(Object.keys(icons).map(async team => {
        if (icons[team]) {
            iconsGen[team] = icons[team];
            return;
        }

        let search = baseUrl + searchUrl + team.replace(/ /g, '+') + "+football";
        search = await axios.get(search);
        search = $.load(search.data);
        search = search('.mw-search-result-heading > a');
        search = search.map(function(el,i) {
            return $(this).attr("href")
        }).get()[0];

        if (!search) return
        console.log(search);

        search = await axios.get(baseUrl + search);
        search = $.load(search.data);
        search = search('.image > img');
        search = search.map(function(el,i) {
            return $(this).attr("src")
        }).get()[0];

        if (!search) return
        search = search.split('/').filter(p => p && p != 'thumb' && !p.includes('.svg.png')).join('/');

        if (!search) return;
        console.log(search);

        iconsGen[team] = "https://" + search;
    }));
    console.log('writing to file!');
    fs.writeFileSync("icons_gen.json", JSON.stringify(iconsGen));
}

scrape();