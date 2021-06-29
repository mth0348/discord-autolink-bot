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
exports.DndCommandParser = void 0;
var discord_js_1 = require("discord.js");
var Logger_1 = require("../helpers/Logger");
var BaseCommandParser_1 = require("../base/BaseCommandParser");
var Random_1 = require("../helpers/Random");
var ConfigProvider_1 = require("../helpers/ConfigProvider");
var DndCommandParser = (function (_super) {
    __extends(DndCommandParser, _super);
    function DndCommandParser(discordService, parameterService) {
        var _this = _super.call(this, discordService, parameterService, ConfigProvider_1.ConfigProvider.current().channelPermissions.dnd, ConfigProvider_1.ConfigProvider.current().rolePermissions.dnd) || this;
        _this.name = "DnD Parser";
        _this.prefixes = ["d", "w"];
        console.log("|| - registered DnD parser.    ||");
        return _this;
    }
    DndCommandParser.prototype.executeAsync = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, indexOfSpace, repeatCount, diceSize, color, title, resultText, i, diceRoll, critSuccess, critFailure, emoji, result, guild, member, nickname, embed;
            return __generator(this, function (_a) {
                parameters = this.parameterService.extractParameters(message.content, []);
                if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
                    this.showHelp(message);
                    return [2];
                }
                indexOfSpace = message.content.indexOf(" ");
                repeatCount = parseInt(message.content.substring(indexOfSpace + 1));
                if (isNaN(repeatCount) || repeatCount === -1) {
                    repeatCount = 1;
                }
                repeatCount = Math.min(10, Math.max(1, repeatCount));
                diceSize = parseInt(message.content.substring(2));
                if (isNaN(diceSize)) {
                    message.channel.send("\"" + message.content.substring(2) + "\" is not an number. Please use something like \"!d6\" or \"!d10\"...");
                    return [2];
                }
                diceSize = Math.min(100, Math.max(2, diceSize));
                if (diceSize < 1) {
                    message.channel.send("Your number must be higher than one. Please use something like \"!d6\" or \"!d10\"...");
                    return [2];
                }
                color = '';
                title = '';
                resultText = '';
                for (i = 0; i < repeatCount; i++) {
                    diceRoll = Random_1.Random.next(1, diceSize);
                    critSuccess = diceRoll == diceSize;
                    critFailure = diceRoll == 1;
                    color = critSuccess ? '#FFFF00' : critFailure ? '#FF0000' : '#dddddd';
                    emoji = critSuccess ? '🌟' : critFailure ? '💥' : '';
                    result = "**" + diceRoll + "** " + emoji;
                    guild = message.client.guilds.cache.first();
                    member = guild.member(message.author);
                    nickname = member ? member.displayName : null;
                    if (repeatCount > 1) {
                        resultText += (i + 1) + ") ";
                    }
                    resultText += nickname + " rolls a " + result.trim();
                    if (i < repeatCount - 1) {
                        resultText += '\r\n';
                    }
                    title = this.getLabel(diceRoll / diceSize);
                }
                if (repeatCount > 1) {
                    color = '#dddddd';
                    title = 'Mass roll';
                }
                Logger_1.Logger.log("DnD: Dice Roll:");
                Logger_1.Logger.log(resultText);
                embed = new discord_js_1.MessageEmbed()
                    .setTitle(title)
                    .setDescription(resultText)
                    .setFooter("D" + diceSize)
                    .setColor(color);
                this.discordService.sendMessageEmbed(message, "", embed);
                if (message.channel.type !== "dm") {
                    message["delete"]({});
                }
                return [2];
            });
        });
    };
    DndCommandParser.prototype.getLabel = function (percentage) {
        if (percentage <= 0.1) {
            return 'Ridiculously terrible!';
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
    };
    DndCommandParser.prototype.showHelp = function (message) {
        Logger_1.Logger.log(message.author.username + " requested help: " + message.content);
        var embed = new discord_js_1.MessageEmbed({
            files: [{
                    attachment: "assets/img/dnd/banner.png",
                    name: "banner.png"
                }]
        });
        embed.setTitle("DnD Bot Overview")
            .setDescription("You can roll dices!")
            .addField("Commands", "Just type `d` or `w` followed by the number of eyes your die should have. Optionally, you can also add a number to indicate how many rolls you wish to make in one go:\r\n" +
            "`!d10`\r\n`!d20`\r\n`!d6 2`")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");
        this.discordService.sendMessageEmbed(message, "", embed);
    };
    return DndCommandParser;
}(BaseCommandParser_1.BaseCommandParser));
exports.DndCommandParser = DndCommandParser;
//# sourceMappingURL=DndCommandParser.js.map