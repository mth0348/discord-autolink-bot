const { DiscordHelper } = require('../discord-helper.js');

const MtgResponse = require('./mtg-response.js');

const config = require('../../config.json');
const mtgData = require('./../data/mtg.json');

class MtgParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();
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
        let rarityFactor = this.random(0.8, 1.2); // low means mythic
        let rarity = this.getRarity();
        let power = this.random(0, 8);
        let toughness = this.random(1, 8);
        let cmc = Math.ceil((power + toughness) * 0.5 * rarityFactor);

        let color = [ "W","U","B","R","G" ][this.random(0,4)];

        this.discordHelper.richEmbedMessage(message, new MtgResponse("Toothless Predator", `{${cmc-1}}{${color}}`, color, "Creature", "Lizard", rarity, "", "", power, toughness));
    }

    random(minInclusive, maxInclusive) {
        return minInclusive + Math.floor(Math.random() * (maxInclusive + 1));
    }

    getRarity(rarityFactor) {
        return rarityFactor < 0.9 ? "mythic"
             : rarityFactor < 1.0 ? "rare"
             : rarityFactor < 0.9 ? "uncommon"
             : "common";
    }
}

module.exports = MtgParser;