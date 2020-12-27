const { SimpleResponse, DiscordHelper } = require('../discord-helper.js');

const config = require('../../config.json');
const huntShowdownData = require('./../data/hunt-showdown.json');

/* DATA TEMPLATE
{
    "name": <string>,
    "price": <int>,
    "unlock": <string> ("Rank XX" or "Unlock something.."),
    "actualUnlock": <int>, (0-100)
    "estimatedUnlock": <int>, (0-100)
    "harshness": <int> (1-10)
    "slots": <int> (1-3)
},*/

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
            let helpText = `*Enter '${config.prefix}loadout' to generate a random Hunt Showdown loadout. There are many options to narrow down possible loadouts, like the estimated difficulty or a price range. Here are some example commands:*\n`;
            helpText += `\`${config.prefix}loadout\`\n`;
            helpText += `\`${config.prefix}loadout price 200\`\n`;
            helpText += `\`${config.prefix}loadout rank 44\`\n`;
            helpText += `\`${config.prefix}loadout price 999 rank 10\`\n`;
            helpText += `\`${config.prefix}loadout rank 2 price 100 nv\`\n`;
            helpText += `\`${config.prefix}loadout rank 90\`\n\n`;
            helpText += `**Rank**\n`;
            helpText += `*Use 'rank', 'minrank', 'maxrank', or 'unlock' to set a unlock rank, like so:*\n`;
            helpText += `\`${config.prefix}loadout rank 50\`\n`;
            helpText += `\`${config.prefix}loadout rank 20-50\`\n`;
            helpText += `\`${config.prefix}loadout maxrank 20 minrank 1\`\n`;
            helpText += `\`${config.prefix}loadout minrank 20 maxrank 90\`\n\n`;
            helpText += `**Price**\n`;
            helpText += `Use 'price', 'min', 'max', 'minprice' or 'maxprice' to set a specific price range, like so:\n`;
            helpText += `\`${config.prefix}loadout min 200 max 500\`\n`;
            helpText += `\`${config.prefix}loadout price 200-500\`\n`;
            helpText += `\`${config.prefix}loadout maxprice 999 minprice 100\`\n\n`;
            helpText += `**Difficulty**\n`;
            helpText += `*Use 'difficulty X', 'easy' (1), 'medium' (2) or 'hard' (3) to further filter loadouts, like so:*\n`;
            helpText += `\`${config.prefix}loadout easy\`\n`;
            helpText += `\`${config.prefix}loadout difficulty 1\` (easy)\n`;
            helpText += `\`${config.prefix}loadout difficulty 1-2\` (easy and medium)\n`;
            helpText += `\`${config.prefix}loadout maxrank 10 hard\`\n`;
            helpText += `\`${config.prefix}loadout minprice 300 nv medium\`\n\n`;
            helpText += `**Level Estimation**\n`;
            helpText += `*Use 'exact', 'base' 'comparebase' or 'e' to compare the unlock rank with the base weapon instead of the variant, like so:\n`;
            helpText += `Per default, it is estimated that weapon variants are unlocked at a higher level than the base weapon and uses that estimate to filter the rank.*\n`;
            helpText += `\`${config.prefix}loadout base maxrank 10\`\n`;
            helpText += `\`${config.prefix}loadout rank 20-40\` ( would not include Uppercut)\n`;
            helpText += `\`${config.prefix}loadout rank 20-40 exact\` (would include Uppercut)\n\n`;
            helpText += `**Variants**\n`;
            helpText += `Use 'novariants', 'nv' to completely exclude weapon variants, like so:\n`;
            helpText += `\`${config.prefix}loadout rank 15 nv\`\n\n`;
            helpText += `**Quartermaster**\n`;
            helpText += `*Use 'quartermaster' or 'qm' to allow a large primary slot weapon along a medium slot secondary weapon, like so:*\n`;
            helpText += `\`${config.prefix}loadout qm nv rank 10\``;
            const response = new SimpleResponse('Hunt Showdown Loadouts', helpText, '#222222');
            response.footer = 'v.1.2';
            this.discordHelper.embedMessage(message, response);
            return;
        }

        // parse arguments.
        let minPrice = 0;
        let maxPrice = 9999;
        let minDifficulty = 0;
        let maxDifficulty = 9999;
        let minRank = 0;
        let maxRank = 9999;
        let noVariants = false;
        let quartermaster = false;
        let useExact = false;
        let args = message.content.toLowerCase().split(" ");
        if (args.length > 2) {
            const minPriceIndex = Math.max(args.indexOf("min"), args.indexOf("minprice"));
            const maxPriceIndex = Math.max(args.indexOf("max"), args.indexOf("maxprice"), args.indexOf("price"));
            const minRankIndex = Math.max(args.indexOf("minrank"), args.indexOf("minunlock"));
            const maxRankIndex = Math.max(args.indexOf("rank"), args.indexOf("maxrank"), args.indexOf("unlock"), args.indexOf("maxunlock"));
            const difficultyIndex = Math.max(args.indexOf("difficulty"), args.indexOf("d"), args.indexOf("diff"), args.indexOf("dif"));
            useExact = args.indexOf("exact") >= 0;
            useExact = useExact || args.indexOf("e") >= 0;
            useExact = useExact || args.indexOf("exactrank") >= 0;
            useExact = useExact || args.indexOf("real") >= 0;
            useExact = useExact || args.indexOf("realrank") >= 0;
            useExact = useExact || args.indexOf("base") >= 0;
            useExact = useExact || args.indexOf("comparebase") >= 0;
            noVariants = args.indexOf("novariants") >= 0;
            noVariants = noVariants || args.indexOf("nv") >= 0;
            noVariants = noVariants || args.indexOf("novariants") >= 0;
            quartermaster = args.indexOf("quartermaster") >= 0;
            quartermaster = quartermaster || args.indexOf("qm") >= 0;
            minDifficulty = args.indexOf("easy") >= 0 ? 1 : args.indexOf("medium") >= 0 ? 3 : args.indexOf("hard") >= 0 ? 5 : minDifficulty;
            maxDifficulty = args.indexOf("easy") >= 0 ? 2 : args.indexOf("medium") >= 0 ? 4 : args.indexOf("hard") >= 0 ? 6 : maxDifficulty;

            minRank = this.tryGetInt(args, minRankIndex) || minRank;
            minPrice = this.tryGetInt(args, minPriceIndex) || minPrice;

            // handle max price range.
            if (maxPriceIndex >= 0) {
                const maxPriceText = args[maxPriceIndex + 1];
                if (maxPriceText.indexOf("-") > 0 && maxPriceText.split("-").length == 2) {
                    minPrice = this.tryParseInt(maxPriceText.split("-")[0]) || minPrice;
                    maxPrice = this.tryParseInt(maxPriceText.split("-")[1]) || maxPrice;
                } else {
                    maxPrice = this.tryGetInt(args, maxPriceIndex) || maxPrice;
                }
            }

            // handle max rank range.
            if (maxRankIndex >= 0) {
                const maxRankText = args[maxRankIndex + 1];
                if (maxRankText.indexOf("-") > 0 && maxRankText.split("-").length == 2) {
                    minRank = this.tryParseInt(maxRankText.split("-")[0]) || minRank;
                    maxRank = this.tryParseInt(maxRankText.split("-")[1]) || maxRank;
                } else {
                    maxRank = this.tryGetInt(args, maxRankIndex) || maxRank;
                }
            }

            // handle max difficulty range.
            if (difficultyIndex >= 0) {
                const difficultyText = args[difficultyIndex + 1];
                if (difficultyText.indexOf("-") > 0 && difficultyText.split("-").length == 2) {
                    minDifficulty = this.tryParseInt(difficultyText.split("-")[0]) || minRank;
                    maxDifficulty = this.tryParseInt(difficultyText.split("-")[1]) || maxRank;

                    minDifficulty = Math.min(3, Math.max(1, minDifficulty)) * 2 - 1;
                    minDifficulty = Math.min(3, Math.max(1, maxDifficulty)) * 2;
                }
            } else {
                const specificDifficulty = this.tryGetInt(args, difficultyIndex);
                if (specificDifficulty) {
                    specificDifficulty = Math.min(3, Math.max(1, specificDifficulty));
                    minDifficulty = specificDifficulty * 2 - 1;
                    maxDifficulty = specificDifficulty * 2;
                }
            }
        }

        // Validate
        if (minPrice > maxPrice) {
            this.discordHelper.embedMessage(message, new SimpleResponse("Hunt Showdown Loadouts", "Min price cannot be higher than max price.", "#882222"));
            return;
        }
        if (minRank > maxRank) {
            this.discordHelper.embedMessage(message, new SimpleResponse("Hunt Showdown Loadouts", "Min rank cannot be higher than max rank.", "#882222"));
            return;
        }

        // find ideal loadout.
        let primaries = [];
        let secondaries = [];

        let slotSize = this.random(1, 4) > 1 ? 3 : 2;
        let matchWeapons = huntShowdownData.weapons.filter(w => 
            w.price >= minPrice && 
            w.price <= maxPrice && 
            (noVariants ? w.unlock.startsWith("Rank") : true) &&
            w.difficulty >= Math.floor(minDifficulty / 2) &&
            w.difficulty <= Math.ceil(maxDifficulty / 2) &&
            (useExact ? w.actualUnlock : w.estimatedUnlock) >= minRank &&
            (useExact ? w.actualUnlock : w.estimatedUnlock) <= maxRank);

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
        let hasFinished = false;
        let depth = 0;
        let primary = undefined;
        let secondary = undefined;

        while (!hasFinished && depth <= 20) {
            depth++;

            primary = primaries[this.random(0, primaries.length - 1)];

            // adjust difficulty.
            const tempSecondaries = secondaries.filter(s => 
                s.difficulty >= minDifficulty - primary.difficulty &&
                s.difficulty <= maxDifficulty - primary.difficulty);

            if (secondaries.length > 0) {
                secondary = tempSecondaries[this.random(0, tempSecondaries.length - 1)];
                hasFinished = true;
            } else {
                // no matching sidearm, choose different primary...
            }
        }

        if (primary === undefined || secondary === undefined) {
            this.discordHelper.embedMessage(message, new SimpleResponse("Hunt Showdown Loadouts", "Sorry, I was unable to find a weapon loadout that matches your description. Please try again.", "#882222"));
            return;
        } 

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

    tryParseInt(number) {
        if (number.length > 0) {
            const parsed = parseInt(number, 10);
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