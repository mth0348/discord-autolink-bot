const { DiscordHelper } = require('../discord-helper.js');

const MtgResponse = require('./mtg-response.js');
const MtgHelpResponse = require('./mtg-response-help.js');
const MtgCard = require('./mtg-card.js');

const config = require('../../config.json');
const mtgData = require('./../data/mtg.json');

class MtgParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();

        this.colors = ["white", "blue", "black", "red", "green"];
        this.powers = [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 7, 8];
        this.toughnesses = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 7, 8];
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

        if (message.content == "!mtg help") {
            this.discordHelper.richEmbedMessage(message, new MtgHelpResponse(message));
            return;
        }

        let validInputs = ["instant", "creature", "sorcery"]
        let cardType = validInputs[this.random(0, validInputs.length - 1)];

        let args = message.content.split(" ");//mtgData.types[this.random(0, mtgData.types.length - 1)];
        if (args.length > 1)
            cardType = args[1];

        if (!mtgData.types.some(t => t === cardType.toLowerCase())) {
            message.channel.send(`"${cardType}" is not an official card type. Leave blank or use "creature", for example.`)
            return;
        }

        console.log(`--- Creating new ${cardType} card... ---`);

        this.colorIdentity = "";

        switch (cardType) {
            case "creature":
                this.createCreatureCard(message);
                break;
            case "instant":
                this.createInstantCard(message);
                break;
            case "sorcery":
                this.createSorceryCard(message);
                break;
        }
    }

    createInstantCard(message) {
        this.lastNumber = 0;

        let name = this.getInstantSorceryName();
        this.card = new MtgCard();
        this.card.name = name;

        let rarity = [1, 1, 2, 2, 3][this.random(0, 4)]; // 1 = common, 4 = mythic
        let rarityText = this.getRarity(rarity);
        this.card.rarity = rarityText;

        let oracle = this.getSpellAbility();

        // evaluate cmc.
        let totalScore = 0.4 + oracle.score * (this.lastNumber > 0 ? this.lastNumber / 3 : 1) - rarity / 8;
        let cmc = Math.max(1, Math.ceil(totalScore));
        if (oracle.isComplicated)
            cmc = Math.min(2, cmc);

        let color = this.getColorFromIdentity(this.colorIdentity);
        let manacost = this.getManacostFromCmc(cmc, color);

        console.log("lastNumber:\t" + this.lastNumber);
        console.log("o-score:\t" + oracle.score);
        console.log("cmc:\t\t" + cmc);
        console.log("coloridentity:\t" + this.colorIdentity);
        console.log("color:\t\t" + color);
        console.log("manacost:\t" + manacost);

        this.card.type = "Instant";
        this.card.subtype = undefined;
        this.card.power = undefined;
        this.card.color = color;
        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.oracle = this.resolveManaSymbols(oracle.text.toCamelCase());
        this.card.flavor = "";

        this.discordHelper.richEmbedMessage(message, new MtgResponse(this.card));
    }

    createSorceryCard(message) {
        this.lastNumber = 0;

        let name = this.getInstantSorceryName();
        this.card = new MtgCard();
        this.card.name = name;

        let rarity = [1, 1, 2, 2, 3][this.random(0, 4)]; // 1 = common, 4 = mythic
        let rarityText = this.getRarity(rarity);
        this.card.rarity = rarityText;

        let oracle = this.getSpellAbility();

        // evaluate cmc.
        let totalScore = 0 + oracle.score * (this.lastNumber > 0 ? this.lastNumber / 3 : 1) - rarity / 8;
        let cmc = Math.max(1, Math.ceil(totalScore));
        if (oracle.isComplicated)
            cmc = Math.min(2, cmc);

        let color = this.getColorFromIdentity(this.colorIdentity);
        let manacost = this.getManacostFromCmc(cmc, color);

        console.log("lastNumber:\t" + this.lastNumber);
        console.log("o-score:\t" + oracle.score);
        console.log("cmc:\t\t" + cmc);
        console.log("coloridentity:\t" + this.colorIdentity);
        console.log("color:\t\t" + color);
        console.log("manacost:\t" + manacost);

        this.card.type = "Sorcery";
        this.card.subtype = undefined;
        this.card.power = undefined;
        this.card.color = color;
        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.oracle = this.resolveManaSymbols(oracle.text.toCamelCase());
        this.card.flavor = "";

        this.discordHelper.richEmbedMessage(message, new MtgResponse(this.card));
    }

    createCreatureCard(message) {
        this.card = new MtgCard();
        this.card.type = "Creature";
        this.card.subtype = mtgData.subtypes[this.random(0, mtgData.subtypes.length - 1)].toCamelCase();
        this.card.subtype += [false, false, false, true][this.random(0, 3)] ? " " + mtgData.subtypes[this.random(0, mtgData.subtypes.length - 1)].toCamelCase() : "";


        let isLegendary = [false, false, false, false, false, true][this.random(0, 5)];
        let rarity = [1, 1, 2, 2, 3][this.random(0, 4)]; // 1 = common, 4 = mythic

        if (isLegendary) {
            rarity = 3;
        }
        let name = this.getCreatureName();
        this.card.name = name;

        let totalScore = 0;
        console.log("score calculation:");

        let power = this.powers[this.random(0, this.powers.length - 1)];
        totalScore += power / 2;
        console.log("power :\t\t" + (power / 2));

        let toughness = this.toughnesses[this.random(0, this.toughnesses.length - 1)];
        totalScore += toughness / 2;
        console.log("toughness:\t " + (toughness / 2));

        // decide triggered abilities.
        let ability = "";
        let secondAbility = "";
        let hasAbility = [0, 0, 0, 1, 1, 1, 2][this.random(0, 6)];

        if (hasAbility >= 1 || rarity >= 4) {
            let ability1 = this.getTriggeredAbility();
            totalScore += ability1.score;
            console.log("ability 1:\t" + ability1.score);
            ability = ability1.text;

            // TODO: verify if this is necessary.
            if (ability1.score > 1.0) {
                rarity = Math.max(rarity + 1, 4);
            }
            if (ability1.score < -1.0) {
                rarity = Math.min(rarity - 1, 1);
            }

        }
        if (hasAbility > 1) {
            let ability2 = this.getTriggeredAbility();
            totalScore += ability2.score;
            console.log("ability 2:\t" + ability2.score);
            secondAbility = ability2.text;
        }

        // if color identity has not been set during abilities, then do it randomly.
        if (this.colorIdentity === "") {
            this.colorIdentity = ["w", "u", "b", "r", "g"][this.random(0, 4)];
        }

        // decide color from determined identity.
        let color = this.getColorFromIdentity(this.colorIdentity);
        this.card.color = color;

        // decide keywords, if any. Max two.        
        let keyword = "";
        let hasKeyword = this.random(0, 2);
        if (hasKeyword >= 1 || rarity >= 3) {
            let keyword1 = this.getKeyword("creature", false, rarity);
            totalScore += keyword1.score;
            console.log("keyword 1:\t" + keyword1.score);
            keyword = keyword1.name;
        } else if (hasKeyword > 1) {
            let keyword2 = this.getKeyword("creature", false, rarity);
            totalScore += keyword2.score;
            console.log("keyword 2:\t" + keyword2.score);
            keyword += ", " + keyword2.name;
        }

        if (this.hasSpecialPermanentKeywords(keyword)) {
            let sAbility = this.handleSpecialPermanentKeywords(keyword, rarity);
            if (sAbility !== undefined) {
                if (sAbility.removeKeyword !== undefined) {
                    keyword = keyword.replace(sAbility.removeKeyword, "");
                    keyword = keyword.replace(", ", "");
                }

                if (ability.length > 0) {
                    // overwrite 2nd ability if any is present.
                    secondAbility = sAbility.text;
                } else {
                    ability = sAbility.text;
                }
            }
        }

        let rarityScore = -rarity / 4;
        totalScore += rarityScore;
        console.log("rarity:\t\t" + rarityScore);
        console.log("\t\t---");
        console.log("TOTAL score:\t" + (Math.round((totalScore + Number.EPSILON) * 100) / 100));

        let cmc = Math.max(1, Math.ceil(totalScore));

        // ensure minimum cmc.
        if (power >= 3 || toughness > 3)
            cmc = Math.max(cmc, 1);
        if (power >= 2 && toughness >= 2)
            cmc = Math.max(cmc, 2);

        let oracle = `${keyword.length > 0 ? `${keyword}\n\n` : ``}${ability}${(secondAbility !== undefined ? `\n\n${secondAbility}` : '')}`;
        let rarityText = this.getRarity(rarity);
        let manacost = this.getManacostFromCmc(cmc, color);

        console.log("cmc:\t\t" + cmc);
        console.log("coloridentity:\t" + this.colorIdentity);
        console.log("color:\t\t" + color);
        console.log("manacost:\t" + manacost);

        this.card.cost = this.resolveManaSymbols(manacost);
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

    getKeyword(type, justSimple, rarity) {
        let keywords = mtgData.keywords.filter(e => e.types.some(t => t === type.toLowerCase()) && (justSimple === undefined || e.hasCost === false && e.nameExtension === ""));
        let selected = keywords[this.random(0, keywords.length - 1)];
        let text = selected.name;

        if (selected.nameExtension.length > 0) {
            text += " " + this.parseSyntax(selected.nameExtension);
        }
        if (selected.hasCost) {
            let cost = 2 / rarity + selected.score * this.random(1, 2);
            let keywordcost = this.getManacostFromCmc(Math.max(1, Math.floor(cost)), this.card.color);
            text += ` - ${keywordcost}`;
        }

        return { name: text, score: selected.score };
    }

    getTriggeredAbility(keywords) {
        let condition = mtgData.permanentConditions[this.random(0, mtgData.permanentConditions.length - 1)];
        let event = mtgData.permanentEvents[this.random(0, mtgData.permanentEvents.length - 1)];

        // handle special keywords.
        if (this.hasSpecialPermanentKeywords(keywords)) {
            let special = this.handleSpecialPermanentKeywords(keywords, condition, event);
            condition.text = special.conditionText;
            condition.context = special.context;
            event.text = special.eventText;
        }

        this.colorIdentity += event.colorIdentity;

        let isReplacement = [false, false, false, true][this.random(0, 3)] && condition.replacementText.length > 0;
        if (isReplacement) {
            return { text: `${this.parseSyntax(condition.replacementText, condition.context)}, instead ${this.parseSyntax(event.text)}.`, score: event.score };
        }

        if (this.flipCoin()) {
            let secondEvent = mtgData.permanentEvents[this.random(0, mtgData.permanentEvents.length - 1)];
            this.colorIdentity += secondEvent.colorIdentity;
            return { text: `${this.parseSyntax(condition.text, condition.context)}, ${this.parseSyntax(event.text, condition.context)}, then ${this.parseSyntax(secondEvent.text, condition.context)}.`, score: (event.score + secondEvent.score) };
        }

        return { text: `${this.parseSyntax(condition.text, condition.context)}, ${this.parseSyntax(event.text, condition.context)}.`, score: event.score };
    }

    getSpellAbility() {
        let event = mtgData.instantSorceryEvents[this.random(0, mtgData.instantSorceryEvents.length - 1)];
        this.colorIdentity += event.colorIdentity;

        if ([false, false, true][this.random(0, 2)] || event.score < 0) {
            let secondEventPool = mtgData.instantSorceryEvents.filter(e => (event.score < 0) ? (e.score > 0) : true);
            let secondEvent = secondEventPool[this.random(0, secondEventPool.length - 1)];
            this.colorIdentity += secondEvent.colorIdentity;

            return { text: `${this.parseSyntax(event.text)}, then ${this.parseSyntax(secondEvent.text)}.`, score: (event.score + secondEvent.score), isComplicated: (event.score < 0 || secondEvent.score < 0) };
        }

        return { text: `${this.parseSyntax(event.text)}.`, score: event.score };
    }

    parseSyntax(text, context) {
        let maxDepth = 10;
        let depth = 0;
        while (text.indexOf("(") >= 0) {
            depth++;
            if (depth >= maxDepth) break;

            let moreThanOne = false;
            if (text.indexOf("(numbername)") >= 0) {
                moreThanOne = true;
                let number = ["two", "two", "two", "two", "two", "three", "three"][this.random(0, 6)];
                text = text.replace("(numbername)", number);
                this.lastNumber += number === "two" ? 2 : 3;
            }
            if (text.indexOf("(number)") >= 0) {
                let number = [1, 1, 1, 2, 2, 2, 2, 3, 3][this.random(0, 8)];
                moreThanOne = moreThanOne || number > 1;
                text = text.replace("(number)", number);
                this.lastNumber += number;
            }
            if (text.indexOf("(number2)") >= 0) {
                let number = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5][this.random(0, 11)];
                moreThanOne = moreThanOne || number > 1;
                text = text.replace("(number2)", number);
                this.lastNumber += number;
            }

            if (text.indexOf("(keyword)") >= 0) {
                text = text.replace("(keyword)", this.getKeyword("creature", true).name);
            }

            let subtype = "";
            if (text.indexOf("(subtype)") >= 0) {
                subtype = mtgData.subtypes[this.random(0, mtgData.subtypes.length - 1)];
                text = text.replace(/\(subtype\)/g, subtype);
            }

            if (text.indexOf("(other)") >= 0 && this.card.subtype !== undefined && this.card.subtype.indexOf(subtype) >= 0) {
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
                useN = type === "enchantment" || type === "artifact";
                text = text.replace("(type)", type);
            }

            text = text.replace("(player)", this.random(0, 1) === 1 ? "player" : "opponent");
            text = text.replace("(permanent)", mtgData.permanentTypes[this.random(0, mtgData.permanentTypes.length - 1)]);
            text = text.replace(/\(name\)/g, this.card.name);
            text = text.replace("(s)", moreThanOne ? "s" : "");
            text = text.replace("(n)", useN ? "n" : "");
            text = text.replace("(color)", this.colors[this.random(0, this.colors.length - 1)]);
            text = text.replace("(type|color)", this.random(0, 1) === 1 ? this.colors[this.random(0, this.colors.length - 1)] : mtgData.types[this.random(0, mtgData.types.length - 1)]);
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
        text = text.replace(/\{w\}/g, this.emojis[10]);
        text = text.replace(/\{u\}/g, this.emojis[11]);
        text = text.replace(/\{b\}/g, this.emojis[12]);
        text = text.replace(/\{r\}/g, this.emojis[13]);
        text = text.replace(/\{g\}/g, this.emojis[14]);
        text = text.replace(/\{x\}/g, this.emojis[15]);
        text = text.replace(/\{t\}/g, this.emojis[16]);

        return text;
    }

    flipCoin() {
        return this.random(0, 1) === 1;
    }

    getColorFromIdentity(colorIdentity) {
        let colorCount = [{ c: "w", count: 0 }, { c: "u", count: 0 }, { c: "b", count: 0 }, { c: "r", count: 0 }, { c: "g", count: 0 }];
        colorCount[0].count = colorIdentity.split("").filter(c => c === "w").length;
        colorCount[1].count = colorIdentity.split("").filter(c => c === "u").length;
        colorCount[2].count = colorIdentity.split("").filter(c => c === "b").length;
        colorCount[3].count = colorIdentity.split("").filter(c => c === "r").length;
        colorCount[4].count = colorIdentity.split("").filter(c => c === "g").length;
        let maxList = colorCount.sort((a, b) => a.count > b.count ? -1 : a.count === b.count ? 0 : 1);
        let max = maxList[0].count;

        if (colorIdentity.length === 5) {
            return colorCount[this.random(0, 4)].c;
        }
        return colorCount.filter(c => c.count === max).map(c => c.c).join("");
    }

    getManacostFromCmc(cmc, colorString) {
        let manacost = "";
        let color = colorString.split("");

        // Mono color.
        if (color.length === 1) {
            if (cmc === 1) {
                manacost = `{${color}}`;
            } else if (cmc === 2) {
                let twoSymbols = this.flipCoin();
                if (twoSymbols) {
                    manacost = `{${color}}{${color}}`;
                }
                else {
                    manacost = `{${cmc - 1}}{${color}}`;
                }
            } else if (cmc === 3) {
                let threeSymbols = this.random(1, 4) === 4;
                if (threeSymbols) {
                    return `{${color}}{${color}}{${color}}`;
                }
                
                let twoSymbols = this.flipCoin();
                if (twoSymbols)
                    return `{1}{${color}}{${color}}`;

                return `{2}{${color}}`;
            } else {
                let twoSymbols = this.flipCoin();
                if (twoSymbols)
                return `{${cmc - 2}}{${color}}{${color}}`;

                let threeSymbols = this.random(1, 4) === 4;
                if (threeSymbols && cmc > 2)
                    return `{${cmc - 3}}{${color}}{${color}}{${color}}`;

                manacost = `{${cmc - 1}}{${color}}`;
            }
        }

        // Two colors.
        if (color.length === 2) {
            if (cmc === 1) {
                manacost = `{${color[this.random(0, 1)]}}`;
            } else if (cmc === 2) {
                manacost = `{${color[0]}}{${color[1]}}`;
            } else if (cmc === 3) {
                let threeSymbols = this.random(0, 2); // 0 = none, 1 = first symbol twice, 2 = second symbol twice.
                switch (threeSymbols) {
                    case 0:
                        manacost = `{1}{${color[0]}}{${color[1]}}`;
                        break;
                    case 1:
                        manacost = `{${color[0]}}{${color[0]}}{${color[1]}}`;
                        break;
                    case 2:
                        manacost = `{${color[0]}}{${color[1]}}{${color[1]}}`;
                        break;
                }
            } else if (cmc > 3) {
                let fourSymbols = this.random(0, 3); // 0 = none, 1 = first symbol twice, 2 = second symbol twice, 3 = both symbol twice.
                switch (fourSymbols) {
                    case 0:
                        manacost = `{${cmc - 2}}{${color[0]}}{${color[1]}}`;
                        break;
                    case 1:
                        manacost = `{${cmc - 3}}{${color[0]}}{${color[0]}}{${color[1]}}`;
                        break;
                    case 2:
                        manacost = `{${cmc - 3}}{${color[0]}}{${color[1]}}{${color[1]}}`;
                        break;
                    case 3:
                        manacost = `{${color[0]}}{${color[0]}}{${color[1]}}{${color[1]}}`;
                        if (cmc > 4) {
                            manacost = `{${cmc - 4}}${manacost}`;
                        }
                        break;
                }
            }
        }

        // More than two colors.
        if (color.length >= 3) {
            if (cmc === 1) {
                manacost = `{${color[this.random(0, color.length - 1)]}}`;
            } else if (cmc === 2) {
                let rnd = this.random(0, color.length - 2);
                manacost = `{${color[rnd]}}{${color[rnd + 1]}}`;
            } else if (cmc === 3) {
                manacost = `{${color[0]}}{${color[1]}}{${color[2]}}`;
            } else if (cmc >= 3) {
                manacost = `{${cmc - 3}}{${color[0]}}{${color[1]}}{${color[2]}}`;
            }
        }

        return manacost;
    }

    getCreatureName(isLegendary) {
        let name = "";
        if (isLegendary) {
            name = mtgData.creatureNames.names[this.random(0, mtgData.creatureNames.names.length - 1)] + ", " + (this.flipCoin() ? "the " : "");
            this.card.supertype = "Legendary";
        }
        return name.toCamelCase()
            + mtgData.creatureNames.adjectives[this.random(0, mtgData.creatureNames.adjectives.length - 1)].toCamelCase()
            + " " + mtgData.creatureNames.nouns[this.random(0, mtgData.creatureNames.nouns.length - 1)].toCamelCase();
    }

    getInstantSorceryName() {
        let name = "";
        return name.toCamelCase()
            + mtgData.spellNames.adjectives[this.random(0, mtgData.spellNames.adjectives.length - 1)].toCamelCase()
            + " " + mtgData.spellNames.nouns[this.random(0, mtgData.spellNames.nouns.length - 1)].toCamelCase();
    }

    hasSpecialPermanentKeywords(keywords) {
        /*entwine
        overload
        kicker

        kicker
        forecast
        tribute*/
        if (keywords === undefined) 
            return false;

        if (keywords.toLowerCase().indexOf("forecast") >= 0 || keywords.toLowerCase().indexOf("tribute") >= 0 || keywords.toLowerCase().indexOf("kicker") >= 0) {
            return true;
        }
    }

    handleSpecialPermanentKeywords(keywords, rarity) {
        let positiveEvents = mtgData.permanentEvents.filter(e => e.score > 0);
        let event = positiveEvents[this.random(0, positiveEvents.length - 1)];

        let cost = 2 / rarity + event.score * this.random(1, 2);
        let keywordcost = this.getManacostFromCmc(Math.max(1, Math.floor(cost)), this.card.color);

        if (keywords.toLowerCase().indexOf("forecast") >= 0) {
            return { text: this.parseSyntax(`Forecast - ${keywordcost}, Reveal (self) from your hand: ${event.text.toCamelCase()}.`), removeKeyword: "forecast" };
        }
        if (keywords.toLowerCase().indexOf("tribute") >= 0) {
            return { text: this.parseSyntax(`When (self) enters the battlefield, if tribute wasn't paid, ${event.text}.`) };
        }
        if (keywords.toLowerCase().indexOf("kicker") >= 0) {
            return { text: this.parseSyntax(`If (self) was kicked, ${event.text}.`) };
        }
        return undefined;
    }
}

module.exports = MtgParser;

/*
special keywords:



this spell can't be countered.
*/