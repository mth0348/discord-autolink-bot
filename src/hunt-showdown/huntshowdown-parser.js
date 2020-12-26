const { SimpleResponse, DiscordHelper } = require('../discord-helper.js');

const config = require('../../config.json');
const huntShowdownData = require('./../data/hunt-showdown.json');

class HuntShowdownParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();
    }

    isCommandAllowed(message) {
        let isCommand = this.discordHelper.checkIsCommand(message, `${config.prefix}loadout`);
        if (isCommand) {
            let isDirectMessage = message.channel.type === "dm";
            if (isDirectMessage) {
                return true;
            }

            let isAllowedInChannel = this.discordHelper.checkChannelPermissions(message, config.channelPermissions.huntShowdown);
            let isAllowedRole = this.discordHelper.checkRolePermissions(message, config.rolePermissions.huntShowdown);
            return isAllowedInChannel && isAllowedRole;
        }
        return false;
    }

    startWorkflow(message) {
        // handle help command.
        if (message.content.toLowerCase() == `${config.prefix}loadout help`) {
            let helpText = `Enter '${config.prefix}loadout' to generate a random Hunt Showdown loadout. Add 'price' argument followed by a number to limit the maximum price the loadout should cost, or add 'rank' to limit the loadout to a certain maximum rank:\n\n`;
            helpText += `${config.prefix}loadout\n`;
            helpText += `${config.prefix}loadout price 200\n`;
            helpText += `${config.prefix}loadout rank 44\n`;
            helpText += `${config.prefix}loadout price 999 rank 10\n`;
            helpText += `${config.prefix}loadout rank 2 price 100\n\n`;
            helpText += `Use 'novariants', 'nv' or '-v' to exclude weapon variants, like so:\n`;
            helpText += `${config.prefix}loadout rank 15 nv\n\n`;
            helpText += `Use 'quartermaster' or 'qm' to allow a large primary slot weapon along a medium slot secondary weapon, like so:\n`;
            helpText += `${config.prefix}loadout qm nv rank 10`;
            const response = new SimpleResponse('Hunt Showdown Loadouts', helpText, '#222222');
            this.discordHelper.embedMessage(message, response);
            return;
        }

        // parse arguments.
        let price = 9999;
        let rank = 9999;
        let noVariants = false;
        let quartermaster = false;
        let args = message.content.toLowerCase().split(" ");
        if (args.length > 2) {
            const priceIndex = args.indexOf("price");
            const rankIndex = args.indexOf("rank");
            const unlockIndex = args.indexOf("unlock");
            noVariants = args.indexOf("novariants") >= 0;
            noVariants = noVariants || args.indexOf("nv") >= 0;
            noVariants = noVariants || args.indexOf("-variants") >= 0;
            noVariants = noVariants || args.indexOf("-v") >= 0;
            quartermaster = args.indexOf("quartermaster") >= 0;
            quartermaster = quartermaster || args.indexOf("qm") >= 0;

            price = this.tryGetInt(args, priceIndex) || price;
            rank = this.tryGetInt(args, rankIndex) || this.tryGetInt(args, unlockIndex) || rank;
        }

        // find ideal loadout.
        let primaries = [];
        let secondaries = [];

        let slotSize = this.random(1, 4) > 1 ? 3 : 2;
        let matchWeapons = huntShowdownData.weapons.filter(w => w.actualUnlock <= rank && w.price <= price && (noVariants ? w.unlock.startsWith("Rank") : true));

        if (matchWeapons.length === 0) {
            this.discordHelper.embedMessage(message, new SimpleResponse("Hunt Showdown Loadouts", "There are not enough match results for your loadout request.", "#882222"));
            return;
        }

        if (slotSize === 3 || quartermaster) {
            primaries = matchWeapons.filter(m => m.slots === 3);
            secondaries = matchWeapons.filter(m => m.slots === (quartermaster ? 2 : 1));
        } else {
            primaries = matchWeapons.filter(m => m.slots === 2);
            secondaries = primaries;
        }

        // ensure primaries are always set.
        if (primaries.length <= 0) {
            primaries = secondaries;
        }

        // choose a loadout.
        let primary = primaries[this.random(0, primaries.length - 1)];
        let secondary = secondaries[this.random(0, secondaries.length - 1)];

        let title = "Here you go!";
        let resultText = `Your loadout is:**\n\n[${primary.slots}] ${primary.name}**\n**[${secondary.slots}] ${secondary.name}**\n`;
        let color = "#222222";

        const simpleResponse = new SimpleResponse(title, resultText, color);
        this.discordHelper.embedMessage(message, simpleResponse);
    }

    tryGetInt(list, index) {
        if (index + 1 < list.length && index >= 0) {
            const parsed = parseInt(list[index + 1], 10);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
        return undefined;
    }

    random(inclusiveMin, inclusiveMax) {
        return inclusiveMin + Math.floor(Math.random() * Math.floor((inclusiveMax - inclusiveMin) + 1));
    }
}

module.exports = HuntShowdownParser;