// MIT License

// Copyright (c) 2017 Elson Chin

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import React from 'react';
import { Dropdown, escapeRegExp, jsonp, storageAvailable } from './utility.js';

const units = require('./data/units.json');
const baseStats = {
    3: {
        1: require('./data/stats/3_1.json'),
        40: require('./data/stats/3_40.json')
    },
    4: {
        1: require('./data/stats/4_1.json'),
        40: require('./data/stats/4_40.json')
    },
    5: {
        1: require('./data/stats/5_1.json'),
        40: require('./data/stats/5_40.json')
    }
}

const weapons = require('./data/weapons.json');
const assists = require('./data/assists.json');
const specials = require('./data/specials.json');
const passives = require('./data/passives.json');
const seals = require('./data/seals.json');
const upgrades = require('./data/upgrades.json');

// Load movement icons from file
export const moveIcon = {
    "Armored"  : require('./img/icon/movement/Armored.png'),
    "Cavalry"  : require('./img/icon/movement/Cavalry.png'),
    "Flying"   : require('./img/icon/movement/Flying.png'),
    "Infantry" : require('./img/icon/movement/Infantry.png')
};

// Load weapon icons from file
export const weaponIcon = {
    "Red" : {
        "Sword"  : require('./img/icon/weapon/red/Sword.png'),
        "Dragon" : require('./img/icon/weapon/red/Dragon.png'),
        "Tome"   : require('./img/icon/weapon/red/Tome.png'),
        "Bow"    : require('./img/icon/weapon/red/Bow.png')
    },
    "Blue" : {
        "Lance"  : require('./img/icon/weapon/blue/Lance.png'),
        "Dragon" : require('./img/icon/weapon/blue/Dragon.png'),
        "Tome"   : require('./img/icon/weapon/blue/Tome.png'),
        "Bow"    : require('./img/icon/weapon/blue/Bow.png')
    },
    "Green" : {
        "Axe"    : require('./img/icon/weapon/green/Axe.png'),
        "Dragon" : require('./img/icon/weapon/green/Dragon.png'),
        "Tome"   : require('./img/icon/weapon/green/Tome.png'),
        "Bow"    : require('./img/icon/weapon/green/Bow.png')
    },
    "Neutral" : {
        "Bow"    : require('./img/icon/weapon/neutral/Bow.png'),
        "Dagger" : require('./img/icon/weapon/neutral/Dagger.png'),
        "Dragon" : require('./img/icon/weapon/neutral/Dragon.png'),
        "Staff"  : require('./img/icon/weapon/neutral/Staff.png')
    }
};

// Load rarity icons from file
export const rarityIcon = {
    "1" : require('./img/icon/rarity/1.png'),
    "2" : require('./img/icon/rarity/2.png'),
    "3" : require('./img/icon/rarity/3.png'),
    "4" : require('./img/icon/rarity/4.png'),
    "5" : require('./img/icon/rarity/5.png')
};

// Load skill type icons from file
export const skillTypeIcon = {
    "Weapon" : require('./img/icon/skill_type/Weapon.png'),
    "Assist" : require('./img/icon/skill_type/Assist.png'),
    "Special" : require('./img/icon/skill_type/Special.png'),
}

// Load all unit protraits from file
export const unitPortrait = Object.keys(units).reduce(function(previous, current) {
    try {
        previous[current] = require('./img/portrait/' + current.replace(/\s/g, '_').replace(/[!:"]/g, '') + '.png');
    }
    catch (e) {
        previous[current] = require('./img/portrait/_temp.png');
    }
    return previous;
}, {});

const initUnit = 'Abel: The Panther';
const userBuildLabel = '----- User Builds -----';
const wikiBuildLabel = '----- Wiki Builds -----';

// Asynchronously get recommended builds from the wiki and list them in a Dropdown component
export class BuildManager extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            unit: initUnit,
            link: null,
            builds: {},
            userBuilds: {},
            current: wikiBuildLabel,
            newBuild: false,
            newBuildName: '',
            storedBuilds: (storageAvailable('localStorage') && localStorage.userBuilds && JSON.parse(localStorage.userBuilds)) || {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleNewClick = this.handleNewClick.bind(this);
        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.handleLoadClick = this.handleLoadClick.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleBuildNameChange = this.handleBuildNameChange.bind(this);
    }

    componentDidMount() {
        this.retrieveData(initUnit);
    }

    componentWillReceiveProps(props) {
        if (this.state.unit !== props.unitName) {
            this.retrieveData(props.unitName);
            this.setState({ 
                unit: props.unitName,
                newBuild: false,
                newBuildName: '',
                userBuilds: this.state.storedBuilds[props.unitName] ? this.state.storedBuilds[props.unitName] : {}
            });
        }
    }

    handleChange(buildName) {
        this.setState({ 
            newBuild: false,
            newBuildName: '',
            current: buildName 
        });
    }

    handleNewClick() {
        if (!this.state.newBuild) {
            this.setState({
                newBuild: true
            });
        }
    }

    handleBuildNameChange(event) {
        let buildName = event.target.value;
        this.setState({ 
            newBuildName: buildName
        });
    }

    handleSaveClick() {
        let builds = this.state.userBuilds;
        let buildName = this.state.newBuild ? this.state.newBuildName : this.state.current;

        builds[buildName] = {
            Boon: this.props.boonBane.boon,
            Bane: this.props.boonBane.bane,
            Weapon: this.props.skills.weapon,
            Upgrade: this.props.skills.upgrade,
            Assist: this.props.skills.assist,
            Special: this.props.skills.special,
            PassiveA: this.props.skills.passiveA,
            PassiveB: this.props.skills.passiveB,
            PassiveC: this.props.skills.passiveC
        }

        let storedBuilds = this.state.storedBuilds;
        if (storageAvailable('localStorage')) {
            storedBuilds[this.props.unitName] = builds;
            localStorage.userBuilds = JSON.stringify(storedBuilds);
        }

        this.setState({
            newBuild: false,
            userBuilds: builds,
            current: buildName,
            storedBuilds: storedBuilds
        });
    }

    handleLoadClick() {
        if (this.state.current !== wikiBuildLabel && this.state.current !== userBuildLabel) {
            this.props.onLoadClick(this.state.builds[this.state.current] ? this.state.builds[this.state.current] : this.state.userBuilds[this.state.current]);
        }
    }

    handleDeleteClick() {
        if (this.state.newBuild) {
            this.setState({
                newBuild: false
            });
        }
        else if (this.state.userBuilds[this.state.current]) {
            let builds = this.state.userBuilds;
            delete builds[this.state.current];

            let storedBuilds = this.state.storedBuilds;
            if (storageAvailable('localStorage')) {
                storedBuilds[this.props.unitName] = builds;
                localStorage.userBuilds = JSON.stringify(storedBuilds);
            }

            this.setState({
                userBuilds: builds,
                current: userBuildLabel
            });
        }
    }
    
    retrieveData(unitName) {
        jsonp('https://feheroes.gamepedia.com/api.php?action=query&titles=' + unitName.replace(/\s/g, '_') + '/Builds&prop=revisions&rvprop=content&format=json').then(function(data) {
            let responses = [], builds = [],
                match, re = /{{\\?n?(Skillbuild[_ ]Infobox\s?.*?})}/g;
        
            let text = JSON.stringify(data);
            // eslint-disable-next-line
            while (match = re.exec(text)) {
                responses.push(match[1]);
            }
            
            for (var response of responses) {
                var buildName, build = {};
                var hasError = false;
                
                try {
                    buildName = /name\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim();
                }
                catch (e) {
                    console.error('Error retrieving build name.');
                    hasError = true;
                }

                try {
                    if (/ivs/.test(response)) {
                        let bbStr = /ivs\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim();
                        if (!bbStr || /Neutral|Any/i.test(bbStr)) {
                            build.Boon = '';
                            build.Bane = '';
                        } else {
                            build.Boon = /\+(HP|Atk|Spd|Def|Res)/i.exec(bbStr)[1];
                            if (build.Bane !== 'HP')
                                build.Boon = build.Boon.slice(0,1) + build.Boon.slice(1).toLowerCase();
                            build.Bane = /-(HP|Atk|Spd|Def|Res)/i.exec(bbStr)[1];
                            if (build.Bane !== 'HP')
                                build.Bane = build.Bane.slice(0,1) + build.Bane.slice(1).toLowerCase();
                        }
                    }
                }
                catch (e) {
                    console.error('Error retrieving boon/bane: ' + buildName);
                    build.Boon = '';
                    build.Bane = '';
                    hasError = true;
                }

                try {
                    build.Weapon = /weapon=/.test(response) ? /weapon\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.Assist = /assist=/.test(response) ? /assist\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.Special = /special=/.test(response) ? /special\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.PassiveA = /passiveA=/.test(response) ? /passiveA\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.PassiveB = /passiveB=/.test(response) ? /passiveB\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.PassiveC = /passiveC=/.test(response) ? /passiveC\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.Seal = /seal=/.test(response) ? /seal\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';

                    build.Weapon = build.Weapon.replace(/Blar/, 'Blár').replace(/Raudr/, 'Rauðr').replace(/Urdr/, 'Urðr');

                    if (/^Atk\/(Def|Res)/.test(build.PassiveA)) {
                        if (/Def/.test(build.PassiveA)) {
                            build.PassiveA = build.PassiveA.replace('Atk/Def ', 'Attack/Def +');
                        }
                        else if (/Res/.test(build.PassiveA)) {
                            build.PassiveA = build.PassiveA.replace('Atk', 'Attack');
                        }
                    }
                    
                    if (/weaponRefine=/.test(response)) {
                        let upgrade = /weaponRefine\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim().toLowerCase();
                        switch (upgrade) {
                            case 'skill':
                                build.Upgrade = units[unitName].wpnType === 'Staff' ? 'W' : 'X';
                                break;
                            case 'atk':
                                build.Upgrade = 'A';
                                break;
                            case 'spd':
                                build.Upgrade = 'S';
                                break;
                            case 'def':
                                build.Upgrade = 'D';
                                break;
                            case 'res':
                                build.Upgrade = 'R';
                                break;
                            case 'skill2':
                                build.Upgrade = 'D';
                                break;
                            default:
                                build.Upgrade = '';
                                break;
                        }
                    }

                    for (let i in build) {
                        if (/^\s*flexible\s*$/i.test(build[i]))
                            build[i] = '';
                    }
                }
                catch (e) {
                    console.error('Error retrieving skills: ' + buildName);
                    build = units[unitName].skills;
                    hasError = true;
                }

                if (hasError)
                    buildName += ' !!Error!!';

                if (buildName.length > 0 && buildName !== '-')
                    builds[buildName] = build;
            }
            
            this.setState({
                link: "https://feheroes.gamepedia.com/" + unitName.replace(/\s/g, '_') + "/Builds",
                builds: builds,
                current: builds[this.state.current] ? this.state.current : wikiBuildLabel,
                userBuilds: this.state.storedBuilds[unitName] ? this.state.storedBuilds[unitName] : {}
            });
        }.bind(this));
    }

    render() {
        let buildSelect = null;
        let numWikiBuilds = Object.keys(this.state.builds).length;
        let numUserBuilds = Object.keys(this.state.userBuilds).length;
        let buildList = [wikiBuildLabel].concat(Object.keys(this.state.builds));
        if (numUserBuilds > 0)
            buildList = buildList.concat([userBuildLabel].concat(Object.keys(this.state.userBuilds)));

        if (numWikiBuilds + numUserBuilds > 0) {
            if (numWikiBuilds > 0) {
                buildSelect = <Dropdown id="BuildSelectDropdown"
                                options={buildList}
                                value={this.state.current}
                                onChange={this.handleChange} />;
            } else {
                buildSelect = <Dropdown id="BuildSelectDropdown"
                                options={['No Recommended Builds']}
                                value={'No Recommended Builds'} />;
            }
        } else {
            buildSelect = <Dropdown id="BuildSelectDropdown"
                                    options={['Loading...']}
                                    value={'Loading...'} />;
        }

        let canSave = this.state.newBuild || this.state.userBuilds[this.state.current];

        return (
            <div className="build-manager">
                <div className="select">{buildSelect}</div>
                {this.state.newBuild &&
                <div>
                    <input name="buildName" type="text" placeholder="Enter Build Name" onChange={this.handleBuildNameChange} />
                </div>
                }
                <div className="link"><a href={this.state.link} target="_blank">More Info...</a></div>
                <div className="buttons">
                    <button onClick={this.handleNewClick}>New</button>
                    <button onClick={this.handleDeleteClick} hidden={!canSave}>{this.state.newBuild ? 'Cancel' : 'Delete'}</button>
                    <button onClick={this.handleSaveClick} disabled={!canSave}>Save</button>
                    <button onClick={this.handleLoadClick}>Load</button>
                </div>
            </div>
        )
    }
}

// Parses skills. Returns an object of { skillType : skillName }
export function parseSkills(skillData) {
    var skills = {};
    skills.weapon = skillData.weapon ? skillData.weapon[skillData.weapon.length-1].name : '';
    skills.assist = skillData.assist ? skillData.assist[skillData.assist.length-1].name : '';
    skills.special = skillData.special ? skillData.special[skillData.special.length-1].name : '';
    skills.passiveA = skillData.passiveA ? skillData.passiveA[skillData.passiveA.length-1].name : '';
    skills.passiveB = skillData.passiveB ? skillData.passiveB[skillData.passiveB.length-1].name : '';
    skills.passiveC = skillData.passiveC ? skillData.passiveC[skillData.passiveC.length-1].name : '';
    skills.seal = '';

    return skills;
}

// Gets an object of all units that can learn a skill { Rarity# : [UnitList] }
export function getUnitsWithSkill(skill, type) {
    if (!['weapon','assist','special','passiveA','passiveB','passiveC'].includes(type)) return null;

    var reSkill = RegExp('^' + escapeRegExp(skill) + '$');
    var unitList = {};
    
    for (let unit in units) {
        let skillData = units[unit].skills[type];
        if (skillData) {
            for (let skl of skillData) {
                if (reSkill.test(skl.name)) {
                    var rarity = 5;
                    if (skl.unlock)
                        rarity = skl.unlock;
                    if (!unitList[rarity])
                        unitList[rarity] = [];
                    unitList[rarity].push(unit);
                }
            }
        }
    }
    return unitList;
}

// Returns an array of a unit's default skills
function getDefaultSkills(unit) {
    var skills = [];
    var skillData = units[unit].skills;
    
    for (let type in skillData) {
        for (let skill of skillData[type]) {
            skills.push(skill.name);
        }
    }
    return skills;
}

// Returns the lowest available rarity of a unit, down to 3★
export function getLowestRarity(unit) {
    for (let i = 3; i <= 5; i++) {
        if (baseStats[i][1][unit])
            return i;
    }
}

function getWeaponUpgrade(unit) {
    var maxWeapon = units[unit].skills.weapon[units[unit].skills.weapon.length - 1].name;
    
    if (upgrades.Evolve[maxWeapon]) {
        if (upgrades.Evolve[maxWeapon].unit && upgrades.Evolve[maxWeapon].unit.includes(unit))
            return upgrades.Evolve[maxWeapon].weapon;
        else
            return upgrades.Evolve[maxWeapon];
    }

    return null;
}

export function getUpgradeEffect(weapon, upgrade, unitName) {
    if (upgrade === 'X') {
        if (upgrades[weapon].units)
            return upgrades[weapon].units.find(unit => unit.name.split(',').includes(unitName)).effect;
        else
            return upgrades[weapon].effect;
    }
    else if (upgrades[weapon] && upgrades[weapon].common)
        return upgrades[weapon].common.effect;
    else
        return weapons[weapon].effect;
}

// Check inheritance restrictions.
function checkRestrictions(unit, skill, restrictions, limitStaff = false, color = '') {
    let unitData = units[unit].color + ' ' + units[unit].wpnType + ' ' + units[unit].movType;
    
    if (color) {
        let colorList = color.split(', ');
        let containsColor = false;
        for (let c of colorList) {
            if (RegExp(c).test(unitData)) {
                containsColor = true;
                break;
            }
        }
        if (!containsColor)
            return false;
    }

    if (restrictions) {
        let rstr = restrictions.split(', ');
        for (let r of rstr) {
            if (RegExp(r).test(unit))
                return true;

            if (/Exclusive/.test(r)) {
                if (getDefaultSkills(unit).includes(skill))
                    return true;
                if (getWeaponUpgrade(unit) === skill)
                    return true;
            }

            if (/Offense/.test(r) && !/Staff/.test(unitData))
                return true;

            if (limitStaff && /Staff/.test(unitData) && !/Staff/.test(r))
                return false;
                    
            if (/Melee/.test(r) && /Sword|Lance|Axe|Dragon/.test(unitData))
                return true;

            if (/Ranged/.test(r) && /Bow|Dagger|Tome|Staff/.test(unitData))
                return true;

            if (/Color/.test(r)) {
                let flags = /Color:(.*)/.exec(r)[1];
                if (/R/.test(flags) && /Red/.test(unitData))
                    return true;
                else if (/B/.test(flags) && /Blue/.test(unitData))
                    return true;
                else if (/G/.test(flags) && /Green/.test(unitData))
                    return true;
                else if (/N/.test(flags) && /Neutral/.test(unitData))
                    return true;
                    
                return false;
            }

            if (/Weapon/.test(r)) {
                let flags = /Weapon:(.*)/.exec(r)[1];
                if (/Sw/.test(flags) && /Sword/.test(unitData))
                    return true;
                else if (/L/.test(flags) && /Lance/.test(unitData))
                    return true;
                else if (/A/.test(flags) && /Axe/.test(unitData))
                    return true;
                else if (/Dr/.test(flags) && /Dragon/.test(unitData))
                    return true;
                else if (/Tr/.test(flags) && /Tome/.test(unitData) && /Red/.test(unitData))
                    return true;
                else if (/Tb/.test(flags) && /Tome/.test(unitData) && /Blue/.test(unitData))
                    return true;
                else if (/Tg/.test(flags) && /Tome/.test(unitData) && /Green/.test(unitData))
                    return true;
                else if (/B/.test(flags) && /Bow/.test(unitData))
                    return true;
                else if (/Da/.test(flags) && /Dagger/.test(unitData))
                    return true;
                else if (/St/.test(flags) && /Staff/.test(unitData))
                    return true;

                return false;
            }
            
            if (!RegExp(r).test(unitData))
                return false;
        }
    }
    
    return true;
}

// Returns an object containing lists of all inheritable skills for a unit
export function getPossibleSkills(unit) {
    let skills = {};
    skills.weapons = ['', ...new Set(Object.keys(weapons).filter(skill =>  
        checkRestrictions(unit, skill, weapons[skill].type + (weapons[skill].restriction ? ', ' + weapons[skill].restriction : ''), false, weapons[skill].color)))];
    skills.assists = ['', ...new Set(Object.keys(assists).filter(skill =>
        checkRestrictions(unit, skill, assists[skill].restriction, true)))];
    skills.specials = ['', ...new Set(Object.keys(specials).filter(skill =>
        checkRestrictions(unit, skill, specials[skill].restriction, true)))];
    skills.passivesA = ['', ...new Set(Object.keys(passives.A).filter(skill =>
        checkRestrictions(unit, skill, passives.A[skill].restriction)).map(name => { 
            return /[^1-9]*/i.exec(name)[0];
        }))];
    skills.passivesB = ['', ...new Set(Object.keys(passives.B).filter(skill =>
        checkRestrictions(unit, skill, passives.B[skill].restriction)).map(name => { 
            return /[^1-9]*/i.exec(name)[0];
        }))];
    skills.passivesC = ['', ...new Set(Object.keys(passives.C).filter(skill =>
        checkRestrictions(unit, skill, passives.C[skill].restriction)).map(name => { 
            return /[^1-9]*/i.exec(name)[0];
        }))];
    skills.seals = ['', ...new Set(Object.keys(seals).filter(skill =>
        checkRestrictions(unit, skill, seals[skill].restriction)).map(name => { 
            return /[^1-9]*/i.exec(name)[0];
        }))];

    return skills;
}

// Apply stat mods to stats.
function addStatMods(stats, mod) {
    if (stats) {
        stats.HP += mod[0];
        stats.Atk += mod[1];
        stats.Spd += mod[2];
        stats.Def += mod[3];
        stats.Res += mod[4];
    }
    else {
        stats = {
            HP: mod[0],
            Atk: mod[1],
            Spd: mod[2],
            Def: mod[3],
            Res: mod[4]
        }
    }

    return stats;
}

// Calculate merge bonuses. Returns array with total stat increases.
// +1: Highest and second highest base stat
// +2: Third and fourth highest base stat
// +3: Fifth and highest base stat
// +4: Second and third highest base stat
// +5: Fourth and fifth highest base stat
// +6~10: Repeat
// In case of tie: HP > Atk > Spd > Def > Res
function calcMergeBonus(unit, rarity, merge, boonBaneMod) {
    if (!baseStats[rarity][1][unit])
        return [0, 0, 0, 0, 0];
    
    let sortedStats = [];
    for (let stat in baseStats[5][1][unit]) {
        sortedStats.push({
            "stat": stat,
            "value": baseStats[5][1][unit][stat],
            "bonus": 0
        });
    }
    for (let i in sortedStats) {
        sortedStats[i].value += Math.sign(boonBaneMod[i]);
    }
    sortedStats.sort((a,b) => { return b.value - a.value; });
    
    let index = 0;
    for (let i = 0; i < merge; i++) {
        sortedStats[index++].bonus += 1;
        if (index > 4) index = 0;
        sortedStats[index++].bonus += 1;
        if (index > 4) index = 0;
    }
    
    let resultMod = [0,0,0,0,0];
    for (let stat of sortedStats) {
        switch (stat.stat) {
            case 'HP':
                resultMod[0] = stat.bonus;
                break;
            case 'Atk':
                resultMod[1] = stat.bonus;
                break;
            case 'Spd':
                resultMod[2] = stat.bonus;
                break;
            case 'Def':
                resultMod[3] = stat.bonus;
                break;
            case 'Res':
                resultMod[4] = stat.bonus;
                break;
            default:
        }
    }
    return resultMod;
}

// Calculate unit stats
export function calcStats(unit, skills, rarity = 5, level = 40, boonBane = null, merge = 0, summonerRank = '') {
    let totalMod = [0,0,0,0,0]; // HP, Atk, Spd, Def, Res
    let temp;
    
    let baseBonus = level === 40 ? 3 : 1;
    if (boonBane) {
        if (boonBane.boon) {
            let boon = (rarity === 5 && level === 40 && units[unit].boon && units[unit].boon.includes(boonBane.boon)) ? 4 : baseBonus;
            totalMod[boonBane.boon === "HP"  ? 0 :
                    boonBane.boon === "Atk" ? 1 :
                    boonBane.boon === "Spd" ? 2 :
                    boonBane.boon === "Def" ? 3 :
                /*boonBane.boon === "Res" ?*/ 4 ] += boon;
        }
        if (boonBane.bane) {
            let bane = (rarity === 5 && level === 40 && units[unit].bane && units[unit].bane.includes(boonBane.bane)) ? 4 : baseBonus;
            totalMod[boonBane.bane === "HP"  ? 0 :
                    boonBane.bane === "Atk" ? 1 :
                    boonBane.bane === "Spd" ? 2 :
                    boonBane.bane === "Def" ? 3 :
                /*boonBane.bane === "Res" ?*/ 4 ] -= bane;
        }
    }

    let mergeMod = calcMergeBonus(unit, rarity, merge, totalMod);
    totalMod = totalMod.map((x,i) => { return x + mergeMod[i]; });

    if (skills) {
        if (skills.weapon && weapons[skills.weapon]) {
            totalMod[1] += weapons[skills.weapon].might;
            // applyWeaponStats();
            applySkillStats(skills.weapon, skills.upgrade ? 'U' : 'W');

            if (skills.upgrade) {
                temp = getUpgradeStats();
                totalMod = totalMod.map((x, i) => { return x + temp[i]; });
            }
        }
        
        applySkillStats(skills.passiveA, 'A');
        applySkillStats(skills.seal, 'S');
        applySummonerSupportBonus();
    }

    return addStatMods(baseStats[rarity][level][unit] ? JSON.parse(JSON.stringify(baseStats[rarity][level][unit])) : null, totalMod);

    function applySkillStats(skill, type) {
        if (!skill || skill === 'undefined') return;
        
        if (/HP \+\d/.test(skill)) {
            totalMod[0] += parseInt((/[1-9]/.exec(skill)), 10);
            return;
        }
        else if (/HP\/\w+ \d/.test(skill)) {
            let match = /HP\/(\w+) (\d)/.exec(skill);
            temp = parseInt(match[2], 10);
            totalMod[0] += temp + 2;
            totalMod[match[1] === 'Atk' ? 1 :
                     match[1] === 'Spd' ? 2 :
                     match[1] === 'Def' ? 3 :
                                          4 ] += temp;
        }

        let skillData = type === 'S' ? seals[skill] :
                        type === 'W' ? weapons[skill] : 
                        type === 'U' ? { effect: getUpgradeEffect(skills.weapon, skills.upgrade, unit) } :
                                       passives[type][skill];
        
        try {
            let matches = [];
            if (/(?:Grants |^)([\w/]+\s?[+]\d)(?:\.| and)/.test(skillData.effect))
                matches.push(/(?:Grants |^)([\w/]+\s?[+]\d)(?:\.| and)/.exec(skillData.effect)[1]);
            if (/(?:Inflicts |^)([\w/]+\s?[-]\d)(?:\.| and)/.test(skillData.effect))
                matches.push(/(?:Inflicts |^)([\w/]+\s?[-]\d)(?:\.| and)/.exec(skillData.effect)[1]);
            for (let match of matches) {
                let bonus = /^([\w/]+)\s?(\+|-)(\d)$/.exec(match);
                let sign = bonus[2] === '+' ? 1 : -1;
                temp = parseInt(bonus[3], 10);
                for (let stat of bonus[1].split('/')) {
                    if (/HP/.test(stat))
                        totalMod[0] += temp * sign;
                    if (/Atk|Attack/.test(stat))
                        totalMod[1] += temp * sign;
                    if (/Spd|Speed/.test(stat))
                        totalMod[2] += temp * sign;
                    if (/Def|Defense/.test(stat))
                        totalMod[3] += temp * sign;
                    if (/Res|Resistance/.test(stat))
                        totalMod[4] += temp * sign;
                }
            }
        }
        catch (e) {
            console.error('Error calculating skill stats (' + skill + ', ' + skillData + ')');
        }
    }
    
    function applySummonerSupportBonus() {
        switch (summonerRank) {
            case 'S':
                totalMod[0] += 1;
                totalMod[1] += 2;
                // eslint-disable-next-line
            case 'A':
                totalMod[2] += 2;
                // eslint-disable-next-line
            case 'B':
                totalMod[0] += 1;
                totalMod[3] += 2;
                // eslint-disable-next-line
            case 'C':
                totalMod[0] += 3;
                totalMod[4] += 2;
                // eslint-disable-next-line
            default:
                break;
        }
    }

    function getUpgradeStats() {
        var flags = weapons[skills.weapon].upgrade;
        var upgradeMod;
        var upgrade;

        switch(skills.upgrade) {
            case 'X':
                upgrade = 'Special';
                break;
            case 'A':
                upgrade = 'Attack';
                break;
            case 'S':
                upgrade = 'Speed';
                break;
            case 'D':
                upgrade = 'Defense';
                break;
            case 'R':
                upgrade = 'Resistance';
                break;
            default:
                return [0, 0, 0, 0, 0];
        }

        if (upgrade === 'Special') {
            upgradeMod = JSON.parse(JSON.stringify(upgrades[skills.weapon].stats));
        }
        else if (/Sword|Lance|Axe|Dragon/.test(weapons[skills.weapon].type))
            upgradeMod = JSON.parse(JSON.stringify(upgrades.Melee[upgrade]));
        else if (/Bow|Dagger|Tome/.test(weapons[skills.weapon].type))
            upgradeMod = JSON.parse(JSON.stringify(upgrades.Ranged[upgrade]));
        else
            upgradeMod = [0, 0, 0, 0, 0];

        if (/Mt:/.test(flags)) {
            upgradeMod[1] += parseInt(/Mt:(\d+)/.exec(flags)[1], 10);
        }

        return upgradeMod;
    }
}

// Searches for and returns the object containing data for a skill
function getSkillData(skill) {
    return weapons[skill] || assists[skill] || specials[skill] || passives.A[skill] || passives.B[skill] || passives.C[skill];
}

// Calculates the total SP cost of inheriting a skill
export function calcCost(unit, skill, upgrade = null) {
    if (!skill || !getSkillData(skill)) return 0;

    var defaultSkills = new Set();
    var skillData = getSkillData(skill);
    var skillCost;

    for (let type in units[unit].skills)
        for (let skl of units[unit].skills[type])
            if (skl.name)
                defaultSkills.add(skl.name);
    
    // If unit already has skill
    if (defaultSkills.has(skill))
        skillCost = 0;
    // If skill is a + weapon and unit has the base weapon
    else if (/\+$/.test(skill)) {
        // Unit has the base weapon
        if (defaultSkills.has(/[^+]*/.exec(skill)[0]))
            skillCost = skillData.cost * 1.5;
        else {
            var baseWeapon = Object.keys(upgrades.Evolve).find(base => upgrades.Evolve[base] === skill);
            if (baseWeapon)
                skillCost = skillData.cost * 1.5 + calcCost(unit, baseWeapon);
            else
                skillCost = skillData.cost * 1.5 + calcCost(unit, /[^+]*/.exec(skill)[0]);
        }
    }
    // If skill has specific prerequisites
    else if (skillData.require) {
        // If skill prerequisites can be fulfilled by multiple skills
        if (/\|/.test(skillData.require))
            skillCost = skillData.cost * 1.5 + Math.min(calcCost(unit, /(.*)\|/.exec(skillData.require)[1]),
                                                   calcCost(unit, /\|(.*)/.exec(skillData.require)[1]));
        // Return 1.5xCost + cost of prerequisites
        else 
            skillCost = skillData.cost * 1.5 + calcCost(unit, skillData.require);
    }
    // If skill is the second or third skill in a series
    else if (/[2-9]/.test(skill)) {
        let prereq = skill.slice(0, skill.length-1) + (skill.slice(skill.length-1)-1);
        skillCost = skillData.cost * 1.5 + (getSkillData(prereq) ? calcCost(unit, prereq) : 0);
    }
    else
        skillCost = skillData.cost * 1.5;

    // If weapon upgrade is selected
    if (upgrade && weapons[skill] && weapons[skill].upgrade) {
        if (/Legendary/.test(weapons[skill].upgrade))
            skillCost += 400;
        else
            skillCost += 350;
    }
    
    return skillCost;
}

// Calculates the total SP costs of a build
export function calcTotalCost(unit, skills) {
    let skillCosts = [
        calcCost(unit, skills.weapon, skills.upgrade),
        calcCost(unit, skills.assist),
        calcCost(unit, skills.special),
        calcCost(unit, skills.passiveA),
        calcCost(unit, skills.passiveB),
        calcCost(unit, skills.passiveC)
    ];

    return skillCosts.reduce((a,b) => { return b ? a + b : a; });
}