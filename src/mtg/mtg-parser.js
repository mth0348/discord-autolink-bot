const { DiscordHelper } = require('../discord-helper.js');

const MtgResponse = require('./mtg-response.js');

const config = require('../../config.json');
const mtgData = require('./../data/mtg.json');

class MtgParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();

        this.colors = [ "W","U","B","R","G" ];
        this.powers = [ 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9 ];
        this.toughnesses = [ 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9 ];
    }

    isCommandAllowed(message) {
        let isCommand = this.discordHelper.checkIsCommand(message, `${config.prefix}mtg`);
        if (isCommand) {
            let isAllowedInChannel = this.discordHelper.checkChannelPermissions(message, config.channelPermissions.mtg);
            let isAllowedRole = this.discordHelper.checkRolePermissions(message, config.rolePermissions.mtg);
            return isAllowedInChannel && isAllowedRole;
        }
        return false;
    }

    startWorkflow(message) {
        let cardType = mtgData.types[this.random(0, mtgData.types.length - 1)];
        switch (cardType) {
            case "creature": 
                this.createCreatureCard(message);
                return;
            default:
                this.createCreatureCard(message);
                return;
        }
    }

    createCreatureCard(message) {
        let totalScore = 0;
        
        let rarityScore = this.random(0, 1); // high means mythic
        let rarity = this.getRarity(rarityScore);
        totalScore += -rarityScore;
        console.log(totalScore);

        let power = this.powers[this.random(0, this.powers.length - 1)];
        totalScore += Math.floor(power / 2);
        console.log(totalScore);

        let toughness = this.toughnesses[this.random(0, this.toughnesses.length - 1)];
        totalScore += Math.floor(toughness / 2);
        console.log(totalScore);

        let color = this.colors[this.random(0, this.colors.length - 1)];

        let keyword = this.getKeyword("creature");
        totalScore += keyword.score;
        console.log(totalScore);

        let cmc = Math.ceil(totalScore);

        this.discordHelper.richEmbedMessage(message, new MtgResponse("Toothless Predator", `{${cmc}}`, color, "Creature", "Lizard", rarity, keyword.name, "", power, toughness));
    }

    random(minInclusive, maxInclusive) {
        return minInclusive + Math.floor(Math.random() * (maxInclusive + 1));
    }

    getRarity(rarityFactor) {
        return rarityFactor >= 3/4 ? "mythic"
             : rarityFactor >= 2/4 ? "rare"
             : rarityFactor >= 1/4 ? "uncommon"
             : "common";
    }

    getKeyword(type) {
        let keywords = mtgData.keywords.filter(e => e.types.some(t => t === type));
        let selected = keywords[this.random(0, keywords.length - 1)];

        if (selected.hasCost) {
            return { name: selected.name + " - {R}", score: selected.score };
        }
        return { name: selected.name, score: selected.score };
    }
}

module.exports = MtgParser;



/*
special keywords:
entwine
kicker
forecast
overload
tribute

this spell can't be countered.
*/