const { DiscordHelper } = require('../discord-helper.js');

const RpgResponse = require('./rpg-response.js');
const RpgHelpResonse = require('./rpg-response-help.js');

const config = require('../../config.json');
const dungeons = require('./../data/dungeons.json');

class MinigameParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();

        this.emoji_one = "1️⃣";
        this.emoji_two = "2️⃣";
        this.emoji_three = "3️⃣";
        this.emoji_four = "4️⃣";

        this.defaultAwaitReactionFilter = (reaction, user) => { return user.id !== reaction.message.author.id; };
        this.defaultAwaitReactionOptions = { max: 1, time: 180000, errors: ['time'] };

        // female imgur album: https://imgur.com/a/w7x4eGG
        // male imgur album: https://imgur.com/a/fZ1bfpd

        this.people = {
            // females
            Mika: "https://i.imgur.com/o9cTKvR.png",
            a: "https://i.imgur.com/DOfB0N8.png", // r2
            b: "https://i.imgur.com/i9g7noK.png",
            c: "https://i.imgur.com/Xl9VKTE.png",
            d: "https://i.imgur.com/MtQVLrB.png",
            e: "https://i.imgur.com/qs6CFgF.png",
            f: "https://i.imgur.com/J0Kmzr3.png",
            g: "https://i.imgur.com/KXZV9FS.png",
            h: "https://i.imgur.com/YUKad7p.png", // r2
            i: "https://i.imgur.com/u7Ol5Ol.png",
            j: "https://i.imgur.com/b64kPss.png",
            k: "https://i.imgur.com/z1eTKnW.png", // r2
            l: "https://i.imgur.com/jFwtOCl.png",
            m: "https://i.imgur.com/umA49Js.png",
            n: "https://i.imgur.com/KV18KM0.png",
            o: "https://i.imgur.com/5sZF8KU.png",
            p: "https://i.imgur.com/97Ev0Lq.png",
            q: "https://i.imgur.com/Xqi3YN8.png",
            r: "https://i.imgur.com/cAQICE7.png",
            s: "https://i.imgur.com/pTWzKwH.png",
            t: "https://i.imgur.com/hb8tfSc.png", // r2
            u: "https://i.imgur.com/qDHzpL8.png", // r2
            v: "https://i.imgur.com/hNs914N.png", // r2
            w: "https://i.imgur.com/F8RgWzg.png",
            x: "https://i.imgur.com/9vpCsNE.png",
            y: "https://i.imgur.com/biR8LzY.png",
            z: "https://i.imgur.com/LrhN3ug.png",
            a1: "https://i.imgur.com/ahsqQbq.png",
            a2: "https://i.imgur.com/vWo6Vj0.png",
            a3: "https://i.imgur.com/Ej1dpWQ.png",
            a4: "https://i.imgur.com/0BMPEuy.png", // r2
            a5: "https://i.imgur.com/SiI5zzH.png",

            // males
            CastleGuard1: "https://i.imgur.com/46ryoaR.png",
            CastleGuard2: "https://i.imgur.com/TimUtYO.png",
            King: "https://i.imgur.com/GxdX7su.png",
            Merchant: "https://i.imgur.com/vmJG8x5.png",
            m1: "https://i.imgur.com/0zjPxy6.png",
            m3: "https://i.imgur.com/zWAapOc.png",
            m6: "https://i.imgur.com/hgiqtwI.png",
            m7: "https://i.imgur.com/W9UFAzt.png",
            m8: "https://i.imgur.com/QG7MKlV.png",
            m9: "https://i.imgur.com/4sSfXvz.png",
            m10: "https://i.imgur.com/uSilpnX.png",
            m11: "https://i.imgur.com/BCxTK7f.png", // r2
            m12: "https://i.imgur.com/5aldlgv.png", // r2
            m13: "https://i.imgur.com/hWvq2kY.png",
            m14: "https://i.imgur.com/ptHAaoP.png",
            m14: "https://i.imgur.com/elLtxAg.png",
            m15: "https://i.imgur.com/rb9udz0.png",
            m16: "https://i.imgur.com/U1jip0C.png",
            m17: "https://i.imgur.com/HThaRNV.png", // r2
            m18: "https://i.imgur.com/HAP2y8w.png", // r2
            m19: "https://i.imgur.com/ThvaTWA.png",
            m20: "https://i.imgur.com/R8fUWTY.png",
            m21: "https://i.imgur.com/igTlCyR.png",
            m22: "https://i.imgur.com/Ycc6cvh.png",
            m23: "https://i.imgur.com/IEx2R7b.png",
            m24: "https://i.imgur.com/PbasEeN.png",
            m25: "https://i.imgur.com/S9aSi6Q.png",
            m26: "https://i.imgur.com/wqmcEWQ.png",
            m27: "https://i.imgur.com/cZVm21X.png",
            m28: "https://i.imgur.com/2JpRrTG.png",
            m29: "https://i.imgur.com/aPq5yiH.png",
            m30: "https://i.imgur.com/J7WiYDT.png",
            m31: "https://i.imgur.com/YvVdw2h.png",
            m32: "https://i.imgur.com/oERtWUB.png",
            m33: "https://i.imgur.com/P7TnpW3.png",
            m34: "https://i.imgur.com/WX2yeTY.png",
            m35: "https://i.imgur.com/ihXEpE1.png", // r2
            m36: "https://i.imgur.com/Voiy6GY.png",
            m37: "https://i.imgur.com/zbhRLiE.png",

            Troll: "https://i.pinimg.com/564x/06/98/79/06987967a8ad88b49aefc15a0acebb29.jpg",
            Goblins: "https://i.pinimg.com/564x/a9/3f/e2/a93fe22c1bfb6a807fca545984191cd1.jpg",
        };
    }

    isCommandAllowed(message) {
        let isCommand = this.discordHelper.checkIsCommand(message, `${config.prefix}play`);
        if (isCommand) {
            return message.channel.type === "dm";
        }
        return false;
    }

    startWorkflow(message) {
        if (message.content == "!play help") {
            this.discordHelper.richEmbedMessage(message, new RpgHelpResonse());
            return;
        }

        if (message.content.startsWith("!play jumpto ")) {
            let args = message.content.split(" ")[2].split(";");
            let id = args[0];
            this.name = args[1];
            this.jobId = parseInt(args[2][0]);
            this.hasFirespell = args[2][1] === "1";
            this.hasCake = args[2][2] === "1";
            this.hasPickaxe = args[2][3] === "1";
            this.hasBell = args[2][4] === "1";
            let act = parseInt(args[2][5]);
            this.cash = parseInt(args[2].substring(6));
            this.job = this.getJobById(this.jobId);

            let jumptoStep = id === "BEGINNING" ? dungeons.start : dungeons.actions.filter(a => a.id === id)[0];
            if (jumptoStep == undefined) {
                let m = `Oops, exception occured. I'm very sorry for that. Missing rejoin step '${id}'.`;
                message.channel.send(m);
                console.log(m);
                throw m;
            }

            // copy act.
            if (jumptoStep.act === undefined) {
                jumptoStep.act = act;
            }

            this.sendStep(message, jumptoStep);
            return;
        }

        message.channel.send("Welcome to Text Adventures! What is your name?");

        const nameCollector = message.channel.createMessageCollector(m => m.author.username != "DrunKenBot", { max: 1, time: 120000 });
        nameCollector.on('collect', m => {
            this.name = m.content.toCamelCase();

            this.sendProfessionRequest(message);
        });
        nameCollector.on('end', collected => {
            if (this.name === undefined) {
                message.channel.send("Sorry, I didn't catch your name. Please restart the game.");
            }
        });
    }

    sendStep(message, step) {
        let self = this;
        let stepId = step.id;

        let response = new RpgResponse();
        response.title = step.title;
        response.text = this.parseSyntax(step.text);
        response.thumbnail = this.people[step.person];
        response.act = step.act;
        response.type = step.type;

        this.updateInventory(step);

        /* parse options */
        response.options = [];
        let c = 0;
        for (let i = 0; i < step.options.length; i++) {
            if (step.options[i].condition != undefined) {
                let evaluatedCondition = eval(step.options[i].condition);
                if (!evaluatedCondition) {
                    continue;
                }
            }
            response.options[c] = step.options[i];
            response.options[c].text = this.parseSyntax(response.options[c].text);
            c++;
        }

        this.discordHelper.richEmbedMessage(message, response, function (embed) {
            if (response.options.length === 0) return;
            if (response.options.length >= 1) embed.react(self.emoji_one);
            if (response.options.length >= 2) embed.react(self.emoji_two);
            if (response.options.length >= 3) embed.react(self.emoji_three);
            if (response.options.length >= 4) embed.react(self.emoji_four);
            embed.awaitReactions(self.defaultAwaitReactionFilter, self.defaultAwaitReactionOptions)
                .then(collected => {
                    const reaction = collected.first();
                    if (reaction === undefined) return;
                    let i = -1;
                    switch (reaction.emoji.name) {
                        case self.emoji_one:
                            i = 0; break;
                        case self.emoji_two:
                            i = 1; break;
                        case self.emoji_three:
                            i = 2; break;
                        case self.emoji_four:
                            i = 3; break;
                    }

                    if (i >= 0 && i <= 3) {
                        let id = response.options[i].id;
                        let nextStep = dungeons.actions.filter(a => a.id === id)[0];

                        if (nextStep == undefined) {
                            let m = `Oops, exception occured. I'm very sorry for that. Missing transition from Id '${step.id}' to '${id}'.`;
                            message.channel.send(m);
                            console.log(m);
                            throw m;
                        }

                        // copy act.
                        if (nextStep.act === undefined) {
                            nextStep.act = response.act;
                        }

                        self.sendStep(message, nextStep);
                    }

                }).catch(e => {
                    let fb = self.hasFirespell ? "1" : "0";
                    let c = self.hasCake ? "1" : "0";
                    let pa = self.hasPickaxe ? "1" : "0";
                    let b = self.hasBell ? "1" : "0";

                    let command = `!play jumpto ${stepId};${self.name};${self.jobId}${fb}${c}${pa}${b}${response.act}${self.cash}`;
                    message.channel.send("Sorry, there was some issue. You can resume your playthrough with the following command, though:\n" + command);
                });
        });
    }

    sendProfessionRequest(message) {
        let self = this;

        let response = new RpgResponse();
        response.text = this.parseSyntax("What's your profession, (name)?");
        response.thumbnail = "https://image.flaticon.com/icons/png/512/2835/2835832.png";
        response.options = [{ text: "Huntsman" }, { text: "Warrior" }, { text: "Wizard" }, { text: "Bard" }];
        response.jobIcons = true;

        this.discordHelper.richEmbedMessage(message, response, function (embed) {
            embed.react("🏹");
            embed.react("⚔️");
            embed.react("🧙‍♂️");
            embed.react("🪕");
            embed.awaitReactions(self.defaultAwaitReactionFilter, self.defaultAwaitReactionOptions)
                .then(collected => {
                    const reaction = collected.first();
                    if (reaction === undefined) return;
                    switch (reaction.emoji.name) {
                        case "🏹":
                            self.jobId = 1;
                            break;
                        case "⚔️":
                            self.jobId = 2;
                            break;
                        case "🧙‍♂️":
                            self.jobId = 3;
                            break;
                        case "🪕":
                            self.jobId = 4;
                            break;
                    }

                    self.cash = 30;
                    self.job = self.getJobById(self.jobId);
                    self.sendStep(message, dungeons.start);

                }).catch(e => console.log(e));
        });
    }

    getJobById(jobId) {
        switch (jobId) {
            case 1: default: return "huntsman";
            case 2: return "warrior";
            case 3: return "wizard";
            case 4: return "bard";
        }
    }

    parseSyntax(text) {
        text = text.replace(/\(name\)/g, this.name.split(" ").map(n => n.toLowerCase().toCamelCase()).join(" "));
        text = text.replace(/\(job\)/g, this.job);
        text = text.replace(/\(weekday\)/g, this.getWeekday());
        text = text.replace(/\(cash\)/g, this.cash);
        return text;
    }

    getWeekday() {
        var d = new Date();
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";

        var n = weekday[d.getDay()];
        return n;
    }

    updateInventory(step) {
        if (step.id === "ROAD_N_HA_3_BUY") {
            this.hasCake = true;
            this.cash -= 15;
        }
        else if (step.id === "ROAD_BRIDGE_BUY") {
            this.cash -= 30;
        }
        else if (step.id === "XXX") {
            this.hasPickaxe = true;
        }
        else if (step.id === "XXX") {
            this.hasBell = true;
        }
    }
}

module.exports = MinigameParser;