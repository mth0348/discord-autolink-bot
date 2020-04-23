const { DiscordHelper } = require('../discord-helper.js');

const MtgResponse = require('./mtg-response.js');
const MtgCard = require('./mtg-card.js');

const config = require('../../config.json');
const mtgData = require('./../data/mtg.json');

class MtgParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();

        this.colors = ["white", "blue", "black", "red", "green"];
        this.powers = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9];
        this.toughnesses = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9];
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

    getEmojis(message) {
        this.emojis = [
            message.guild.emojis.cache.find(e => e.name === 'mtg_0'), // 0
            message.guild.emojis.cache.find(e => e.name === 'mtg_1'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_2'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_3'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_4'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_5'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_6'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_7'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_8'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_9'),

            message.guild.emojis.cache.find(e => e.name === 'mtg_W'), // 10
            message.guild.emojis.cache.find(e => e.name === 'mtg_U'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_B'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_R'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_G'),

            message.guild.emojis.cache.find(e => e.name === 'mtg_X'), // 15
            message.guild.emojis.cache.find(e => e.name === 'mtg_T')
        ];
    }

    startWorkflow(message) {
        this.getEmojis(message);

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
        this.card = new MtgCard();
        this.card.name = "Toothless Predator";
        this.card.type = "Creature";
        this.card.subtype = mtgData.subtypes[this.random(0, mtgData.subtypes.length - 1)].toCamelCase();

        let color = this.colors[this.random(0, this.colors.length - 1)];
        let rarity = [1, 1, 2, 2, 3, 4][this.random(0, 5)]; // 1 = common, 4 = mythic
        let rarityText = this.getRarity(rarity);

        let totalScore = 0;
        console.log("new card:");

        let power = this.powers[this.random(0, this.powers.length - 1)];
        totalScore += power / 2;
        console.log("p: " + (power / 2) + " (=" + totalScore + ")");

        let toughness = this.toughnesses[this.random(0, this.toughnesses.length - 1)];
        totalScore += toughness / 2;
        console.log("t: " + (toughness / 2) + " (=" + totalScore + ")");

        let keyword = "";
        let hasKeyword = this.random(0, 2);
        if (hasKeyword >= 1 || rarity >= 3) {
            let keyword1 = this.getKeyword("creature");
            totalScore += keyword1.score;
            console.log("k1: " + keyword1.score + " (=" + totalScore + ")");
            keyword = keyword1.name;
        } else if (hasKeyword > 1) {
            let keyword2 = this.getKeyword("creature");
            totalScore += keyword2.score;
            console.log("k2: " + keyword2.score + " (=" + totalScore + ")");
            keyword += ", " + keyword2.name;
        }

        let ability = "";
        let hasAbility = [0, 0, 0, 1, 1, 1, 2][this.random(0, 6)];
        if (hasAbility >= 1 || rarity >= 4) {
            let ability1 = this.getTriggeredAbility();
            totalScore += ability1.score;
            console.log("a1: " + ability1.score + " (=" + totalScore + ")");
            ability = ability1.text;

            if (ability1.score > 1.0) {
                rarity = Math.max(rarity + 1, 4);
            }
            if (ability1.score < -1.0) {
                rarity = Math.min(rarity - 1, 1);
            }
        } else if (hasAbility > 1) {
            let ability2 = this.getTriggeredAbility();
            totalScore += ability2.score;
            console.log("a2: " + ability2.score + " (=" + totalScore + ")");
            ability += "\n\n" + ability2.text;
        }

        let rarityScore = -rarity / 4;
        totalScore += rarityScore;
        console.log("rarity: " + rarityScore + " (=" + totalScore + ")");

        let cmc = Math.ceil(totalScore);
        let oracle = `${keyword.length > 0 ? `${keyword}\n\n` : ``}${ability}`;

        this.card.cost = this.resolveManaSymbols(`{${cmc}}`);
        this.card.color = color;
        this.card.rarity = rarityText;
        this.card.oracle = this.resolveManaSymbols(oracle);
        this.card.flavor = "";
        this.card.power = power;
        this.card.toughness = toughness;

        this.discordHelper.richEmbedMessage(message, new MtgResponse(this.card));
    }

    random(minInclusive, maxInclusive) {
        return minInclusive + Math.floor(Math.random() * (maxInclusive + 1));
    }

    getRarity(rarityFactor) {
        return rarityFactor >= 4 ? "mythic"
            : rarityFactor >= 3 ? "rare"
                : rarityFactor >= 2 ? "uncommon"
                    : "common";
    }

    getKeyword(type, justSimple) {
        let keywords = mtgData.keywords.filter(e => e.types.some(t => t === type.toLowerCase()) && (justSimple === undefined || e.hasCost === false && e.nameExtension === ""));
        let selected = keywords[this.random(0, keywords.length - 1)];

        if (selected === undefined || selected.nameExtension === undefined) {
            let a = 0 + 0;
        }

        let text = selected.name;

        if (selected.nameExtension.length > 0) {
            text += " " + this.resolveSyntax(selected.nameExtension);
        }
        if (selected.hasCost) {
            text += " - {R}";
        }

        return { name: text, score: selected.score };
    }

    getTriggeredAbility() {
        let condition = mtgData.permanentConditions[this.random(0, mtgData.permanentConditions.length - 1)];
        let event = mtgData.permanentEvents[this.random(0, mtgData.permanentEvents.length - 1)];

        let isReplacement = [false, false, false, true][this.random(0, 3)] && condition.replacementText.length > 0;
        if (isReplacement) {
            return { text: `${this.resolveSyntax(condition.replacementText, condition.context)}, instead ${this.resolveSyntax(event.text)}.`, score: event.score };
        }

        if (this.flipCoin()) {
            let secondEvent = mtgData.permanentEvents[this.random(0, mtgData.permanentEvents.length - 1)];
            return { text: `${this.resolveSyntax(condition.text, condition.context)}, ${this.resolveSyntax(event.text)}, then ${this.resolveSyntax(secondEvent.text)}.`, score: event.score + secondEvent.score };    
        }

        return { text: `${this.resolveSyntax(condition.text, condition.context)}, ${this.resolveSyntax(event.text)}.`, score: event.score };
    }

    resolveSyntax(text, context) {
        let maxDepth = 5;
        let depth = 0;
        while (text.indexOf("(") >= 0) {
            depth++;
            if (depth >= maxDepth) break;

            let moreThanOne = false;
            if (text.indexOf("(numbername)") >= 0) {
                moreThanOne = true;
                text = text.replace(/\(numbername\)/g, ["two", "two", "two", "two", "two", "three", "three"][this.random(0, 6)]);
            }
            if (text.indexOf("(number)") >= 0) {
                let number = [1, 1, 1, 2, 2, 2, 2, 3, 3][this.random(0, 8)];
                moreThanOne = moreThanOne || number > 1;
                text = text.replace(/\(number\)/g, number);
            }

            if (text.indexOf("(keyword)") >= 0) {
                text = text.replace(/\(keyword\)/g, this.getKeyword(this.card.type, true).name);
            }

            let subtype = "";
            if (text.indexOf("(subtype)") >= 0) {
                subtype = mtgData.subtypes[this.random(0, mtgData.subtypes.length - 1)];
                text = text.replace(/\(subtype\)/g, subtype);
            }

            if (text.indexOf("(other)") >= 0 && this.card.subtype.indexOf(subtype) >= 0) {
                text = text.replace(/\(other\)/g, "another ");
            } else {
                text = text.replace(/\(other\)/g, "");
            }

            if (text.indexOf("(self)") >= 0) {
                if (context === "self") {
                    text = text.replace(/\(self\)/g, "it");
                } else {
                    text = text.replace(/\(self\)/g, this.card.name);
                }
            }

            let useN = false;
            if (text.indexOf("(type)") >= 0) {
                let type = mtgData.types[this.random(0, mtgData.types.length - 1)]
                useN = type === "enchantment";
                text = text.replace(/\(type\)/g, type);
            }

            text = text.replace(/\(player\)/g, this.random(0, 1) === 1 ? "player" : "opponent");
            text = text.replace(/\(permanent\)/g, mtgData.types[this.random(2, mtgData.types.length - 1)]);
            text = text.replace(/\(name\)/g, this.card.name);
            text = text.replace(/\(s\)/g, moreThanOne ? "s" : "");
            text = text.replace(/\(n\)/g, useN ? "n" : "");
            text = text.replace(/\(color\)/g, this.colors[this.random(0, this.colors.length - 1)]);
            text = text.replace(/\(type\|color\)/g, this.random(0, 1) === 1 ? this.colors[this.random(0, this.colors.length - 1)] : mtgData.types[this.random(0, mtgData.types.length - 1)]);
        }

        return text;
    }

    resolveManaSymbols(text) {
        text = text.replace(/\{0\}/g, this.emojis[0]);
        text = text.replace(/\{1\}/g, this.emojis[1]);
        text = text.replace(/\{2\}/g, this.emojis[2]);
        text = text.replace(/\{3\}/g, this.emojis[3]);
        text = text.replace(/\{4\}/g, this.emojis[4]);
        text = text.replace(/\{5\}/g, this.emojis[5]);
        text = text.replace(/\{6\}/g, this.emojis[6]);
        text = text.replace(/\{7\}/g, this.emojis[7]);
        text = text.replace(/\{8\}/g, this.emojis[8]);
        text = text.replace(/\{9\}/g, this.emojis[9]);
        text = text.replace(/\{W\}/g, this.emojis[10]);
        text = text.replace(/\{U\}/g, this.emojis[11]);
        text = text.replace(/\{B\}/g, this.emojis[12]);
        text = text.replace(/\{R\}/g, this.emojis[13]);
        text = text.replace(/\{G\}/g, this.emojis[14]);
        text = text.replace(/\{X\}/g, this.emojis[15]);
        text = text.replace(/\{T\}/g, this.emojis[16]);

        return text;
    }

    flipCoin() {
        return this.random(0, 1) === 1;
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