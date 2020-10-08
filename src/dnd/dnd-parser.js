const { SimpleResponse, DiscordHelper } = require('./../discord-helper.js');

const config = require('./../../config.json');

class DndParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();
    }

    isCommandAllowed(message) {
        let isDiceCommand = this.discordHelper.checkIsRegexCommand(message, `^\\${config.prefix}(d|D)\\d*`);
        if (isDiceCommand) {
            let isDirectMessage = message.channel.type === "dm";
            if (isDirectMessage) {
                return true;
            }

            let isAllowedInChannel = this.discordHelper.checkChannelPermissions(message, config.channelPermissions.dnd);
            let isAllowedRole = this.discordHelper.checkRolePermissions(message, config.rolePermissions.dnd);
            return isAllowedInChannel && isAllowedRole;
        }
        return false;
    }

    startWorkflow(message) {
        // validate and set maximum dice roll.
        const diceSize = parseInt(message.content.substring(2));
        if (isNaN(diceSize)) {
            message.channel.send(`"${message.content.substring(2)}" is not an number. Please use something like "!d6" or "!d10"...`)
            return;
        }

        // handle dice roll.
        const diceRoll = this.random(1, diceSize);
        const critSuccess = diceRoll == diceSize;
        const critFailure = diceRoll == 1;

        // handle visuals.
        const color = critSuccess ? '#FFFF00' : critFailure ? '#FF0000' : '#dddddd';
        const emoji = critSuccess ? '🌟' : critFailure ? '💥' : '';
        
        const result = `**${diceRoll}** ${emoji}`;

        // display result.        
        const simpleResponse = new SimpleResponse(this.getLabel(diceRoll / diceSize), `${message.author.username} rolls a ${result.trim()}`, color);
        simpleResponse.footer = `D${diceSize}`;
        this.discordHelper.embedMessage(message, simpleResponse);

        message.delete({});
    }

    random(inclusiveMin, inclusiveMax) {
        return inclusiveMin + Math.floor(Math.random() * Math.floor((inclusiveMax - inclusiveMin) + 1));
    }

    getLabel(percentage) {
        if (percentage <= 0.1) {
            return 'Ridiculous!';
        }
        if (percentage <= 0.2) {
            return 'Disasterous!';
        }
        if (percentage <= 0.3) {
            return 'Oof!';
        }
        if (percentage <= 0.4) {
            return 'Middling!';
        }
        if (percentage <= 0.5) {
            return 'Mediocre!';
        }
        if (percentage <= 0.6) {
            return 'Not bad!';
        }
        if (percentage <= 0.7) {
            return 'Exquisite!';
        }
        if (percentage <= 0.8) {
            return 'Exemplary!';
        }
        if (percentage <= 0.9) {
            return 'Glorious!';
        }
        return 'Godlike!';
    }
}

module.exports = DndParser;