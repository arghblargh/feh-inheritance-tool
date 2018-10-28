import { units } from './data.js';

export const unitSortFn = {
    "name": function (a, b) {
        a = units[a];
        b = units[b];
        return nameSortFn(a, b);
    },
    "color": function (a, b) {
        a = units[a];
        b = units[b];
        if (a.color !== b.color) {
            switch (a.color) {
                case "Red":
                    return -1;
                case "Blue":
                    return b.color === "Red" ? 1 : -1;
                case "Green":
                    return b.color === "Neutral" ? -1 : 1;
                case "Neutral":
                    return 1;
                default:
            }
        }
        return nameSortFn(a, b);
    },
    "weapon": function (a, b) {
        a = units[a];
        b = units[b];
        if (a.wpnType !== b.wpnType) {
            switch (a.wpnType) {
                case "Sword":
                    return -1;
                case "Lance":
                    return b.wpnType === "Sword" ? 1 : -1;
                case "Axe":
                    return b.wpnType === "Sword" || b.wpnType === "Lance" ? 1 : -1;
                case "Bow":
                    return b.wpnType === "Sword" || b.wpnType === "Lance" || b.wpnType === "Axe" ? 1 : -1;
                case "Dagger":
                    return b.wpnType === "Breath" || b.wpnType === "Staff" || b.wpnType === "Tome" ? -1 : 1;
                case "Tome":
                    return b.wpnType === "Breath" || b.wpnType === "Staff" ? -1 : 1;
                case "Staff":
                    return b.wpnType === "Breath" ? -1 : 1;
                case "Breath":
                    return 1;
                default:
            }
        }
        if (a.color !== b.color) {
            switch (a.color) {
                case "Red":
                    return -1;
                case "Blue":
                    return b.color === "Red" ? 1 : -1;
                case "Green":
                    return b.color === "Neutral" ? -1 : 1;
                case "Neutral":
                    return 1;
                default:
            }
        }
        return nameSortFn(a, b);
    },
    "movement": function (a, b) {
        a = units[a];
        b = units[b];
        if (a.movType !== b.movType) {
            switch (a.movType) {
                case "Infantry":
                    return -1;
                case "Armored":
                    return b.movType === "Infantry" ? 1 : -1;
                case "Cavalry":
                    return b.movType === "Flying" ? -1 : 1;
                case "Flying":
                    return 1;
                default:
            }
        }
        return nameSortFn(a, b);
    }
}

export function nameSortFn(a, b) {
    var aName = a.name + ': ' + a.title;
    var bName = b.name + ': ' + b.title;
    if (aName < bName)
        return -1;
    else if (aName > bName)
        return 1;
    
    return 0;
}