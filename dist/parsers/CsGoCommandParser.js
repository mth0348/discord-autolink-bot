"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CsGoCommandParser = void 0;
var discord_js_1 = require("discord.js");
var Logger_1 = require("../helpers/Logger");
var BaseCommandParser_1 = require("../base/BaseCommandParser");
var CsGoMap_1 = require("../dtos/csgo/CsGoMap");
var CsGoSide_1 = require("../dtos/csgo/CsGoSide");
var CsGoNadesService_1 = require("../services/csgo/CsGoNadesService");
var CsGoDataRepository_1 = require("../persistence/repositories/CsGoDataRepository");
var CsGoNadeType_1 = require("../dtos/csgo/CsGoNadeType");
var StringHelper_1 = require("../helpers/StringHelper");
var drunkenbot_1 = require("../base/drunkenbot");
var CsGoCommandParser = (function (_super) {
    __extends(CsGoCommandParser, _super);
    function CsGoCommandParser(discordService, parameterService) {
        var _this = _super.call(this, discordService, parameterService, undefined, undefined) || this;
        _this.name = "CS GO Parser";
        _this.prefixes = ["nades", "cs", "csgo", "nade"];
        _this.emoji_numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
        _this.defaultAwaitReactionFilter = function (reaction, user) { return user.id !== reaction.message.author.id; };
        _this.defaultAwaitReactionOptions = { max: 1, time: 30000 };
        _this.csGoDataRepository = new CsGoDataRepository_1.CsGoDataRepository();
        _this.csGoNadesService = new CsGoNadesService_1.CsGoNadesService(_this.csGoDataRepository);
        console.log("|| - registered CS GO parser.  ||");
        return _this;
    }
    CsGoCommandParser.prototype.executeAsync = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, queryString, results;
            return __generator(this, function (_a) {
                this.updateEmojiCache(message);
                parameters = this.parameterService.extractParameters(message.content, []);
                if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
                    this.showHelp(message);
                    return [2];
                }
                if (message.content.indexOf(" ") < 0) {
                    message.reply("No parameters found. Please try again.");
                    return [2];
                }
                queryString = message.content.split(" ").slice(1).join(" ");
                results = this.csGoNadesService.getForQuery(queryString);
                this.printOutRecords(message, results);
                return [2];
            });
        });
    };
    CsGoCommandParser.prototype.printOutRecords = function (message, records) {
        var _this = this;
        if (records.length > 9) {
            var reply_1 = "There are still over 10 search results, try adding more information to your query. Found results:\r\n";
            records.slice(0, Math.min(12, records.length)).forEach(function (r) { return reply_1 += _this.toSuggestionRow(r) + "\r\n"; });
            message.reply(reply_1 + "...");
        }
        else if (records.length <= 0) {
            message.reply("Sorry, I didn't find anything for your query, try adding more information");
        }
        else if (records.length === 1) {
            this.sendResult(message, records[0]);
        }
        else {
            var embed_1 = new discord_js_1.MessageEmbed()
                .setTitle("CSGO Nades Bot Result")
                .setDescription("The following clips have been found:\r\n")
                .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128');
            records.forEach(function (r, i) {
                var row = _this.toResultRow(r, i);
                embed_1.addField(row, r.description.length > 0 ? r.description : "-");
            });
            var self_1 = this;
            message.reply("", embed_1).then(function (embed) {
                records.forEach(function (r, i) { return embed.react(self_1.emoji_numbers[i]); });
                embed.awaitReactions(self_1.defaultAwaitReactionFilter, self_1.defaultAwaitReactionOptions)
                    .then(function (collected) {
                    var reaction = collected.first();
                    if (reaction === undefined)
                        return;
                    switch (reaction.emoji.name) {
                        case "1️⃣":
                            self_1.sendResult(message, records[0]);
                            return;
                        case "2️⃣":
                            self_1.sendResult(message, records[1]);
                            return;
                        case "3️⃣":
                            self_1.sendResult(message, records[2]);
                            return;
                        case "4️⃣":
                            self_1.sendResult(message, records[3]);
                            return;
                        case "5️⃣":
                            self_1.sendResult(message, records[4]);
                            return;
                        case "6️⃣":
                            self_1.sendResult(message, records[5]);
                            return;
                        case "7️⃣":
                            self_1.sendResult(message, records[6]);
                            return;
                        case "8️⃣":
                            self_1.sendResult(message, records[7]);
                            return;
                        case "9️⃣":
                            self_1.sendResult(message, records[8]);
                            return;
                        case "📢":
                            var username = reaction.users.cache.find(function (e) { return e.username !== reaction.message.author.username; }).username;
                            drunkenbot_1.DrunkenBot.reportMessage(message, username, 'User report');
                            return;
                    }
                })["catch"](function (e) { return drunkenbot_1.DrunkenBot.reportMessage(message, 'DrunkenBot Workflow', e); });
            });
        }
    };
    CsGoCommandParser.prototype.sendResult = function (message, video) {
        message.reply(video.source);
    };
    CsGoCommandParser.prototype.toSuggestionRow = function (video) {
        var side = video.side === CsGoSide_1.CsGoSide.CT ? this.emoji_ct : this.emoji_t;
        var type = video.type === CsGoNadeType_1.CsGoNadeType.Smoke ? this.emoji_smoke : CsGoNadeType_1.CsGoNadeType.Molotov ? this.emoji_molotov : this.emoji_flash;
        var map = StringHelper_1.StringHelper.capitalizeFirstChar(video.map);
        var location = video.location;
        return map + " - " + side.toString() + " - " + type.toString() + " - " + location;
    };
    CsGoCommandParser.prototype.toResultRow = function (video, index) {
        var side = video.side === CsGoSide_1.CsGoSide.CT ? this.emoji_ct : this.emoji_t;
        var type = video.type === CsGoNadeType_1.CsGoNadeType.Smoke ? this.emoji_smoke : CsGoNadeType_1.CsGoNadeType.Molotov ? this.emoji_molotov : this.emoji_flash;
        var map = StringHelper_1.StringHelper.capitalizeFirstChar(video.map);
        var location = video.location;
        return this.emoji_numbers[index] + ": " + map + " - " + side.toString() + " - " + type.toString() + " - " + location;
    };
    CsGoCommandParser.prototype.showHelp = function (message) {
        Logger_1.Logger.log(message.author.username + " requested help: " + message.content);
        var embed = new discord_js_1.MessageEmbed({
            files: [{
                    attachment: "assets/img/csgo/banner.png",
                    name: "banner.png"
                }]
        });
        embed.setTitle("CSGO Nades Bot Overview")
            .setDescription("Here is how the parameter system works for this module:")
            .addField("Click-through", "Emoji click support through the whole process. No more copying commands.")
            .addField("Filters", "The parameter system has been reworked in hope to ease the usage of this module. " +
            "Just type your query after !nades and the bot will try and match as many results as possible. The param order doesn't matter anymore:\r\n" +
            "`!nades mirage smoke t con`\r\n`!nades t smoke long mid`\r\n`!nades moly t`")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");
        this.discordService.sendMessageEmbed(message, "", embed);
    };
    CsGoCommandParser.prototype.updateEmojiCache = function (message) {
        this.emoji_smoke = message.guild.emojis.cache.find(function (e) { return e.name === 'csgo_smoke'; });
        this.emoji_molotov = message.guild.emojis.cache.find(function (e) { return e.name === 'csgo_molotov_ct'; });
        this.emoji_flash = message.guild.emojis.cache.find(function (e) { return e.name === 'csgo_flash'; });
        this.emoji_ct = message.guild.emojis.cache.find(function (e) { return e.name === 'csgo_ct'; });
        this.emoji_t = message.guild.emojis.cache.find(function (e) { return e.name === 'csgo_t'; });
    };
    CsGoCommandParser.AVAILABLE_TYPES = ["smoke", "s", "flash", "f", "m", "molo", "moli", "molli", "molly", "moly", "molotov", "molotof"];
    CsGoCommandParser.AVAILABLE_MAPS = Object.keys(CsGoMap_1.CsGoMap);
    CsGoCommandParser.AVAILABLE_SIDES = Object.keys(CsGoSide_1.CsGoSide);
    return CsGoCommandParser;
}(BaseCommandParser_1.BaseCommandParser));
exports.CsGoCommandParser = CsGoCommandParser;
//# sourceMappingURL=CsGoCommandParser.js.map