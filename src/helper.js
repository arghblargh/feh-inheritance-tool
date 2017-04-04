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

const units = require('./data/units.json');
const weapons = require('./data/weapons.json');
const assists = require('./data/assists.json');
const specials = require('./data/specials.json');
const passives = require('./data/passives.json');

// Escape RegExp string
export function escapeRegExp(str) {
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
    previous[current] = require('./img/portrait/' + current.replace(/\s/g, '_') + '.png');
    return previous;
}, {});

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
        let self = this;
        let options = self.props.options.map(function(option) {
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

export const Hover = ({ onHover, children }) => (
    <div className="hover">
        <div className="hover__no-hover">{children}</div>
        <div className="hover__hover">{onHover}</div>
    </div>
)

// Parses skills. Returns an object of { skillType : skillName }
export function parseSkills(skillData) {
    let skills = {};
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

// Gets an object of all units that can learn a skill { Rarity# : [UnitList] }
export function getUnitsWithSkill(skill, type) {
    if (!['weapon','assist','special','passiveA','passiveB','passiveC'].includes(type)) return null;

    let reSkill = RegExp(escapeRegExp(skill) + '$');
    let unitList = {};
    
    for (let unit in units) {
        let skillData = units[unit].skills[type];
        for (let index in skillData) {
            if (reSkill.test(skillData[index].name)) {
                if (!unitList[skillData[index].unlock])
                    unitList[skillData[index].unlock] = [];
                unitList[skillData[index].unlock].push(unit);
            }
        }
    }
    return unitList;
}

// Check inheritance restrictions.
function checkRestrictions(unit, restrictions, limitStaff = false, color = '') {
    let unitData = unit + ' ' + units[unit].color + ' ' + units[unit].wpnType + ' ' + units[unit].movType;
    let rstr = restrictions.split(', ');
    let re;
    
    if (color) {
        let colorList = color.split(', ');
        let containsColor = false;
        for (let c of colorList) {
            re = RegExp(c);
            if (re.test(unitData)) {
                containsColor = true;
                break;
            }
        }
        if (!containsColor)
            return false;
    }

    for (let r of rstr) {
        if (/Offense/.test(r) && !/Staff/.test(unitData))
            return true;

        if (limitStaff && /Staff/.test(unitData) && !/Staff/.test(r))
            return false;
                
        if (/Melee/.test(r) && /Sword|Lance|Axe|Dragon/.test(unitData))
            return true;

        if (/Ranged/.rest(r) && /Bow|Dagger|Tome|Staff/.test(unitData))
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
        
        re = RegExp(r);
        if (!re.test(unitData))
            return false;
    }
    
    return true;
}

// Returns an object containing lists of all inheritable skills for a unit
export function getPossibleSkills(unit) {
    let skills = {};
    skills.weapons = ['', ...new Set(Object.keys(weapons).filter(skill =>  
        checkRestrictions(unit, weapons[skill].type + (weapons[skill].restriction ? ', ' + weapons[skill].restriction : ''), false, weapons[skill].color)))];
    skills.assists = ['', ...new Set(Object.keys(assists).filter(skill =>
        checkRestrictions(unit, assists[skill].restriction, true)))];
    skills.specials = ['', ...new Set(Object.keys(specials).filter(skill =>
        checkRestrictions(unit, specials[skill].restriction, true)))];
    skills.passivesA = ['', ...new Set(Object.keys(passives.A).filter(skill =>
        checkRestrictions(unit, passives.A[skill].restriction)).map(name => { 
            return /[^1-9]*/i.exec(name)[0];
        }))];
    skills.passivesB = ['', ...new Set(Object.keys(passives.B).filter(skill =>
        checkRestrictions(unit, passives.B[skill].restriction)).map(name => { 
            return /[^1-9]*/i.exec(name)[0];
        }))];
    skills.passivesC = ['', ...new Set(Object.keys(passives.C).filter(skill =>
        checkRestrictions(unit, passives.C[skill].restriction)).map(name => { 
            return /[^1-9]*/i.exec(name)[0];
        }))];

    return skills;
}

const statMods = {
  "Brave":[0,0,-5,0,0],
  "HP":[1,0,0,0,0],
  "Attack":[0,1,0,0,0],
  "Speed":[0,0,1,0,0],
  "Defense":[0,0,0,1,0],
  "Resistance":[0,0,0,0,1],
  "Attack/Def":[0,1,0,1,0],
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

export function calcStats(unit, skills, boonBane) {
    let totalMod = [0,0,0,0,0]; // HP, Atk, Spd, Def, Res
    let temp;

    if (skills) {
        if (skills.weapon)
            totalMod[1] += weapons[skills.weapon].might;

        // Add stats from skills
        if (/Brave/.test(skills.weapon)) {
            totalMod = totalMod.map((x,i) => { return x + statMods.Brave[i]; });
        }
        if (/HP\s/.test(skills.passiveA)) {
            temp = parseInt((/[1-9]/.exec(skills.passiveA)), 10);
            totalMod = totalMod.map((x,i) => { return x + (temp * statMods.HP[i]); })
        } else if (/Attack\s/.test(skills.passiveA)) {
            temp = parseInt((/[1-9]/.exec(skills.passiveA)), 10);
            totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Attack[i]); });
        } else if (/Speed\s/.test(skills.passiveA)) {
            temp = parseInt((/[1-9]/.exec(skills.passiveA)), 10);
            totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Speed[i]); });
        } else if (/Defense\s/.test(skills.passiveA)) {
            temp = parseInt((/[1-9]/.exec(skills.passiveA)), 10);
            totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Defense[i]); });
        } else if (/Resistance\s/.test(skills.passiveA)) {
            temp = parseInt((/[1-9]/.exec(skills.passiveA)), 10);
            totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Resistance[i]); });
        } else if (/Attack\/Def/.test(skills.passiveA)) {
            temp = parseInt((/[1-9]/.exec(skills.passiveA)), 10);
            totalMod = totalMod.map((x,i) => { return x + (temp * statMods['Attack/Def'][i]); });
        } else if (/Fury/.test(skills.passiveA)) {
            temp = parseInt((/[1-9]/.exec(skills.passiveA)), 10);
            totalMod = totalMod.map((x,i) => { return x + (temp * statMods.Fury[i]); });
        } else if (/Life and Death/.test(skills.passiveA)) {
            temp = parseInt((/[1-9]/.exec(skills.passiveA)), 10);
            totalMod = totalMod.map((x,i) => { return x + ((temp + 2) * statMods.LifeAndDeath[i]); });
        }
    }

    if (boonBane.boon) {
        let boon = 3;
        if(units[unit].boon && units[unit].boon[boonBane.boon])
            boon = units[unit].boon[boonBane.boon];
        totalMod[boonBane.boon === "HP"  ? 0 :
                 boonBane.boon === "Atk" ? 1 :
                 boonBane.boon === "Spd" ? 2 :
                 boonBane.boon === "Def" ? 3 :
             /*boonBane.boon === "Res" ?*/ 4 ] += boon;
    }
    if (boonBane.bane) {
        let bane = 3;
        if(units[unit].bane && units[unit].bane[boonBane.bane])
            bane = units[unit].bane[boonBane.bane];
        totalMod[boonBane.bane === "HP"  ? 0 :
                 boonBane.bane === "Atk" ? 1 :
                 boonBane.bane === "Spd" ? 2 :
                 boonBane.bane === "Def" ? 3 :
             /*boonBane.bane === "Res" ?*/ 4 ] -= bane;
    }

    return addStatMods(JSON.parse(JSON.stringify(units[unit].stats)), totalMod);
}