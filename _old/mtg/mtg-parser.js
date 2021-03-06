const { DiscordHelper } = require('../discord-helper.js');
const Canvas = require('canvas');
const Discord = require('discord.js');
const fs = require('fs');

const MtgResponse = require('./mtg-response.js');
const MtgHelpResponse = require('./mtg-response-help.js');
const MtgCard = require('./mtg-card.js');

const config = require('../../config.json');
const mtgData = require('./../data/mtg.json');

class MtgParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();

        this.colors = ["white", "blue", "black", "red", "green", "colorless"];
        this.powers = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 8, 9, 10];
        this.toughnesses = [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 8, 9, 10];

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
            message.guild.emojis.cache.find(e => e.name === 'mtg_T'),

            message.guild.emojis.cache.find(e => e.name === 'mtg_BG'), // 17
            message.guild.emojis.cache.find(e => e.name === 'mtg_BR'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_GU'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_GW'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_RG'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_RW'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_UB'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_UR'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_WB'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_WU'),

            message.guild.emojis.cache.find(e => e.name === 'mtg_zero'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_plus1'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_plus2'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_plus3'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_minus1'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_minus2'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_minus3'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_minus4'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_minus5'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_minus6'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_minus7'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_minus8'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_pw_2'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_pw_3'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_pw_4'),
            message.guild.emojis.cache.find(e => e.name === 'mtg_pw_5') // 27
        ];
    }

    async startWorkflow(message) {
        this.getEmojis(message);

        let validInputs = ["creature", "instant", "sorcery", "planeswalker", "enchantment"];
        let cardType = validInputs[this.random(0, validInputs.length - 1)];

        if (message.content == "!mtg help") {
            let supportedCardTypes = validInputs.join(", ");
            this.discordHelper.richEmbedMessage(message, new MtgHelpResponse(supportedCardTypes));
            return;
        }

        let args = message.content.split(" ");
        if (args.length > 1)
            cardType = args[1];

        if (!validInputs.some(t => t === cardType.toLowerCase())) {
            message.channel.send(`"${cardType}" is not an official card type. Leave blank or use "creature", for example.`)
            return;
        }

        this.log = [];
        this.log.push(`--- Creating new ${cardType} card... ---`);

        this.lastNumber = 0;
        this.lastNumberCount = 0;
        this.lastAbilityScore = 0;
        this.colorIdentity = "";

        try {
            switch (cardType) {
                case "creature":
                    await this.createCreatureCard(message);
                    break;
                case "instant":
                    this.createInstantCard(message);
                    break;
                case "sorcery":
                    this.createSorceryCard(message);
                    break;
                case "planeswalker":
                    this.createPlaneswalkerCard(message);
                    break;
                case "enchantment":
                    this.createEnchantmentCard(message);
                    break;
            }
        } catch (e) {
            let reportChannel = message.client.channels.cache.find(c => c.name === "bot-reports");
            reportChannel.send(`MtG: crashed with: \n${e.stack}.`);

            throw e;
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

        let name = this.getInstantSorceryName();
        this.card = new MtgCard();
        this.card.name = name;
        this.card.subtype = this.random(1, 20) == 20 ? "Arcane" : undefined;

        let rarity = [1, 1, 2, 2, 2, 3, 3, 4][this.random(0, 7)]; // 1 = common, 4 = mythic
        let rarityText = this.getRarity(rarity);
        this.card.rarity = rarityText;

        let oracle = this.getSpellAbility(rarity, "instant");

        // evaluate cmc.
        let totalScore = 0.4 + oracle.score + (this.lastNumber > 0 ? this.lastNumber / 3 : 0) + (Math.max(0, this.lastNumberCount - 1)) - rarity / 6;
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
        this.card.power = undefined;
        this.card.color = color;
        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.oracle = this.resolveManaSymbols(oracle.text.toCamelCase());
        this.card.flavor = "";

        this.sendCard(message);
    }

    createEnchantmentCard(message) {

        let name = this.getEnchantmentName();
        this.card = new MtgCard();
        this.card.name = name;
        this.card.type = "Enchantment";
        let isLegendary = [false, false, false, false, false, true][this.random(0, 5)];
        this.card.supertype = isLegendary ? "Legendary" : undefined;
        let rarity = [1, 1, 2, 2, 3][this.random(0, 4)]; // 1 = common, 4 = mythic
        this.rarityNumber = rarity;
        this.card.rarity = this.getRarity(rarity);

        let oracle = this.getEnchantmentOracle();
        let cmc = Math.max(1, Math.ceil(oracle.score));

        let color = this.getColorFromIdentity(this.colorIdentity);
        let manacost = this.getManacostFromCmc(cmc, color);

        this.log.push("lastNumber:\t" + this.lastNumber);
        this.log.push("o-score:\t" + oracle.score);
        this.log.push("cmc:\t\t" + cmc);
        this.log.push("coloridentity:\t" + this.colorIdentity);
        this.log.push("color:\t\t" + color);
        this.log.push("manacost:\t" + manacost);

        this.card.power = undefined;
        this.card.color = color;
        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.oracle = this.resolveManaSymbols(oracle.text.toCamelCase());
        this.card.flavor = "";

        this.sendCard(message);
    }

    createPlaneswalkerCard(message) {

        let name = this.getPlaneswalkerName();
        this.card = new MtgCard();
        this.card.name = name;
        this.card.supertype = "Legendary";
        this.card.type = "Planeswalker";
        this.card.subtype = name.split(" ")[0].replace(",", "");

        let oracle = this.getPlaneswalkerOracle();
        let cmc = Math.max(2, Math.ceil(oracle.score + 0.5));

        let color = this.getColorFromIdentity(this.colorIdentity);
        let manacost = this.getManacostFromCmc(cmc, color);

        this.log.push("lastNumber:\t" + this.lastNumber);
        this.log.push("o-score:\t" + oracle.score);
        this.log.push("cmc:\t\t" + cmc);
        this.log.push("coloridentity:\t" + this.colorIdentity);
        this.log.push("color:\t\t" + color);
        this.log.push("manacost:\t" + manacost);

        let rarity = oracle.firstPositive ? 4 : 3; // 1 = common, 4 = mythic
        let rarityText = this.getRarity(rarity);
        this.card.rarity = rarityText;

        this.card.power = undefined;
        this.card.color = color;
        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.oracle = this.resolveManaSymbols(oracle.text.toCamelCase());
        this.card.flavor = "";

        this.sendCard(message);
    }

    createSorceryCard(message) {

        let name = this.getInstantSorceryName();
        this.card = new MtgCard();
        this.card.name = name;
        this.card.subtype = this.random(1, 20) == 20 ? "Arcane" : undefined;

        let rarity = [1, 1, 2, 2, 3][this.random(0, 4)]; // 1 = common, 4 = mythic
        let rarityText = this.getRarity(rarity);
        this.card.rarity = rarityText;

        let oracle = this.getSpellAbility(rarity, "sorcery");

        // evaluate cmc.
        let totalScore = -0.2 + oracle.score + (this.lastNumber > 0 ? this.lastNumber / 3 : 0) + (Math.max(0, this.lastNumberCount - 1)) - rarity / 6;
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
        this.card.power = undefined;
        this.card.color = color;
        this.card.cost = this.resolveManaSymbols(manacost);
        this.card.oracle = this.resolveManaSymbols(oracle.text.toCamelCase());
        this.card.flavor = "";

        this.sendCard(message);
    }

    async createCreatureCard(message) {

        this.card = new MtgCard();
        this.card.image = "https://i.pinimg.com/564x/5f/d1/7d/5fd17dd54f1ca06df2d83c221f162911.jpg";
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

        let toughness = this.random(1,5) == 5 ? power : this.toughnesses[this.random(0, this.toughnesses.length - 1)];
        totalScore += toughness / 2.5; /* less weight than power */
        this.log.push("toughness:\t " + (toughness / 2.5));

        // decide triggered abilities.
        let ability = "";
        let secondAbility = "";
        let hasAbility = [0, 0, 1, 1, 1, 1, 2, 2][this.random(0, 7)];

        if (hasAbility >= 1 || rarity >= 4) {
            let isFirstStatic = this.random(1, 6) == 6;
            let abilityScore = 0;

            if (isFirstStatic) {
                let staticEvent = mtgData.permanentStatics[this.random(0, mtgData.permanentStatics.length - 1)];
                ability = this.parseSyntax(staticEvent.text).replace("3", "2").toCamelCase() + "."; /* don't allow +3 */
                abilityScore = staticEvent.score * this.random(3, 4) / 4;
                this.colorIdentity += staticEvent.colorIdentity;
            } else {
                let ability1 = this.flipCoin() ? this.getActivatedAbility(rarity) : this.getTriggeredAbility();
                ability = ability1.text;
                abilityScore = ability1.score;
            }

            totalScore += abilityScore;
            this.log.push("ability static:\t" + abilityScore);

            // TODO: verify if this is necessary.
            if (abilityScore > 1.0) {
                rarity = Math.max(rarity + 1, 4);
            }
            if (abilityScore < -1.0) {
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
        let hasKeyword = [0, 0, 1, 2][this.random(0, 3)];
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

                if (secondAbility.length > 0) {
                    // overwrite 2nd ability if any is present.
                    secondAbility = sAbility.text;
                } else {
                    ability = sAbility.text;
                }
            }
        }

        let rarityScore = rarity / 4;
        totalScore += -1 + (this.lastNumber > 0 ? this.lastNumber / 4 : 0) + (Math.max(0, this.lastNumberCount - 1)) - rarityScore;
        this.log.push("rarity:\t\t-" + rarityScore);
        this.log.push("\t\t---");
        this.log.push("TOTAL score:\t" + (Math.round((totalScore + Number.EPSILON) * 100) / 100));

        let cmc = Math.min(11, Math.max(1, Math.ceil(totalScore)));

        // ensure color p/t rules.
        if (this.card.color.indexOf("w") >= 0 || this.card.color.indexOf("u") >= 0) {
            let p = power;
            let t = toughness;
            toughness = Math.max(p, t);
            power = Math.min(p, t);
        }
        if (this.card.color.indexOf("r") >= 0 && this.flipCoin()) {
            let p = power;
            let t = toughness;
            power = Math.max(p, t);
            toughness = Math.min(p, t);
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

        // ensure subtype.
        if (keyword.indexOf("Changeling") >= 0) {
            this.card.subtype = "Shapeshifter";
        }

        // ensure persist toughness.
        if (keyword.indexOf("Persist") >= 0) {
            this.card.toughness = Math.max(this.card.toughness, 2);
        }

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
        this.card.oracle = oracle;//this.resolveManaSymbols(oracle);
        this.card.flavor = "";
        this.card.power = power;
        this.card.toughness = toughness;

        // ==============================================================================
        // ======================== CARD RENDER ENGINE ==================================
        // ==============================================================================

        Canvas.registerFont('src/assets/fonts/MPLANTIN.ttf', { family: "mplantin" });
        Canvas.registerFont('src/assets/fonts/MPLANTIN-BOLD.ttf', { family: "mplantinbold" });
        Canvas.registerFont('src/assets/fonts/MatrixBold.ttf', { family: "matrixbold" });

        const canvas = Canvas.createCanvas(630, 880);
        const ctx = canvas.getContext('2d');
    
        // fill black.
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        const colorMapping = this.card.color.length <= 2 ? this.card.color : "m";
        const fileName =  `${colorMapping}${this.card.type === 'Creature' ? "_creature" : ""}`;
        const cardFrame = await Canvas.loadImage(`src/assets/img/borders/${fileName}.png`);
        ctx.drawImage(cardFrame, 0, 0, canvas.width, canvas.height);

        console.log(this.card);

        ctx.fillStyle = '#000000';
        ctx.font = `${this.card.name.length > 25 ? 34 : 38}px matrixbold`;

        // render card name.
        const cardTitle = this.card.name;
        ctx.fillText(cardTitle, 55, 78, 585 - (this.card.cost.length * 17));

        // render card cost.
        await this.overlaySymbols(ctx, this.card.cost, 17, 32, 577 - (this.card.cost.length * 16), 76, true);

        // render card type.
        const cardTypeAndSubtype = `${(this.card.supertype !== undefined ? this.card.supertype + ' ' : '')}${this.card.type}${(this.card.subtype !== undefined ? ` — ${this.card.subtype}` : '')}`;
        ctx.font = '36px matrixbold';
        ctx.fillText(cardTypeAndSubtype, 55, 530, 520);

        // render card art.
        const artPath = "src/assets/img/cards/creature/";
        const files = fs.readdirSync(artPath);
        let randomArtworkFile = files[this.random(0, files.length - 1)];
        const artwork = await Canvas.loadImage(artPath + randomArtworkFile);
        this.drawImageProp(ctx, artwork, 50, 102, 530, 385, 0.5, 0.2);

        // render expansion symbol.
        const symbolFileName = ["common", "uncommon", "rare", "mythic"][rarity - 1];
        const expansionSymbol = await Canvas.loadImage(`src/assets/img/expansion/${symbolFileName}.png`);
        ctx.drawImage(expansionSymbol, 542, 502, 35, 35);

        let oracleFontSize = 28;
        let maxCharactersPerLine = 42;
        let lineOffset = 50;

        const totalOracleText = ability + secondAbility + keyword;
        const isLongOracle = totalOracleText.length > 120;
        const isVeryLongOracle = totalOracleText.length > 220;
        if (isLongOracle) {
            oracleFontSize = 26;
            maxCharactersPerLine = 45;
            lineOffset = 45;
        }
        if (isVeryLongOracle) {
            oracleFontSize = 23;
            maxCharactersPerLine = 50;
            lineOffset = 40;
        }
        const gapSize = isLongOracle ? 14 : 16;
        console.log(totalOracleText.length);

        ctx.font = `${oracleFontSize}px mplantin`;

        const wrappedKeywordText = this.wordWrapText(keyword, maxCharactersPerLine);
        const wrappedAbilityText = this.wordWrapText(ability, maxCharactersPerLine);
        const abilityWordWrapCount = this.lastWordWrapCount;
        const wrappedAbility2Text = this.wordWrapText(secondAbility, maxCharactersPerLine);

        // render oracle text.
        let offset = 590;
        if (keyword.length > 0) {
            ctx.fillText(wrappedKeywordText, 55, offset, 520);
            offset += lineOffset;
        }
        ctx.fillText(wrappedAbilityText.replace(/X[^\s]{1}/g, "    "), 55, offset, 520);
        await this.overlaySymbols(ctx, wrappedAbilityText, gapSize, oracleFontSize, 55, offset);
        
        offset += lineOffset + (15 * abilityWordWrapCount);
        ctx.fillText(wrappedAbility2Text.replace(/X[^\s]{1}/g, "    "), 55, offset, 520);
        await this.overlaySymbols(ctx, wrappedAbility2Text, gapSize, oracleFontSize, 55, offset);
        
        // render power and toughnes.
        if (this.card.type === "Creature") {
            const pt = `${this.card.power}/${this.card.toughness}`;
            const offset = pt.length === 3 ? 520 : pt.length === 4 ? 508 : 500;
            ctx.font = pt.length > 4 ? '37px mplantinbold' : '38px mplantinbold';
            ctx.fillText(pt, offset, 822);
        }
    
        // render card number;
        ctx.font = `$14px mplantin`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.random(100, 999), 38, 833);
 

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
    
        // this.sendCard(message);
        message.channel.send('', attachment);

        // ==============================================================================
        // ==============================================================================
        // ==============================================================================
    }

    async overlaySymbols(ctx, text, gap, size, positionX, positionY, drawShadow) {

        let i = this.regexIndexOf(text, /X[^\s]{1}/g);
        while (i >= 0) {
            if (drawShadow) {
                const shadowSymbol = await Canvas.loadImage(`src/data/img/mtg mana icons/mtg_Shadow.png`);
                ctx.drawImage(shadowSymbol, positionX + i * gap, positionY + 9 - size, size, size);
            }

            const s = text.substring(i + 1, i + 2).toUpperCase();
            const symbol = await Canvas.loadImage(`src/data/img/mtg mana icons/mtg_${s}.png`);
            ctx.drawImage(symbol, positionX + i * gap, positionY + 5 - size, size, size);

            i = this.regexIndexOf(text, /X[^\s]{1}/g, i + 1);
        }
    }

    regexIndexOf(string, regex, startpos) {
        var indexOf = string.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }

    wordWrapText(text, maxCharactersPerLine) {
        this.lastWordWrapCount = 0;

        let resultString = '';
        let remainingWords = text.split(" ");
        while (remainingWords.length > 0)
        {
            let nextWordLength = 0;
            let line = "";
            do {
                line += remainingWords[0] + " ";
                remainingWords.splice(0, 1);
                nextWordLength = line.length + (remainingWords.length > 0 ? remainingWords[0].length : 0);
            } while (nextWordLength < maxCharactersPerLine && remainingWords.length > 0);
            resultString += line + "\r\n";
            this.lastWordWrapCount++;
        }
        return resultString.trim().substring(0, resultString.length - 2);
    }

    drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

        if (arguments.length === 2) {
            x = y = 0;
            w = ctx.canvas.width;
            h = ctx.canvas.height;
        }
    
        // default offset is center
        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;
    
        // keep bounds [0.0, 1.0]
        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;
    
        var iw = img.width,
            ih = img.height,
            r = Math.min(w / iw, h / ih),
            nw = iw * r,   // new prop. width
            nh = ih * r,   // new prop. height
            cx, cy, cw, ch, ar = 1;
    
        // decide which gap to fill    
        if (nw < w) ar = w / nw;                             
        if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
        nw *= ar;
        nh *= ar;
    
        // calc source rectangle
        cw = iw / (nw / w);
        ch = ih / (nh / h);
    
        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;
    
        // make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;
    
        // fill image in dest. rectangle
        ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
    }

    random(minInclusive, maxInclusive) {
        return minInclusive + Math.floor(Math.random() * ((maxInclusive - minInclusive) + 1));
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

    getTriggeredAbility() {
        let condition = mtgData.permanentConditions[this.random(0, mtgData.permanentConditions.length - 1)];
        let event = mtgData.permanentEvents[this.random(0, mtgData.permanentEvents.length - 1)];

        this.colorIdentity += event.colorIdentity;

        let isReplacement = false;// TODO: [false, false, false, true][this.random(0, 3)] && condition.replacementText.length > 0;
        if (isReplacement) {
            return { text: `${this.parseSyntax(condition.replacementText, condition.context)}, instead ${this.parseSyntax(event.text)}.`, score: event.score };
        }

        if (this.random(1, 4) === 4 && event.nofollowup === undefined) {
            let secondEvent = mtgData.permanentEvents[this.random(0, mtgData.permanentEvents.length - 1)];
            this.colorIdentity += secondEvent.colorIdentity;
            return { text: `${this.parseSyntax(condition.text, condition.context)}, ${this.parseSyntax(event.text, condition.context)}, then ${this.parseSyntax(secondEvent.text, condition.context)}.`, score: (event.score + secondEvent.score) };
        }

        return { text: `${this.parseSyntax(condition.text, condition.context)}, ${this.parseSyntax(event.text, condition.context)}.`, score: event.score };
    }

    getActivatedAbility(rarity, forceNoTapSymbol, forceNoCreature) {
        let positiveEvents = mtgData.permanentEvents.filter(e => e.score > 0 && (forceNoCreature === true ? !e.creatureOnly : true));
        let event = positiveEvents[this.random(0, positiveEvents.length - 1)];

        if (rarity === undefined || rarity === "") rarity = 2;
        let cost = 2 / rarity + event.score;
        cost = Math.max(1, Math.floor(cost));

        let tapSymbol = this.flipCoin() || cost > 2.0;
        tapSymbol = tapSymbol && forceNoTapSymbol === undefined;
        let keywordcost = "";

        this.colorIdentity += event.colorIdentity;

        // get color at this stage.
        let color = this.getColorFromIdentity(event.colorIdentity);

        if ([false, false, false, true][this.random(0, 3)]) {
            let activated = this.getActivatedCost(Math.min(6, cost), color, forceNoCreature);
            keywordcost = activated.text.toCamelCase();

            if (tapSymbol)
                keywordcost = `XT, ${keywordcost}`;
        }
        else {
            keywordcost = this.getManacostFromCmc(cost, (this.random(1, 5) == 5 ? "" : color));
            if (tapSymbol)
                keywordcost = `${keywordcost !== "" ? keywordcost + "," : ""}XT `;
        }

        return { text: `${this.parseSyntax(keywordcost)}: ${this.parseSyntax(event.text.toCamelCase())}.`, score: event.score };
    }

    getPlaneswalkerOracle() {
        let pwEvents = mtgData.permanentEvents.filter(e => e.score <= 1 && e.score >= -1 && e.creatureOnly == undefined);
        let pw2Events = mtgData.permanentEvents.filter(e => e.score >= 1 && e.score <= 1.5 && e.creatureOnly == undefined);
        let pw3Events = mtgData.permanentEvents.filter(e => (e.score > 2 || (e.text.indexOf("(number") >= 0 && e.score >= 1)) && e.creatureOnly == undefined);

        let plusEvent = pwEvents[this.random(0, pwEvents.length - 1)];
        let plusCost = Math.abs(plusEvent.score) * 1.5;
        plusCost = Math.min(3, Math.max(1, Math.ceil(plusCost)));
        this.colorIdentity += plusEvent.colorIdentity;

        let minus1Event = pw2Events[this.random(0, pw2Events.length - 1)];
        let minus1Cost = minus1Event.score * 1.5;
        minus1Cost = 0 - Math.min(3, Math.max(1, Math.ceil(minus1Cost)));

        let isFirstStatic = false;
        if (this.random(1, 8) == 8) {
            isFirstStatic = true;
            let staticEvent = mtgData.permanentStatics[this.random(0, mtgData.permanentStatics.length - 1)];
            staticEvent.text = staticEvent.text.replace("3", "2"); /* don't allow +3 */

            // replace second with first, and first with static.
            minus1Event = plusEvent;
            minus1Cost = plusCost;

            plusEvent = staticEvent;
            plusCost = Math.min(3, Math.max(1, Math.ceil(staticEvent.score * 1.5)));

            this.colorIdentity += staticEvent.colorIdentity;
        } else {
            this.colorIdentity += minus1Event.colorIdentity;
        }

        let minus2Event = pw3Events[this.random(0, pw3Events.length - 1)];
        this.colorIdentity += minus2Event.colorIdentity;

        let pushedMinus2EventText = minus2Event.text.replace(/\(number\)/g, "(number3)").replace(/\(number2\)/g, "(number3)").replace(/\(numbername\)/g, "(numbername3)").replace(/\(numbername2\)/g, "(numbername3)");
        let parsedMinus2Text = this.parseSyntax(pushedMinus2EventText.toCamelCase());
        let minus2Cost = 0 - Math.min(9, Math.max(4, Math.ceil(minus2Event.score * 1.5 + this.lastNumber / 4)));

        let a1 = isFirstStatic ?
            `${this.parseSyntax(plusEvent.text.toCamelCase())}.` :
            `{+${plusCost}}: ${this.parseSyntax(plusEvent.text.toCamelCase())}.`;
        let a2 = `{${minus1Cost > 0 ? `+${minus1Cost}` : minus1Cost}}: ${this.parseSyntax(minus1Event.text.toCamelCase())}.`;
        let a3 = `{${minus2Cost > 0 ? `+${minus2Cost}` : minus2Cost}}: ${parsedMinus2Text}.`;

        let loyaltyScore = Math.max(2, Math.min(6, Math.min(Math.abs(minus2Cost), Math.floor(Math.abs(minus2Cost) / (this.flipCoin() ? 1.3 : 2)))));
        let loyalty = `{ ${loyaltyScore} }`;

        return { text: `${a1}\n\n${a2}\n\n${a3}\n\n${loyalty}`, score: (loyaltyScore + plusCost + Math.abs(minus1Cost)) / 1.8, firstPositive: plusEvent.score > 0 };
    }

    getEnchantmentOracle() {
        let isAura = this.flipCoin();

        if (isAura) {
            // TODO: Currently, only Creature auras are supported.
            let type = mtgData.auratargets[this.random(0, mtgData.auratargets.length - 1)];
            this.auraType = type;
            this.card.subtype = "Aura";

            let allowedType = this.auraType === "creature" ? "creature" : "permanent";
            let enchantmentEffects = mtgData.enchantmentEffects.filter(e => e.auraType === allowedType);
            
            let hasSecondEffect = this.flipCoin();
            let firstEffect = enchantmentEffects[this.random(0, enchantmentEffects.length - 1)];
            if (firstEffect.onlyOnce) 
                enchantmentEffects = enchantmentEffects.filter(e => e.onlyOnce === undefined || e.onlyOnce === false);
            if (firstEffect.isForOpponent) 
                enchantmentEffects = enchantmentEffects.filter(e => e.isForOpponent === true);
            let secondEffect = enchantmentEffects[this.random(0, enchantmentEffects.length - 1)];

            this.colorIdentity = firstEffect.colorIdentity;
            let controlScore = 0;

            let oracle = `Enchant ${type}\n\n`;
            if (this.random(0, 15) === 15) {
                oracle += `You control enchanted ${type}`;
                this.colorIdentity += "uuu";
                controlScore = 3.5;

                if (this.flipCoin()) {
                    return { text: oracle + ".", score: controlScore };
                } else {
                    oracle += ".\n\n";
                }
            }
            oracle += `Enchanted ${type} ${this.parseSyntax(firstEffect.text)}`;

            if (hasSecondEffect)
            {
                oracle += ` and ${this.parseSyntax(secondEffect.text)}`;
                this.colorIdentity += secondEffect.colorIdentity;
            }

            let firstEffectScore  = firstEffect.score;
            let secondEffectScore = secondEffect.score;

            return { text: oracle + ".", score: (firstEffectScore + (hasSecondEffect ? secondEffectScore : 0)) + (this.lastAbilityScore / 2) + (this.lastNumber / 6) + (this.lastNumberCount / 4) + controlScore };

        } else {
            // Non-aura enchantments.
            this.card.subtype = undefined;

            let effect = mtgData.permanentStatics[this.random(0, mtgData.permanentStatics.length - 1)];
            let score = effect.score;
            let oracle = `${this.parseSyntax(effect.text)}`;

            this.colorIdentity = effect.colorIdentity;

            let hasAbility = this.random(1, 4) === 4;
            if (hasAbility)
            {
                let ability = this.getActivatedAbility(this.rarityNumber, true, true);
                let abilityText = ability.text.replace(/\.$/g, '');
                oracle += `.\n\n${this.parseSyntax(abilityText)}`;
                score += ability.score;
            }

            return { text: oracle + ".", score: score + (this.lastNumber / 6) + (this.lastNumberCount / 4) };
        }
    }

    getSpellAbility(rarity, type) {
        let eventSource = mtgData.instantSorceryEvents.filter(e => type !== "instant" ? e.instantOnly === undefined : true);
        let event = eventSource[this.random(0, eventSource.length - 1)];
        this.colorIdentity += event.colorIdentity;

        let score = event.score;
        let oracleText = event.text.toCamelCase();
        let isComplicated = false;

        // add second ability with "then".
        if (this.random(1, 5) === 5 || event.score < 0) {
            let secondEventPool = mtgData.instantSorceryEvents.filter(e => (event.score < 0) ? (e.score > 0) : true);
            let secondEvent = secondEventPool[this.random(0, secondEventPool.length - 1)];
            this.colorIdentity += secondEvent.colorIdentity;
            score += secondEvent.score;

            oracleText = `${oracleText}, then ${secondEvent.text}`;
            isComplicated = event.score < 0 || secondEvent.score < 0;
        }

        // add second ability with new line.
        if (this.random(1, 8) === 8 || rarity >= 4) {
            let additionalEventSource = mtgData.instantSorceryEvents.filter(e => e.score > 0);
            let additionalEvent = additionalEventSource[this.random(0, additionalEventSource.length - 1)];
            this.colorIdentity += additionalEvent.colorIdentity;
            score += additionalEvent.score;

            oracleText = `${oracleText}.\n${additionalEvent.text.toCamelCase()}`;
            isComplicated = true;
        }

        // add keyword.
        if (this.random(1, 6) === 6) {
            let sKeyword = this.handleSpecialSpellKeywords(event.text, rarity);
            if (sKeyword.text.length > 0) {
                if (sKeyword.ability.length > 0 && sKeyword.overwriteAbility) {
                    oracleText = sKeyword.ability.toCamelCase();
                    score = sKeyword.score;
                }
                else if (sKeyword.ability.length > 0 && !sKeyword.overwriteAbility) {
                    oracleText += `.\n\n${sKeyword.ability.toCamelCase()}`;
                }
                oracleText = `${sKeyword.text}\n\n${oracleText.toCamelCase()}`;
            }
        }

        return { text: `${this.parseSyntax(oracleText)}.`, score: score, isComplicated: isComplicated };
    }

    parseSyntax(text, context) {
        let maxDepth = 30;
        let depth = 0;

        let selfCount = 0;
        let useN = false;

        while (text.indexOf("(") >= 0) {
            depth++;
            if (depth >= maxDepth) break;

            let moreThanOne = false;
            if (text.indexOf("(numbername)") >= 0) {
                moreThanOne = true;
                let number = ["two", "two", "two", "two", "two", "three", "three"][this.random(0, 6)];
                text = text.replace("(numbername)", number);
                this.lastNumber = Math.max(this.lastNumber, number === "two" ? 2 : 3);
                this.lastNumberCount++;
            }
            if (text.indexOf("(numbername2)") >= 0) {
                moreThanOne = true;
                let number = ["two", "two", "three", "three", "three", "four", "five"][this.random(0, 6)];
                text = text.replace("(numbername2)", number);
                this.lastNumber = Math.max(this.lastNumber, number === "two" ? 2 : number === "three" ? 3 : number === "four" ? 4 : 5);
                this.lastNumberCount++;
            }
            if (text.indexOf("(numbername3)") >= 0) {
                moreThanOne = true;
                let number = ["four", "five", "five", "six"][this.random(0, 3)];
                text = text.replace("(numbername3)", number);
                this.lastNumber = Math.max(this.lastNumber, number === "four" ? 4 : number === "five" ? 5 : 6);
                this.lastNumberCount++;
            }
            if (text.indexOf("(number)") >= 0) {
                let number = [1, 1, 1, 2, 2, 2, 2, 3, 3][this.random(0, 8)];
                moreThanOne = moreThanOne || number > 1;
                text = text.replace("(number)", number);
                text = text.replace("(samenumber)", number);
                this.lastNumber = Math.max(this.lastNumber, number);
                this.lastNumberCount++;
            }
            if (text.indexOf("(!number)") >= 0) {
                let number = [1, 1, 1, 2, 2, 2, 2, 3, 3][this.random(0, 8)];
                text = text.replace("(!number)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }
            if (text.indexOf("(number2)") >= 0) {
                let number = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6][this.random(0, 12)];
                moreThanOne = true;
                text = text.replace("(number2)", number);
                text = text.replace("(samenumber)", number);
                this.lastNumber = Math.max(this.lastNumber, number);
                this.lastNumberCount++;
            }
            if (text.indexOf("(!number2)") >= 0) {
                let number = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6][this.random(0, 12)];
                text = text.replace("(!number2)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }
            if (text.indexOf("(number3)") >= 0) {
                let number = [5, 5, 5, 6, 6, 6, 7, 8, 9][this.random(0, 8)];
                moreThanOne = true;
                text = text.replace("(number3)", number);
                text = text.replace("(samenumber)", number);
                this.lastNumber = Math.max(this.lastNumber, number);
                this.lastNumberCount++;
            }
            if (text.indexOf("(!number3)") >= 0) {
                let number = [5, 5, 5, 6, 6, 6, 7, 8, 9][this.random(0, 8)];
                text = text.replace("(!number3)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }

            if (text.indexOf("(keyword)") >= 0) {
                text = text.replace("(keyword)", this.getKeyword("creature", true).name.toLowerCase());
            }

            let subtype = "";
            if (text.indexOf("(subtype)") >= 0) {
                subtype = mtgData.subtypes[this.random(0, mtgData.subtypes.length - 1)];
                let firstLetter = subtype[0].toLowerCase();
                useN = useN || firstLetter === "a" || firstLetter === "e" || firstLetter === "i" || firstLetter === "o" || firstLetter === "u";
                text = text.replace("(subtype)", subtype);
            }

            if (text.indexOf("(another)") >= 0 && this.card.subtype !== undefined && this.card.subtype.indexOf(subtype) >= 0) {
                text = text.replace("(another)", "another ");
            } else {
                text = text.replace("(another)", "");
            }

            if (text.indexOf("(other creatures)") >= 0 && this.card.type.toLowerCase() === "creature") {
                text = text.replace("(other creatures)", "other creatures");
            } else {
                text = text.replace("(other creatures)", "creatures");
            }

            if (text.indexOf("(self)") >= 0) {
                if (context === "self" || selfCount > 0) {
                    text = text.replace("(self)", "it");
                } else {
                    selfCount++;
                    text = text.replace("(self)", this.card.name);
                }
            }

            if (text.indexOf("(type)") >= 0) {
                let type = mtgData.types[this.random(0, mtgData.types.length - 1)];
                useN = useN || type === "enchantment" || type === "artifact";
                text = text.replace("(type)", type);
            }
            if (text.indexOf("(permanent)") >= 0) {
                let type = mtgData.permanentTypes[this.random(0, mtgData.permanentTypes.length - 1)];
                useN = useN || type === "enchantment" || type === "artifact";
                text = text.replace("(permanent)", type);
            }

            if (text.indexOf("(type/counterable)") >= 0) {
                let type = mtgData.types[this.random(0, mtgData.types.length - 1)]
                text = text.replace("(type/counterable)", type.replace("land", "noncreature"));
            }
            if (text.indexOf("(type|color)") >= 0) {
                let type = this.random(0, 1) === 1 ? this.colors[this.random(0, this.colors.length - 1)] : mtgData.types[this.random(0, mtgData.types.length - 1)];
                text = text.replace("(type|color)", type.replace("land", "noncreature"));
            }

            if (text.indexOf("(mana)") >= 0) {
                let symbols = this.colorIdentity.split("");
                let symbol = `{${symbols[this.random(0, this.colorIdentity.length - 1)]}}`;
                if (this.flipCoin()) symbol += `X${symbols[this.random(0, this.colorIdentity.length - 1)]}`;
                text = text.replace("(mana)", symbol);
            }

            if (text.indexOf("(ability)") >= 0) {
                let cardname = this.card.name;
                this.card.name = "enchanted creature";

                let isTriggered = this.flipCoin();
                let ability = undefined;
                if (isTriggered) {
                    ability = this.getTriggeredAbility();
                } else {
                    ability = this.getActivatedAbility(this.rarityNumber);
                }
                this.lastAbilityScore = ability.score;

                text = text.replace("(ability)", `"${ability.text.replace(/\.$/g, '')}"`);
                this.card.name = cardname;
            }

            text = text.replace("(player)", this.random(0, 1) === 1 ? "player" : "opponent");
            text = text.replace(/\(name\)/g, this.card.name);
            text = text.replace("(s)", moreThanOne ? "s" : "");
            text = text.replace("(n)", useN ? "n" : "");
            text = text.replace("(color)", this.colors[this.random(0, this.colors.length - 1)]);
            text = text.replace("(auratype)", this.auraType);
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

        text = text.replace(/\{bg\}/g, this.emojis[17]);
        text = text.replace(/\{gb\}/g, this.emojis[17]);

        text = text.replace(/\{br\}/g, this.emojis[18]);
        text = text.replace(/\{rb\}/g, this.emojis[18]);

        text = text.replace(/\{ug\}/g, this.emojis[19]);
        text = text.replace(/\{gu\}/g, this.emojis[19]);

        text = text.replace(/\{wg\}/g, this.emojis[20]);
        text = text.replace(/\{gw\}/g, this.emojis[20]);

        text = text.replace(/\{rg\}/g, this.emojis[21]);
        text = text.replace(/\{gr\}/g, this.emojis[21]);

        text = text.replace(/\{wr\}/g, this.emojis[22]);
        text = text.replace(/\{rw\}/g, this.emojis[22]);

        text = text.replace(/\{ub\}/g, this.emojis[23]);
        text = text.replace(/\{bu\}/g, this.emojis[23]);

        text = text.replace(/\{ur\}/g, this.emojis[24]);
        text = text.replace(/\{ru\}/g, this.emojis[24]);

        text = text.replace(/\{wb\}/g, this.emojis[25]);
        text = text.replace(/\{bw\}/g, this.emojis[25]);

        text = text.replace(/\{wu\}/g, this.emojis[26]);
        text = text.replace(/\{uw\}/g, this.emojis[26]);

        text = text.replace(/\{zero\}/g, this.emojis[27]);
        text = text.replace(/\{plus1\}/g, this.emojis[28]);
        text = text.replace(/\{plus2\}/g, this.emojis[29]);
        text = text.replace(/\{plus3\}/g, this.emojis[30]);
        text = text.replace(/\{minus1\}/g, this.emojis[31]);
        text = text.replace(/\{minus2\}/g, this.emojis[32]);
        text = text.replace(/\{minus3\}/g, this.emojis[33]);
        text = text.replace(/\{minus4\}/g, this.emojis[34]);
        text = text.replace(/\{minus5\}/g, this.emojis[35]);
        text = text.replace(/\{minus6\}/g, this.emojis[36]);
        text = text.replace(/\{minus7\}/g, this.emojis[37]);
        text = text.replace(/\{minus8\}/g, this.emojis[38]);

        text = text.replace(/\{pw_2\}/g, this.emojis[39]);
        text = text.replace(/\{pw_3\}/g, this.emojis[40]);
        text = text.replace(/\{pw_4\}/g, this.emojis[41]);
        text = text.replace(/\{pw_5\}/g, this.emojis[42]);

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
        let sortedList = colorCount.sort((a, b) => a.count > b.count ? -1 : a.count === b.count ? 0 : 1);
        let max = sortedList[0].count;

        if (colorIdentity === "wubrg") {
            return colorCount[this.random(0, 4)].c;
        }

        let maxes = colorCount.filter(c => c.count === max);

        // better distribution of mana.
        if (maxes.length === 1) {
            if (sortedList.length > 1 && this.random(1, 6) == 6) return maxes[0].c + sortedList[1].c;
            return maxes[0].c;
        }
        if (maxes.length === 2) {
            if (sortedList.length > 2 && this.random(1, 6) == 6) return maxes[0].c + maxes[1].c + sortedList[2].c;
            return maxes[0].c + maxes[1].c;
        }
        if (maxes.length >= 3) {
            if (this.random(1, 8) == 8) return maxes[0].c + maxes[1].c;
            if (this.random(1, 8) == 8) return maxes[1].c + maxes[2].c;
            if (this.random(1, 8) == 8) return maxes[0].c + maxes[2].c;
            // else use all colors.
        }

        let result = maxes.map(c => c.c);

        // sort by WUBRG.
        const lookup = [{ c: "w", i: 0 }, { c: "u", i: 1 }, { c: "b", i: 2 }, { c: "r", i: 3 }, { c: "g", i: 4 }];
        return result.sort(function(x, y) {
            if (lookup[x] < lookup[y]) {
              return -1;
            }
            if (lookup[x] > lookup[y]) {
              return 1;
            }
            return 0;
          }).join("");
    }

    getManacostFromCmc(cmc, colorString) {
        if (colorString.length === 0) {
            return `X${Math.min(9, cmc)}`;
        }

        let manacost = "";
        let color = colorString.split("");

        // Mono color.
        if (color.length === 1) {
            if (cmc === 1) {
                manacost = `X${color}`;
            } else if (cmc === 2) {
                let twoSymbols = this.flipCoin();
                if (twoSymbols) {
                    manacost = `X${color}X${color}`;
                }
                else {
                    manacost = `X${Math.min(9, cmc - 1)}X${color}`;
                }
            } else if (cmc === 3) {
                let threeSymbols = this.random(1, 4) === 4;
                if (threeSymbols) {
                    return `X${color}X${color}X${color}`;
                }

                let twoSymbols = this.flipCoin();
                if (twoSymbols)
                    return `X1X${color}${color}`;

                return `X2X${color}`;
            } else if (cmc > 3) {
                let twoSymbols = this.flipCoin();
                if (twoSymbols)
                    return `X${Math.min(9, cmc - 2)}X${color}X${color}`;

                let threeSymbols = this.random(1, 4) === 4;
                if (threeSymbols && cmc > 2)
                    return `X${Math.min(9, cmc - 3)}X${color}X${color}X${color}`;

                manacost = `X${Math.min(9, cmc - 1)}X${color}`;
            }
        }

        // Two colors.
        if (color.length === 2) {
            if (cmc === 1) {
                manacost = `X${color[0]}X${color[1]}`; // TODO zweites X wegnehmen
            } else if (cmc === 2) {
                manacost = `X${color[0]}X${color[1]}`;
            } else if (cmc === 3) {
                let threeSymbols = this.random(0, 2); // 0 = none, 1 = first symbol twice, 2 = second symbol twice.
                switch (threeSymbols) {
                    case 0:
                        manacost = `X1X${color[0]}X${color[1]}`;
                        break;
                    case 1:
                        manacost = `X${color[0]}X${color[0]}X${color[1]}`;
                        break;
                    case 2:
                        manacost = `X${color[0]}X${color[1]}X${color[1]}`;
                        break;
                }
            } else if (cmc > 3) {
                let fourSymbols = this.random(0, 3); // 0 = none, 1 = first symbol twice, 2 = second symbol twice, 3 = both symbol twice.
                switch (fourSymbols) {
                    case 0:
                        manacost = `X${Math.min(9, cmc - 2)}X${color[0]}X${color[1]}`;
                        break;
                    case 1:
                        manacost = `X${Math.min(9, cmc - 3)}X${color[0]}X${color[0]}X${color[1]}`;
                        break;
                    case 2:
                        manacost = `X${Math.min(9, cmc - 3)}X${color[0]}X${color[1]}X${color[1]}`;
                        break;
                    case 3:
                        manacost = `X${color[0]}X${color[0]}X${color[1]}X${color[1]}`;
                        if (cmc > 4) {
                            manacost = `X${Math.min(9, cmc - 4)}${manacost}`;
                        }
                        break;
                }
            }
        }

        // More than two colors.
        if (color.length >= 3) {
            if (cmc === 1) {
                manacost = `X${color[this.random(0, color.length - 1)]}`;
            } else if (cmc === 2) {
                let rnd = this.random(0, color.length - 2);
                manacost = `X${color[rnd]}X${color[rnd + 1]}`;
            } else if (cmc === 3) {
                manacost = `X${color[0]}X${color[1]}X${color[2]}`;
            } else if (cmc > 3) {
                manacost = `X${Math.min(9, cmc - 3)}X${color[0]}X${color[1]}X${color[2]}`;
            }
        }

        return manacost;
    }

    getActivatedCost(cost, color, forceNoCreature) {
        let costs = mtgData.permanentActivatedCosts.filter(e =>
            color.split("").some(c => e.colorIdentity.indexOf(c) >= 0) /* same color */
            && cost <= e.score /* score of activatedcost = "value" of ability */
            && (forceNoCreature === true ? !e.creatureOnly : true));

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

    getPlaneswalkerName() {
        let name = mtgData.planeswalkerNames.names[this.random(0, mtgData.planeswalkerNames.names.length - 1)];
        if (this.random(1, 3) == 3) {
            return name.toCamelCase()
                + (this.flipCoin() ? ", the " : ", ") + mtgData.creatureNames.adjectives[this.random(0, mtgData.creatureNames.adjectives.length - 1)].toCamelCase()
                + " " + mtgData.creatureNames.nouns[this.random(0, mtgData.creatureNames.nouns.length - 1)].toCamelCase();
        }
        else if (this.random(1, 3) == 3) {
            return name + " " + mtgData.planeswalkerNames.names[this.random(0, mtgData.planeswalkerNames.names.length - 1)];
        }
        return name;
    }

    getInstantSorceryName() {
        let name = "";
        return name.toCamelCase()
            + mtgData.spellNames.adjectives[this.random(0, mtgData.spellNames.adjectives.length - 1)].toCamelCase()
            + " " + mtgData.spellNames.nouns[this.random(0, mtgData.spellNames.nouns.length - 1)].toCamelCase();
    }

    getEnchantmentName() {
        let name = "";
        return name.toCamelCase()
            + mtgData.spellNames.adjectives[this.random(0, mtgData.spellNames.adjectives.length - 1)].toCamelCase()
            + " " + mtgData.enchantmentNames.nouns[this.random(0, mtgData.enchantmentNames.nouns.length - 1)].toCamelCase();
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
        let overwriteAbility = false;

        if (keyword === undefined || keyword === null) {
            return { text: "", ability: "", overwriteAbility: false, score: 0 };
        }

        let score = keyword.score;
        let costOverride = 0;

        let keywordName = keyword.nameExtension.length > 0 ? `${keyword.name} ${this.parseSyntax(keyword.nameExtension)}` : keyword.name;
        
        if (keyword.name === "Kicker") {
            let positiveEvents = mtgData.permanentEvents.filter(e => e.score > 0);
            let event = positiveEvents[this.random(0, positiveEvents.length - 1)];
            ability = "If (name) was kicked, " + event.text;
            score += event.score;
            costOverride = score * 3 / this.random(3, 6);
            this.colorIdentity += event.colorIdentity;
        }

        if (keyword.name === "Entwine") {
            let positiveEvents1 = mtgData.permanentEvents.filter(e => e.score >= 0 && e.creatureOnly == undefined);
            let event1 = positiveEvents1[this.random(0, positiveEvents1.length - 1)];

            let positiveEvents2 = mtgData.permanentEvents.filter(e => e.score >= 0 && Math.abs(e.score - event1.score) < 1 && e.creatureOnly == undefined && e.text != event1.text)
            let event2 = positiveEvents2[this.random(0, positiveEvents2.length - 1)];

            if (event2 == undefined)
                event2 = positiveEvents1[this.random(0, positiveEvents1.length - 1)];

            ability = `Choose one:\n   • ${event1.text.toCamelCase()}.\n   • ${event2.text.toCamelCase()}`;
            overwriteAbility = true;
            score = Math.floor(Math.max(event1.score, event2.score));
            costOverride = (event1.score + event2.score) + this.random(3, 6) / 3;
            this.colorIdentity = event1.colorIdentity + event2.colorIdentity; /* yes, overwrite color identity. */
        }

        // make "chose one or both" card out of it.
        else if (this.random(1, 12) === 12) {
            let positiveEvents1 = mtgData.permanentEvents.filter(e => e.score >= 0 && e.creatureOnly == undefined);
            let event1 = positiveEvents1[this.random(0, positiveEvents1.length - 1)];

            let positiveEvents2 = mtgData.permanentEvents.filter(e => e.score >= 0 && Math.abs(e.score - event1.score) < 1 && e.creatureOnly == undefined && e.text != event1.text)
            let event2 = positiveEvents2[this.random(0, positiveEvents2.length - 1)];

            if (event2 == undefined)
                event2 = positiveEvents1[this.random(0, positiveEvents1.length - 1)];

            overwriteAbility = true;
            score = Math.max(event1.score, event2.score);
            this.colorIdentity = event1.colorIdentity + event2.colorIdentity; /* yes, overwrite color identity. */

            let both = this.flipCoin();
            if (both) {
                score += 2;
                ability = `Choose one or both:\n   • ${event1.text.toCamelCase()}.\n   • ${event2.text.toCamelCase()}`;

            } else {
                score += 1;
                ability = `Choose one:\n   • ${event1.text.toCamelCase()}.\n   • ${event2.text.toCamelCase()}`;
            }

            score = Math.max(1, score);
            this.card.color = this.getColorFromIdentity(this.colorIdentity);
            return { text: keywordName, ability: ability, overwriteAbility: overwriteAbility, score: score };
        }

        if (keyword.name === "Overload") {
            if (oracleText.indexOf("target") < 0)
                return { text: "", ability: "", overwriteAbility: false, score: 0 };
            score += 1.5;
        }
        if (keyword.name === "Spectacle") {
            score -= 1;
        }
        if (keyword.name === "Miracle") {
            score -= 1.5;
        }
        if (keyword.name === "Splice onto Arcane") {
            this.card.subtype = "Arcane";
        }

        score = Math.max(1, score);

        // update color.
        this.colorIdentity += keyword.colorIdentity;
        this.card.color = this.getColorFromIdentity(this.colorIdentity);

        if (keyword.hasCost) {
            let cost = costOverride > 0 ? costOverride : (2 / rarity + score * this.random(2, 3) / 3);
            let keywordcost = this.getManacostFromCmc(Math.max(1, Math.floor(cost)), this.card.color);
            return { text: `${keywordName}${keyword.nameExtension.length > 0 ? ' -' : ''} ${keywordcost}`, ability: ability, overwriteAbility: overwriteAbility, score: score };
        }

        return { text: keywordName, ability: ability, overwriteAbility: overwriteAbility, score: score };
    }
}

module.exports = MtgParser;

/*
special keywords:



this spell can't be countered.
*/