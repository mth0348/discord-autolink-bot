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
var CsGoCommandParser = (function (_super) {
    __extends(CsGoCommandParser, _super);
    function CsGoCommandParser(discordService, parameterService) {
        var _this = _super.call(this, discordService, parameterService, undefined, undefined) || this;
        _this.name = "CS GO Parser";
        _this.prefixes = ["nades", "cs", "csgo"];
        console.log("|| - registered CS GO parser.  ||");
        return _this;
    }
    CsGoCommandParser.prototype.executeAsync = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var embed, parameters;
            return __generator(this, function (_a) {
                Logger_1.Logger.log(message.author.username + " requested help: " + message.content);
                embed = new discord_js_1.MessageEmbed({
                    files: [{
                            attachment: "assets/img/banner.png",
                            name: "banner.png"
                        }]
                });
                parameters = this.parameterService.extractParameters(message.content, []);
                if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
                    this.showHelp(message);
                    return [2];
                }
                this.discordService.sendMessage(message, "This bot is still under construction...");
                return [2];
            });
        });
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
            .addField("Filters", "The parameter system has been reworked in hope to ease the usage of this module:\r\n" +
            "Just type your query after !nades and the bot will try and match as many results as possible. For example:\r\n" +
            "`!nades mirage ct abs`\r\n`!nades inferno pit flash`\r\n")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");
        this.discordService.sendMessageEmbed(message, embed);
    };
    CsGoCommandParser.AVAILABLE_TYPES = ["smoke", "s", "flash", "f", "m", "molo", "moli", "moly", "molotov", "molotof"];
    CsGoCommandParser.AVAILABLE_MAPS = Object.keys(CsGoMap_1.CsGoMap);
    CsGoCommandParser.AVAILABLE_SIDES = Object.keys(CsGoSide_1.CsGoSide);
    return CsGoCommandParser;
}(BaseCommandParser_1.BaseCommandParser));
exports.CsGoCommandParser = CsGoCommandParser;
//# sourceMappingURL=CsGoCommandParser.js.map