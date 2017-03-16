import React from 'react';

const units = require('./data/units.json');
const weapons = require('./data/weapons.json');
const assists = require('./data/assists.json');
const specials = require('./data/specials.json');
const passives = require('./data/passives.json');

// Escape RegExp string
function escapeRegExp(str) {
    // eslint-disable-next-line
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

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
        "Tome"   : require('./img/icon/weapon/red/Tome.png')
    },
    "Blue" : {
        "Lance"  : require('./img/icon/weapon/blue/Lance.png'),
        "Dragon" : require('./img/icon/weapon/blue/Dragon.png'),
        "Tome"   : require('./img/icon/weapon/blue/Tome.png')
    },
    "Green" : {
        "Axe"    : require('./img/icon/weapon/green/Axe.png'),
        "Dragon" : require('./img/icon/weapon/green/Dragon.png'),
        "Tome"   : require('./img/icon/weapon/green/Tome.png')
    },
    "Neutral" : {
        "Bow"    : require('./img/icon/weapon/neutral/Bow.png'),
        "Dagger" : require('./img/icon/weapon/neutral/Dagger.png'),
        "Staff"  : require('./img/icon/weapon/neutral/Staff.png')
    }
};

// Dropdown list React component
export const Dropdown = React.createClass({
    propTypes: {
        id: React.PropTypes.string.isRequired,
        options: React.PropTypes.array.isRequired,
        value: React.PropTypes.oneOfType(
            [
                React.PropTypes.number,
                React.PropTypes.string
            ]
        ),
        onChange: React.PropTypes.func
    },

    render: function() {
        var self = this;
        var options = self.props.options.map(function(option) {
            return (
                <option key={option} value={option}>
                    {option}
                </option>
            )
        });
        return (
            <select id={this.props.id} 
                    className='form-control' 
                    value={this.props.value} 
                    onChange={this.handleChange}>
                {options}
            </select>
        )
    },

    handleChange: function(e) {
        this.props.onChange(e.target.value);
    }
});

// Parses skills. Returns an object of { skillType : skillName }
export function parseSkills(skillData) {
    var skills = {};
    skills.weapon = Array.isArray(skillData.weapon) ? skillData.weapon[skillData.weapon.length-1].name 
                                                    : skillData.weapon.name;
    skills.assist = Array.isArray(skillData.assist) ? skillData.assist[skillData.assist.length-1].name 
                                                    : skillData.assist.name;
    skills.special = Array.isArray(skillData.special) ? skillData.special[skillData.special.length-1].name 
                                                      : skillData.special.name;
    skills.passiveA = Array.isArray(skillData.passiveA) ? skillData.passiveA[skillData.passiveA.length-1].name 
                                                        : skillData.passiveA.name;
    skills.passiveB = Array.isArray(skillData.passiveB) ? skillData.passiveB[skillData.passiveB.length-1].name 
                                                        : skillData.passiveB.name;
    skills.passiveC = Array.isArray(skillData.passiveC) ? skillData.passiveC[skillData.passiveC.length-1].name 
                                                        : skillData.passiveC.name;
    
    return skills;
}

// Gets a string of all units that can learn a skill
export function getUnitsWithSkill(skill, type) {
    if (!['weapon','assist','special','passiveA','passiveB','passiveC'].includes(type)) return null;

    var reSkill = RegExp(escapeRegExp(skill) + '$');
    var unitList = [];
    
    for (var unit in units) {
        var skillData = units[unit].skills[type];
        if (Array.isArray(skillData)) {
            for (var index in skillData) {
                if (reSkill.test(skillData[index].name)) {
                    unitList.push(unit + ' (' + skillData[index].unlock + '*)');
                }
            }
        } else if (reSkill.test(skillData.name)) {
            unitList.push(unit + ' (' + skillData.unlock + '*)');
        }
    }
    return unitList;
}

// Builds list of max skills of a type
function buildSkillList(type) {
    var skillList = new Set();
    for (var unit in units) {
        var skillData = units[unit].skills[type];
        if (skillData !== '') {
            if (Array.isArray(skillData)) {
                for (var index in skillData) {
                    skillList.add(skillData[index].name);
                }
            } else if (skillData.name) {
                skillList.add(skillData.name);
            }
        }
    }
    return Array.from(skillList);
}

// Check inheritance restrictions.
function checkRestrictions(unit, restrictions, color = '') {
    var unitData = unit + ' ' + units[unit].color + ' ' + units[unit].wpnType + ' ' + units[unit].movType;
    var rstr = restrictions.split(', ');
    var re;
    
    if (color) {
        var colorList = color.split(', ');
        var containsColor = false;
        for (var c in colorList) {
            re = RegExp(colorList[c]);
            if (re.test(unitData)) {
                containsColor = true;
                break;
            }
        }
        if (!containsColor)
            return false;
    }

    for (var r in rstr) {
        if (/Melee/.test(rstr[r])) {
            if (/Sword|Lance|Axe/.test(unitData))
                return true;
        }
        if (/Units/.test(rstr[r])) {
            var unitRstr = /Units:(.*)\s?/.exec(rstr[r])[1].split(',');
            var unitTest = false;
            for (var index in unitRstr) {
                if (RegExp(unitRstr[index]).test(unitData))
                    unitTest = true;
            }
            return unitTest;
        }
        if (/Color/.test(rstr[r])) {
            var flags = /Color:(.*)/.exec(rstr[r])[1];
            var colorTest = false;
            if (/R/.test(flags) && /Red/.test(unitData))
                colorTest = true;
            else if (/B/.test(flags) && /Blue/.test(unitData))
                colorTest = true;
            else if (/G/.test(flags) && /Green/.test(unitData))
                colorTest = true;
                
            return colorTest;
        }
        re = RegExp(rstr[r]);
        if (!re.test(unitData))
            return false;
    }
    
    return true;
}

// Returns an object containing lists of all inheritable skills for a unit
export function getPossibleSkills(unit) {
    var skills = {};
    skills.weapons = ['']; 
    skills.assists = ['']; 
    skills.specials = ['']; 
    skills.passivesA = ['']; 
    skills.passivesB = ['']; 
    skills.passivesC = [''];

    var wpnList = buildSkillList('weapon');
    var astList = buildSkillList('assist');
    var spcList = buildSkillList('special');
    var psAList = buildSkillList('passiveA');
    var psBList = buildSkillList('passiveB');
    var psCList = buildSkillList('passiveC');
    var sklName, index;

    for (index in wpnList) {
        sklName = wpnList[index];
        if (checkRestrictions(unit, weapons[sklName].type + ', ' + weapons[sklName].restriction, weapons[sklName].color)) {
            skills.weapons.push(sklName);
        }
    }
    for (index in astList) {
        sklName = astList[index];
        if (checkRestrictions(unit, assists[sklName].restriction)) {
            skills.assists.push(sklName);
        }
    }
    for (index in spcList) {
        sklName = spcList[index];
        if (checkRestrictions(unit, specials[sklName].restriction)) {
            skills.specials.push(sklName);
        }
    }
    for (index in psAList) {
        sklName = psAList[index];
        if (checkRestrictions(unit, passives.A[sklName].restriction)) {
            skills.passivesA.push(sklName);
        }
    }
    for (index in psBList) {
        sklName = psBList[index];
        if (checkRestrictions(unit, passives.B[sklName].restriction)) {
            skills.passivesB.push(sklName);
        }
    }
    for (index in psCList) {
        sklName = psCList[index];
        if (checkRestrictions(unit, passives.C[sklName].restriction)) {
            skills.passivesC.push(sklName);
        }
    }

    for (index in skills) {
        skills[index] = skills[index].sort();
    }

    return skills;
}

const statMods = {
  "Brave":[0,0,-5,0,0],
  "HP":[1,0,0,0,0],
  "Attack":[0,1,0,0,0],
  "Speed":[0,0,1,0,0],
  "Defense":[0,0,0,1,0],
  "Resistance":[0,0,0,0,1],
  "Fury":[0,1,1,1,1],
  "LifeAndDeath":[0,1,1,-1,-1]
};

// Apply stat mods to stats.
function addStatMods(stats, mod) {
    stats.HP += mod[0];
    stats.Atk += mod[1];
    stats.Spd += mod[2];
    stats.Def += mod[3];
    stats.Res += mod[4];

    return stats;
}

export function calcStats(unit, initSkills, newSkills) {
    var totalMod = [0,0,0,0,0];
    var temp;

    if (initSkills.weapon)
        totalMod[1] -= parseInt(weapons[initSkills.weapon].might, 10);
    if (newSkills.weapon)
        totalMod[1] += parseInt(weapons[newSkills.weapon].might, 10);

    // Subtract stats from default skills
    if (/Brave/.test(initSkills.weapon)) {
        totalMod = totalMod.map((x,i) => { return x - statMods.Brave[i]; });
    }
    if (/HP/.test(initSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(initSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x - (temp * statMods.HP[i]); })
    } else if (/Attack/.test(initSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(initSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x - (temp * statMods.Attack[i]); });
    } else if (/Speed/.test(initSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(initSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x - (temp * statMods.Speed[i]); });
    } else if (/Defense/.test(initSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(initSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x - (temp * statMods.Defense[i]); });
    } else if (/Resistance/.test(initSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(initSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x - (temp * statMods.Resistance[i]); });
    } else if (/Fury/.test(initSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(initSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x - (temp * statMods.Fury[i]); });
    } else if (/Life and Death/.test(initSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(initSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x - ((temp + 2) * statMods.LifeAndDeath[i]); });
    }

    // Add stats from new skills
    if (/Brave/.test(newSkills.weapon)) {
        totalMod = totalMod.map((x,i) => { return x + statMods.Brave[i]; });
    }
    if (/HP/.test(newSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(newSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x + (temp * statMods.HP[i]); })
    } else if (/Attack/.test(newSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(newSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Attack[i]); });
    } else if (/Speed/.test(newSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(newSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Speed[i]); });
    } else if (/Defense/.test(newSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(newSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Defense[i]); });
    } else if (/Resistance/.test(newSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(newSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Resistance[i]); });
    } else if (/Fury/.test(newSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(newSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Fury[i]); });
    } else if (/Life and Death/.test(newSkills.passiveA)) {
        temp = parseInt((/[1-9]/.exec(newSkills.passiveA)), 10);
        totalMod = totalMod.map((x,i) => { return x + ((temp + 2) * statMods.LifeAndDeath[i]); });
    }

    return addStatMods(units[unit].stats, totalMod);
}