const { SimpleResponse } = require('../discord-helper.js');
const { MtgCard } = require('./mtg-card.js');

String.prototype.toCamelCase = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
};

class MtgResponse {
    constructor(mtgCard) {
        this.name = mtgCard.name;
        this.cost = mtgCard.cost;
        this.color = mtgCard.color;
        this.type = mtgCard.type;
        this.subtype = mtgCard.subtype;
        this.rarity = mtgCard.rarity;
        this.oracle = mtgCard.oracle;
        this.flavor = mtgCard.flavor;
        this.power = mtgCard.power;
        this.toughness = mtgCard.toughness;
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
        return `${this.type}${(this.subtype !== undefined ? ' - ' : '')}${this.subtype}\n\n${this.oracle}${(this.power !== undefined ? `\n\n${this.power} / ${this.toughness}` : '')}`;
    }

    getThumbnailUrl() {
        // imgur album: https://imgur.com/a/bI68wfc
        switch (this.rarity) {
            case 'common': 
                return 'https://i.imgur.com/6V5T9JD.png';
            case 'uncommon': 
                return 'https://i.imgur.com/Zc0Y8sy.png';
            case 'rare': 
                return 'https://i.imgur.com/zy2hjQu.png';
            case 'mythic': 
                return 'https://i.imgur.com/65eqVD8.png';
        }
    }

    getAuthor() {
        return 'MtG Random Card';
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