const fs = require('fs');
const icons = JSON.parse(fs.readFileSync('icons.json', 'utf8'));
const teams = JSON.parse(fs.readFileSync('teams.json', 'utf8'));

async function mapIcons() {
  const genTeams = [];
  await Promise.all(teams.map(async team => {
    team.iconUrl = icons[team.name];
    genTeams.push(team);
  }));
  fs.writeFileSync("teams_gen.json", JSON.stringify(genTeams));
}

mapIcons();
