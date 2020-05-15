const fs = require('fs')

const teams = JSON.parse(fs.readFileSync("../../chrome-extension/src/assets/teams.json"))
const icons = JSON.parse(fs.readFileSync("../../chrome-extension/src/assets/icons.json"))

for(let team of teams) {
    const icon = icons[team.name]
    if(icon) {
        team["icon"] = icon
    }
}

fs.writeFileSync("../../chrome-extension/src/assets/teamsWithIcons.json", JSON.stringify(teams))
