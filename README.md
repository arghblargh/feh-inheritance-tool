## Fire Emblem: Heroes Skill Inheritance Tool

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).


### Data Entry
Scripts are provided to simplify data entry:
 * `npm run stats` - Sends web requests to https://feh-stat-pull.herokuapp.com/, which hosts my [stats API](https://github.com/arghblargh/feh-stat-pull).
 * `npm run templates` - Generates blank entries in the JSON files for missing data (currently only unit templates).
 * `npm run portraits` - Sends web requests to the [Fire Emblem Heroes Wiki](https://feheroes.gamepedia.com/) to retrieve and convert missing unit portrait images. Requires [ImageMagick](https://imagemagick.org/) installed with `magick convert` available from the command line.

 To add new units from the wiki:
  1. Run the `stats` script.
  2. Run the `templates` script.
  2a. If units were missed by the script (usually some wiki data is incorrect/missing), add those manually.
  3. Run the `portraits` script.
  4. Manually fill in data in the JSON files: `units`, `weapons`, `passives`, `specials`, `assists`, `seals`, `upgrades`