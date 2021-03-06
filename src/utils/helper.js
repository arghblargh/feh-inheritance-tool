//import React from 'react';
import { escapeRegExp } from './utility.js';
import { units, rarity, weapons, assists, specials, passives, seals, upgrades, baseStats, tempStats, growths } from './data.js';
import { wpnSortFn } from './sort.js';

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

export function getRandomUnit() {
    var unitNames = Object.keys(units);
    return unitNames[Math.floor(unitNames.length * Math.random())];
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
                        rarity = Math.max(getLowestRarity(unit), skl.unlock);
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
    if (rarity[unit])
        return rarity[unit];
    else
        return 5;
}

function getWeaponUpgrade(unit) {
    if (units[unit].skills.weapon) {
        var maxWeapon = units[unit].skills.weapon[units[unit].skills.weapon.length - 1].name;
        
        if (upgrades.Evolve[maxWeapon]) {
            if (upgrades.Evolve[maxWeapon].unit && upgrades.Evolve[maxWeapon].unit.includes(unit))
                return upgrades.Evolve[maxWeapon].weapon;
            else
                return upgrades.Evolve[maxWeapon];
        }
    }

    return null;
}

export function getUpgradeEffect(weapon, upgrade, unitName) {
    var effect = weapons[weapon].effect;

    if (upgrades[weapon] && upgrades[weapon].common)
        effect = upgrades[weapon].common.effect;

    if (upgrade === 'X') {
        if (upgrades[weapon].units)
            return effect + ' ' + upgrades[weapon].units.find(unit => unit.name.split(',').includes(unitName)).effect;
        else
            return effect + ' ' + upgrades[weapon].effect;
    }
    else if (weapons[weapon].type === 'Staff' && /[WD]/.test(upgrade))
        return effect + ' ' + (upgrade === 'W' ? upgrades['Staff']['Wrathful'].effect : upgrades['Staff']['Dazzling'].effect);
    else
        return effect;
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

    if (limitStaff && /Staff/.test(unitData) && !/Staff/.test(restrictions))
        return false;

    if (restrictions) {
        let rstr = restrictions.split(', ');

        for (let r of rstr) {
            if (r === unit)
                return true;

            if (/Exclusive/.test(r)) {
                if (getDefaultSkills(unit).includes(skill))
                    return true;
                if (getWeaponUpgrade(unit) === skill)
                    return true;
            }

            if (/Offense/.test(r) && !/Staff/.test(unitData))
                return true;
                    
            if (/Melee/.test(r) && /Sword|Lance|Axe|Breath|Beast/.test(unitData))
                return true;

            if (/Ranged/.test(r) && /Bow|Dagger|Tome|Staff/.test(unitData))
                return true;

            if (/Physical/.test(r) && /Sword|Lance|Axe|Beast|Bow|Dagger/.test(unitData))
                return true;

            if (/Magic/.test(r) && /Breath|Tome|Staff/.test(unitData))
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
                else if (/Br/.test(flags) && /Breath/.test(unitData))
                    return true;
                else if (/Be/.test(flags) && /Beast/.test(unitData))
                    return true;
                else if (/Tr/.test(flags) && /Tome/.test(unitData) && /Red/.test(unitData))
                    return true;
                else if (/Tb/.test(flags) && /Tome/.test(unitData) && /Blue/.test(unitData))
                    return true;
                else if (/Tg/.test(flags) && /Tome/.test(unitData) && /Green/.test(unitData))
                    return true;
                else if (/Bo/.test(flags) && /Bow/.test(unitData))
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
        checkRestrictions(unit, skill, weapons[skill].type + (weapons[skill].restriction ? ', ' + weapons[skill].restriction : ''), false, weapons[skill].color)))].sort(wpnSortFn['name']);
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

    for (var stat of Object.keys(stats))
        stats[stat] = Math.max(stats[stat], 0);

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
function calcMergeBonus(unit, merge, isNeutral = false) {
    if (!baseStats[unit])
        return [0, 0, 0, 0, 0];
    
    let sortedStats = sortStats(unit);
    
    let index = 0;
    for (let i = 0; i < merge; i++) {
        sortedStats[index++].bonus += 1;
        if (index > 4) index = 0;
        sortedStats[index++].bonus += 1;
        if (index > 4) index = 0;
    }
    
    let resultMod = [0,0,0,0,0];

    if (merge > 0 && isNeutral) {
        for (let i = 0; i < 3; i++) {
            sortedStats[i].bonus += 1;
        }
    }

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

// Sort stats from highest to lowest
function sortStats(unit) {
    let sortedStats = [];
    for (let stat in baseStats[unit]) {
        sortedStats.push({
            "stat": stat,
            "value": baseStats[unit][stat],
            "bonus": 0
        });
    }
    sortedStats.sort((a,b) => { return b.value - a.value; });

    return sortedStats;
}

// Calculate unit stats
export function calcStats(unit, skills, rarity = 5, level = 40, boonBane = null, merge = 0, summonerRank = ''/*, getMod = false*/) {
    let totalMod = [0,0,0,0,0]; // HP, Atk, Spd, Def, Res
    let temp;

    let growthRates = Object.values(growths[unit]);

    if (boonBane) {
        for (let bb in boonBane) {
            if (!boonBane[bb]) continue;

            let index = boonBane[bb] === "HP"  ? 0 :
                        boonBane[bb] === "Atk" ? 1 :
                        boonBane[bb] === "Spd" ? 2 :
                        boonBane[bb] === "Def" ? 3 :
                        /*boonBane[bb] === "Res" ?*/ 4;
            
            totalMod[index] += bb === "boon" ? 1 : merge === 0 ? -1 : 0;
            growthRates[index] += bb === "boon" ? 5 : merge === 0 ? -5 : 0;
        }
    }

    if (level === 40) {
        let growthValues = calcGrowthValues(growthRates);
        totalMod = totalMod.map((x,i) => { return x + growthValues[i]; });
    }

    let mergeMod = calcMergeBonus(unit, merge, boonBane && Object.values(boonBane).every(x => x === ''));
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

    let stats = baseStats[unit] ? calcBaseStats(unit, rarity)
                : tempStats[unit] && tempStats[unit][rarity][level] ? JSON.parse(JSON.stringify(tempStats[unit][rarity][level]))
                : null;

    // if (getMod)
    //     return totalMod;
    // else
    return addStatMods(stats, totalMod);

    function calcBaseStats(unit, rarity) {
        if (!baseStats[unit])
            return [0, 0, 0, 0, 0];
            
        let stats = JSON.parse(JSON.stringify(baseStats[unit]));
        let statArr = [stats.HP, stats.Atk, stats.Spd, stats.Def, stats.Res];
        let order = [0].concat(statArr.slice(1).map((lhs, i) => statArr.slice(1).filter((rhs, j) => (i < j && lhs >= rhs) || (i > j && lhs > rhs)).length));

        statArr = statArr.map((val, i) => val - Math.floor((5 - rarity + (order[i] < 2 ? 1 : 0)) / 2));

        stats.HP = statArr[0];
        stats.Atk = statArr[1];
        stats.Spd = statArr[2];
        stats.Def = statArr[3];
        stats.Res = statArr[4];

        return stats;
    }

    function calcGrowthValues(growthRates) {
        return growthRates.map(x => Math.floor(0.39 * Math.floor(x * (0.79 + (0.07 * rarity)))));
    }

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
            if (upgrades[skills.weapon].stats)
                upgradeMod = JSON.parse(JSON.stringify(upgrades[skills.weapon].stats));
            else {
                if (/Sword|Lance|Axe|Breath|Beast/.test(weapons[skills.weapon].type))
                    upgradeMod = [3, 0, 0, 0, 0];
                else 
                    upgradeMod = [0, 0, 0, 0, 0];
            }
        }
        else if (/Sword|Lance|Axe|Breath|Beast/.test(weapons[skills.weapon].type))
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

// Determine boon/bane from input stats
// export function calcBoonBane(unit, rarity, level, merge, rank, skills, stats) {
//     var base = JSON.parse(JSON.stringify(baseStats[rarity][level][unit]));
//     var skillMod = calcStats(unit, skills, rarity, level, null, merge, rank, true);
//     var statArr = [
//         { stat: 'HP', value: stats.HP - base.HP - skillMod[0] },
//         { stat: 'Atk', value: stats.Atk - base.Atk - skillMod[1] },
//         { stat: 'Spd', value: stats.Spd - base.Spd - skillMod[2] },
//         { stat: 'Def', value: stats.Def - base.Def - skillMod[3] },
//         { stat: 'Res', value: stats.Res - base.Res - skillMod[4] }
//     ];

//     statArr = statArr.sort((a, b) => b.value - a.value);

//     if (statArr[0].value - statArr[4].value > 1)
//         return {boon: statArr[0].stat, bane: statArr[4].stat};
//     else
//         return {boon: '', bane: ''};
// }

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
    if (upgrade && weapons[skill] && (weapons[skill].upgrade || weapons[skill].type === 'Staff')) {
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