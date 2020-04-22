const { SimpleResponse } = require('../discord-helper.js');

String.prototype.toCamelCase = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
};

class MtgResponse {
    constructor(name, cost, color, type, subtype, rarity, oracle, flavor, power, toughness) {
        this.name = name;
        this.cost = cost;
        this.color = color;
        this.type = type;
        this.subtype = subtype;
        this.rarity = rarity;
        this.oracle = oracle;
        this.flavor = flavor;
        this.power = power;
        this.toughness = toughness;
    }

    isHelp() {
        return false;
    }

    getColor() {
        return this.color === 'W' ? '#ffffee' :
        this.color === 'U' ? '#2222ff' :
        this.color === 'B' ? '#000000' :
        this.color === 'R' ? '#ff2222' :
        this.color === 'G' ? '#22ff22' :
        this.color.length > 1 ? '#ff9900' :
        '#dddddd';
    }

    getTitle() {
        return `${this.name} - ${this.cost}`;
    }

    getDescription() {
        return `${this.type}${(this.subtype !== undefined ? ' - ' : '')}${this.subtype} (${this.rarity})\n\n${this.oracle}${(this.power !== undefined ? `\n\n${this.power} / ${this.toughness}` : '')}`;
    }

    getThumbnailUrl() {
        switch (this.rarity) {
            case 'common': 
                return '../data/img/mtg_common.png';
            case 'uncommon': 
                return '../data/img/mtg_uncommon.png';
            case 'rare': 
                return '../data/img/mtg_rare.png';
            case 'mythic': 
                return '../data/img/mtg_mythic.png';
        }
    }

    getAuthor() {
        return 'MtG Random';
    }

    getIcon() {
        return 'https://deckmaster.info/images/sets/DPA_C.png';
    }

    getFooter() {
        return `created by DrunKenBot`;
    }

    toSimpleResponse() {
        return new SimpleResponse(this.getTitle(), this.getDescription(), this.getColor());
    }
}

module.exports = MtgResponse;