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

        this.defaultAwaitReactionFilter = (reaction, user) => { return user.id !== reaction.message.author.id; };
        this.defaultAwaitReactionOptions = { max: 1, time: 30000 };
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
        this.thumbsup = message.guild.emojis.cache.find(e => e.name === 'thumbsup::skin-tone-1');
        this.thumbsdown = message.guild.emojis.cache.find(e => e.name === 'thumbsdown::skin-tone-1');

        let validInputs = ["creature", "instant", "sorcery"];
        let cardType = validInputs[this.random(0, validInputs.length - 1)];

        if (message.content == "!mtg help") {
            let supportedCardTypes = validInputs.join(", ");
            this.discordHelper.richEmbedMessage(message, new MtgHelpResponse(supportedCardTypes));
            return;
        }

        let args = message.content.split(" ");//mtgData.types[this.random(0, mtgData.types.length - 1)];
        if (args.length > 1)
            cardType = args[1];

        if (!mtgData.types.some(t => t === cardType.toLowerCase())) {
            message.channel.send(`"${cardType}" is not an official card type. Leave blank or use "creature", for example.`)
            return;
        }

        this.log = [];
        this.log.push(`--- Creating new ${cardType} card... ---`);

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

        this.log.push(`cardname:\t${this.card.name}`);
        console.log(this.log.join("\n"));
    }

    sendCard(message) {
        let self = this;
        this.discordHelper.richEmbedMessage(message, new MtgResponse(this.card), function (embed) {
            embed.react("👍🏻");
            embed.react("📢");
            embed.awaitReactions(self.defaultAwaitReactionFilter, self.defaultAwaitReactionOptions)
                .then(collected => {
                    const reaction = collected.first();
                    if (reaction === undefined) return;
                    switch (reaction.emoji.name) {
                        case "👍🏻":
                            // do nothing. appreciate the vote.
                            return;
                        case "📢":
                            let reportChannel = message.client.channels.cache.find(c => c.name === "bot-reports");
                            let username = reaction.users.cache.find(e => e.username !== reaction.message.author.username);
                            reportChannel.send(`MtG: ${username} reported the following card:\n${reaction.message.url}`);
                            reportChannel.send("Logs:\n" + self.log.join("\n"));
                            return;
                    }
                }).catch(e => this.log.push(e));
        });
    }

    createInstantCard(message) {
        this.lastNumber = 0;

        let name = this.getInstantSorceryName();
        this.card = new MtgCard();
        this.card.name = name;

        let rarity = [1, 1, 2, 2, 3][this.random(0, 4)]; // 1 = common, 4 = mythic
        let rarityText = this.getRarity(rarity);
        this.card.rarity = rarityText;

        let oracle = this.getSpellAbility(rarity);

        // evaluate cmc.
        let totalScore = 0.4 + oracle.score + (this.lastNumber > 8 ? this.lastNumber / 4 : this.lastNumber > 4 ? this.lastNumber / 3 : this.lastNumber > 0 ? this.lastNumber / 2 : 1) - rarity / 6;
        let cmc = Math.max(1, Math.ceil(totalScore));
        if (oracle.isComplicated) {
            rarity = Math.max(2, rarity);
        }

        let color = this.getColorFromIdentity(this.colorIdentity);
        let manacost = this.getManacostFromCmc(cmc, color);

        this.log.push("lastNumber:\t" + this.lastNumber);
        this.log.push("o-score:\t" + oracle.score);
        this.log.push("cmc:\t\t" + cmc);
        this.log.push("coloridentity:\t" + this.colorIdentity);
        this.log.push("color:\t\t" + color);
        this.log.push("manacost:\t" + manacost);

        this.card.type = "Instant";
        this.card.subtype = undefined;
        this.card.power = undefined;
        this.card.color = color;
        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.oracle = this.resolveManaSymbols(oracle.text.toCamelCase());
        this.card.flavor = "";

        this.sendCard(message);
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
        let totalScore = 0.0 + oracle.score + (this.lastNumber > 8 ? this.lastNumber / 4 : this.lastNumber > 4 ? this.lastNumber / 3 : this.lastNumber > 0 ? this.lastNumber / 2 : 1) - rarity / 6;
        let cmc = Math.max(1, Math.ceil(totalScore));
        if (oracle.isComplicated) {
            rarity = Math.max(2, rarity);
        }

        let color = this.getColorFromIdentity(this.colorIdentity);
        let manacost = this.getManacostFromCmc(cmc, color);

        this.log.push("lastNumber:\t" + this.lastNumber);
        this.log.push("o-score:\t" + oracle.score);
        this.log.push("cmc:\t\t" + cmc);
        this.log.push("coloridentity:\t" + this.colorIdentity);
        this.log.push("color:\t\t" + color);
        this.log.push("manacost:\t" + manacost);

        this.card.type = "Sorcery";
        this.card.subtype = undefined;
        this.card.power = undefined;
        this.card.color = color;
        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.oracle = this.resolveManaSymbols(oracle.text.toCamelCase());
        this.card.flavor = "";

        this.sendCard(message);
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
        let name = this.getCreatureName(isLegendary);
        this.card.name = name;

        let totalScore = 0;
        this.log.push("score calculation:");

        let power = this.powers[this.random(0, this.powers.length - 1)];
        totalScore += power / 2;
        this.log.push("power :\t\t" + (power / 2));

        let toughness = this.toughnesses[this.random(0, this.toughnesses.length - 1)];
        totalScore += toughness / 3; /* less weight than power */
        this.log.push("toughness:\t " + (toughness / 2));

        // decide triggered abilities.
        let ability = "";
        let secondAbility = "";
        let hasAbility = [0, 0, 0, 1, 1, 1, 2][this.random(0, 6)];

        if (hasAbility >= 1 || rarity >= 4) {
            let ability1 = this.getTriggeredAbility();
            totalScore += ability1.score;
            this.log.push("ability 1:\t" + ability1.score);
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
            let ability2 = this.flipCoin() ? this.getActivatedAbility(rarity) : this.getTriggeredAbility();
            totalScore += ability2.score;
            this.log.push("ability 2:\t" + ability2.score);
            secondAbility = ability2.text;

            rarity = Math.max(2, rarity); /* at least uncommon if two abilities. */
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
            this.log.push("keyword 1:\t" + keyword1.score);
            keyword = keyword1.name;
        } else if (hasKeyword > 1) {
            let keyword2 = this.getKeyword("creature", false, rarity);
            totalScore += keyword2.score;
            this.log.push("keyword 2:\t" + keyword2.score);
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
        this.log.push("rarity:\t\t" + rarityScore);
        this.log.push("\t\t---");
        this.log.push("TOTAL score:\t" + (Math.round((totalScore + Number.EPSILON) * 100) / 100));

        let cmc = Math.max(1, Math.ceil(totalScore));

        // ensure color p/t rules.
        if (this.card.color.indexOf("w") >= 0 || this.card.color.indexOf("u") >= 0) {
            let p = power;
            let t = toughness;
            toughness = Math.max(power, toughness);
            power = Math.min(p, t);
        }

        if (this.flipCoin()) {
            let dif = power - toughness;
            if (dif > 3) {
                power -= 1;
                toughness += 1;
            }
            if (dif < -3) {
                power += 1;
                toughness -= 1;
            }
        }

        // ensure minimum cmc.
        if (power >= 3 || toughness > 3)
            cmc = Math.max(cmc, 1);
        if (power >= 2 && toughness >= 2)
            cmc = Math.max(cmc, 2);

        let oracles = [];
        if (keyword.length > 0) oracles.push(keyword);
        if (ability.length > 0) oracles.push(ability);
        if (secondAbility.length > 0) oracles.push(secondAbility);
        let oracle = oracles.join("\n\n");

        let rarityText = this.getRarity(rarity);
        let manacost = this.getManacostFromCmc(cmc, color);

        this.log.push("cmc:\t\t" + cmc);
        this.log.push("coloridentity:\t" + this.colorIdentity);
        this.log.push("color:\t\t" + color);
        this.log.push("manacost:\t" + manacost);

        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.rarity = rarityText;
        this.card.oracle = this.resolveManaSymbols(oracle);
        this.card.flavor = "";
        this.card.power = power;
        this.card.toughness = toughness;

        this.sendCard(message);
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
        let color = this.card.color === "" ? "wubrg" : this.card.color;
        let keywords = mtgData.keywords.filter(e =>
            color.split("").some(c => e.colorIdentity.indexOf(c) >= 0) /* same color */
            && e.types.some(t => t === type.toLowerCase()) /* same type */
            && (justSimple === undefined || e.hasCost === false && e.nameExtension === "" && e.excludeFromSimple === undefined)); /* simple conditions */

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

        this.colorIdentity += event.colorIdentity;

        let isReplacement = [false, false, false, true][this.random(0, 3)] && condition.replacementText.length > 0;
        if (isReplacement) {
            return { text: `${this.parseSyntax(condition.replacementText, condition.context)}, instead ${this.parseSyntax(event.text)}.`, score: event.score };
        }

        if (this.flipCoin() && event.nofollowup === undefined) {
            let secondEvent = mtgData.permanentEvents[this.random(0, mtgData.permanentEvents.length - 1)];
            this.colorIdentity += secondEvent.colorIdentity;
            return { text: `${this.parseSyntax(condition.text, condition.context)}, ${this.parseSyntax(event.text, condition.context)}, then ${this.parseSyntax(secondEvent.text, condition.context)}.`, score: (event.score + secondEvent.score) };
        }

        return { text: `${this.parseSyntax(condition.text, condition.context)}, ${this.parseSyntax(event.text, condition.context)}.`, score: event.score };
    }

    getActivatedAbility(rarity) {
        let positiveEvents = mtgData.permanentEvents.filter(e => e.score > 0);
        let event = positiveEvents[this.random(0, positiveEvents.length - 1)];

        let cost = 2 / rarity + event.score * this.random(1, 2);
        cost = Math.max(1, Math.floor(cost));

        let tapSymbol = this.flipCoin() || cost > 2.0;
        let keywordcost = "";

        this.colorIdentity += event.colorIdentity;

        // get color at this stage.
        let color = this.getColorFromIdentity(event.colorIdentity);

        if ([false, false, false, true][this.random(0, 3)]) {
            let activated = this.getActivatedCost(Math.min(6, cost), color);
            keywordcost = activated.text.toCamelCase();
            //event.score += (cost - activated.score);
            if (tapSymbol)
                keywordcost = `{t}, ${keywordcost}`;
        }
        else {
            keywordcost = this.getManacostFromCmc(cost, color);
            if (tapSymbol)
                keywordcost = `${keywordcost !== "" ? keywordcost + ", " : ""}{t}`;
        }

        this.colorIdentity += event.colorIdentity;

        return { text: `${this.parseSyntax(keywordcost)}: ${this.parseSyntax(event.text.toCamelCase())}.`, score: event.score };
    }

    getSpellAbility(rarity) {
        let event = mtgData.instantSorceryEvents[this.random(0, mtgData.instantSorceryEvents.length - 1)];
        this.colorIdentity += event.colorIdentity;

        if ([false, false, true][this.random(0, 2)] || event.score < 0) {
            let secondEventPool = mtgData.instantSorceryEvents.filter(e => (event.score < 0) ? (e.score > 0) : true);
            let secondEvent = secondEventPool[this.random(0, secondEventPool.length - 1)];
            this.colorIdentity += secondEvent.colorIdentity;

            if (this.random(1, 3) == 3) {
                let sKeyword = this.handleSpecialSpellKeywords(event.text, rarity);
                if (sKeyword.text.length > 0) {
                    if (sKeyword.secondAbility.length > 0) {
                        secondEvent.text = sKeyword.secondAbility;
                    }
                    if (sKeyword.ability.length > 0) {
                        event.text = sKeyword.ability;
                        return { text: `${this.parseSyntax(event.text)}.`, score: event.score };
                    }
                    event.text = `${sKeyword.text}\n\n${event.text.toCamelCase()}`;
                }
            }

            return { text: `${this.parseSyntax(event.text)}, then ${this.parseSyntax(secondEvent.text)}.`, score: (event.score + secondEvent.score), isComplicated: (event.score < 0 || secondEvent.score < 0) };
        }

        if (this.random(1, 8) == 8) {
            let sKeyword = this.handleSpecialSpellKeywords(event.text, rarity);
            if (sKeyword.text.length > 0) {
                if (sKeyword.ability.length > 0) {
                    event.text = sKeyword.ability;
                }
                event.text = `${sKeyword.text}\n\n${event.text.toCamelCase()}`;
            }
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
            if (text.indexOf("(numbername2)") >= 0) {
                moreThanOne = true;
                let number = ["two", "two", "three", "three", "three", "four", "five"][this.random(0, 6)];
                text = text.replace("(numbername2)", number);
                this.lastNumber += number === "two" ? 2 : number === "three" ? 3 : number === "four" ? 4 : 5;
            }
            if (text.indexOf("(number)") >= 0) {
                let number = [1, 1, 1, 2, 2, 2, 2, 3, 3][this.random(0, 8)];
                moreThanOne = moreThanOne || number > 1;
                text = text.replace("(number)", number);
                this.lastNumber += number;
            }
            if (text.indexOf("(number2)") >= 0) {
                let number = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6][this.random(0, 12)];
                moreThanOne = moreThanOne || number > 1;
                text = text.replace("(number2)", number);
                this.lastNumber += number;
            }

            if (text.indexOf("(keyword)") >= 0) {
                text = text.replace("(keyword)", this.getKeyword("creature", true).name.toLowerCase());
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

            if (text.indexOf("(type/counterable)") >= 0) {
                let type = mtgData.types[this.random(0, mtgData.types.length - 1)]
                text = text.replace("(type/counterable)", type.replace("land", "creature"));
            }

            if (text.indexOf("(mana)") >= 0) {
                let symbols = this.colorIdentity.split("");
                let symbol = `{${symbols[this.random(0, this.colorIdentity.length - 1)]}}`;
                if (this.flipCoin()) symbol += symbol;
                text = text.replace("(mana)", symbol);
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

        if (colorIdentity === "wubrg") {
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
            } else if (cmc > 3) {
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
            } else if (cmc > 3) {
                manacost = `{${cmc - 3}}{${color[0]}}{${color[1]}}{${color[2]}}`;
            }
        }

        return manacost;
    }

    getActivatedCost(cost, color) {
        let costs = mtgData.permanentActivatedCosts.filter(e =>
            color.split("").some(c => e.colorIdentity.indexOf(c) >= 0) /* same color */
            && cost <= e.score); /* score of activatedcost = "value" of ability */

        if (costs.length <= 0)
            return "";

        let activated = costs[this.random(0, costs.length - 1)];
        this.colorIdentity += activated.colorIdentity;

        return activated;
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
        if (keywords === undefined)
            return false;

        if (keywords.toLowerCase().indexOf("forecast") >= 0 || keywords.toLowerCase().indexOf("tribute") >= 0 || keywords.toLowerCase().indexOf("kicker") >= 0 || keywords.toLowerCase().indexOf("ascend") >= 0) {
            return true;
        }
    }

    handleSpecialPermanentKeywords(keywords, rarity) {
        let positiveEvents = mtgData.permanentEvents.filter(e => e.score > 0);
        let event = positiveEvents[this.random(0, positiveEvents.length - 1)];

        // update color.
        this.colorIdentity += event.colorIdentity;
        this.card.color = this.getColorFromIdentity(this.colorIdentity);

        let cost = 2 / rarity + event.score * this.random(1, 2);
        let keywordcost = this.getManacostFromCmc(Math.max(1, Math.floor(cost)), this.card.color);

        if (keywords.toLowerCase().indexOf("forecast") >= 0) {
            return { text: this.parseSyntax(`Forecast - ${keywordcost}, Reveal (self) from your hand: ${event.text.toCamelCase()}.`), removeKeyword: "Forecast" };
        }
        if (keywords.toLowerCase().indexOf("tribute") >= 0) {
            return { text: this.parseSyntax(`When (self) enters the battlefield, if tribute wasn't paid, ${event.text}.`) };
        }
        if (keywords.toLowerCase().indexOf("kicker") >= 0) {
            if (this.flipCoin() && this.card.type == "Creature")
                return { text: this.parseSyntax(`If (self) was kicked, it enters the battlefield with (numbername) +1/+1 counters on it.`) };
            return { text: this.parseSyntax(`If (self) was kicked, ${event.text}.`) };
        }
        if (keywords.toLowerCase().indexOf("ascend") >= 0) {
            let condition = mtgData.permanentConditions[this.random(0, mtgData.permanentConditions.length - 1)];
            return { text: this.parseSyntax(`${condition.text.toCamelCase()}, if you control the city's blessing, ${event.text}.`) };
        }
        return undefined;
    }

    handleSpecialSpellKeywords(oracleText, rarity) {
        let instantSorceryKeywords = mtgData.keywords.filter(e => e.score > 0 && e.types.some(t => t === "instant" || t === "sorcery"));
        let keyword = instantSorceryKeywords[this.random(0, instantSorceryKeywords.length - 1)];
        let ability = "";
        let secondAbility = "";

        if (keyword === undefined || keyword === null) {
            return { text: "", ability: "", secondAbility: "" };
        }

        let score = keyword.score;

        if (keyword.name === "Kicker") {
            let positiveEvents = mtgData.permanentEvents.filter(e => e.score > 0);
            let event = positiveEvents[this.random(0, positiveEvents.length - 1)];
            secondAbility = event.name;
            score += event.score;
            this.colorIdentity += event.colorIdentity;
        }

        if (keyword.name === "Entwine") {
            let positiveEvents = mtgData.permanentEvents.filter(e => e.score > 0);
            let event1 = positiveEvents[this.random(0, positiveEvents.length - 1)];
            let event2 = positiveEvents[this.random(0, positiveEvents.length - 1)];
            ability = `choose one:\n  • ${event1.name.toCamelCase()}\n  • ${event2.name.toCamelCase()}`;
            score += (event1.score + event2.score) / 2;
            this.colorIdentity = event1.colorIdentity + event2.colorIdentity; /* yes, overwrite color identity. */
        }

        if (keyword.name === "Overload") {
            if (oracleText.indexOf("target") < 0)
                return { text: "", ability: "", secondAbility: "" };
            score + 1;
        }
        if (keyword.name === "Spectacle") {
            score -= 1;
        }
        if (keyword.name === "Miracle") {
            score -= 1;
        }

        score = Math.max(1, score);

        // update color.
        this.colorIdentity += keyword.colorIdentity;
        this.card.color = this.getColorFromIdentity(this.colorIdentity);

        let keywordName = keyword.nameExtension.length > 0 ? `${keyword.name} ${this.parseSyntax(keyword.nameExtension)}` : keyword.name;

        if (keyword.hasCost) {
            let cost = 2 / rarity + score * this.random(2, 3) / 3;
            let keywordcost = this.getManacostFromCmc(Math.max(1, Math.floor(cost)), this.card.color);
            return { text: `${keywordName}${keyword.nameExtension > 0 ? ' -' : ''} ${keywordcost}`, ability: ability, secondAbility: secondAbility };
        }

        return { text: keywordName, ability: ability, secondAbility: secondAbility };
    }
}

module.exports = MtgParser;

/*
special keywords:



this spell can't be countered.
*/