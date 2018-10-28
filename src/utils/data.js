export const units = require('../data/units.json');
export const baseStats = {
    3: require('../data/stats/3_1.json'),
    4: require('../data/stats/4_1.json'),
    5: require('../data/stats/5_1.json')
}

export const growths = require('../data/stats/growths.json');

export const weapons = require('../data/weapons.json');
export const assists = require('../data/assists.json');
export const specials = require('../data/specials.json');
export const passives = require('../data/passives.json');
export const seals = require('../data/seals.json');
export const upgrades = require('../data/upgrades.json');

// Load movement icons from file
export const moveIcon = {
    "Armored"  : require('../img/icon/movement/Armored.png'),
    "Cavalry"  : require('../img/icon/movement/Cavalry.png'),
    "Flying"   : require('../img/icon/movement/Flying.png'),
    "Infantry" : require('../img/icon/movement/Infantry.png')
};

// Load weapon icons from file
export const weaponIcon = {
    "Red" : {
        "Sword"  : require('../img/icon/weapon/red/Sword.png'),
        "Breath" : require('../img/icon/weapon/red/Breath.png'),
        "Tome"   : require('../img/icon/weapon/red/Tome.png'),
        "Bow"    : require('../img/icon/weapon/red/Bow.png'),
        "Dagger" : require('../img/icon/weapon/red/Dagger.png')
    },
    "Blue" : {
        "Lance"  : require('../img/icon/weapon/blue/Lance.png'),
        "Breath" : require('../img/icon/weapon/blue/Breath.png'),
        "Tome"   : require('../img/icon/weapon/blue/Tome.png'),
        "Bow"    : require('../img/icon/weapon/blue/Bow.png'),
        "Dagger" : require('../img/icon/weapon/blue/Dagger.png')
    },
    "Green" : {
        "Axe"    : require('../img/icon/weapon/green/Axe.png'),
        "Breath" : require('../img/icon/weapon/green/Breath.png'),
        "Tome"   : require('../img/icon/weapon/green/Tome.png'),
        "Bow"    : require('../img/icon/weapon/green/Bow.png'),
        "Dagger" : require('../img/icon/weapon/green/Dagger.png')
    },
    "Neutral" : {
        "Bow"    : require('../img/icon/weapon/neutral/Bow.png'),
        "Dagger" : require('../img/icon/weapon/neutral/Dagger.png'),
        "Breath" : require('../img/icon/weapon/neutral/Breath.png'),
        "Staff"  : require('../img/icon/weapon/neutral/Staff.png')
    }
};

// Load rarity icons from file
export const rarityIcon = {
    "1" : require('../img/icon/rarity/1.png'),
    "2" : require('../img/icon/rarity/2.png'),
    "3" : require('../img/icon/rarity/3.png'),
    "4" : require('../img/icon/rarity/4.png'),
    "5" : require('../img/icon/rarity/5.png')
};

// Load skill type icons from file
export const skillTypeIcon = {
    "Weapon" : require('../img/icon/skill_type/Weapon.png'),
    "Assist" : require('../img/icon/skill_type/Assist.png'),
    "Special" : require('../img/icon/skill_type/Special.png'),
}

// Load all unit portraits from file
export const unitPortrait = Object.keys(units).reduce(function(previous, current) {
    try {
        previous[current] = require('../img/portrait/' + current.replace(/\s/g, '_').replace(/[!:"]/g, '') + '.png');
    }
    catch (e) {
        previous[current] = require('../img/portrait/_temp.png');
    }
    return previous;
}, {});