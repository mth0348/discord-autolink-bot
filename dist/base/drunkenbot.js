"use strict";
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
exports.DrunkenBot = void 0;
var discord_js_1 = require("discord.js");
var MtgCommandParser_1 = require("../parsers/MtgCommandParser");
var DiscordService_1 = require("../services/DiscordService");
var ParameterService_1 = require("../services/ParameterService");
var ImageProvider_1 = require("../persistence/repositories/ImageProvider");
var Logger_1 = require("../helpers/Logger");
var BotCommandParser_1 = require("../parsers/BotCommandParser");
var CsGoCommandParser_1 = require("../parsers/CsGoCommandParser");
var DndCommandParser_1 = require("../parsers/DndCommandParser");
var DrunkenBot = (function () {
    function DrunkenBot(token) {
        this.client = new discord_js_1.Client();
        this.client.login(token);
        this.discordService = new DiscordService_1.DiscordService();
        this.parameterService = new ParameterService_1.ParameterService();
        this.registeredParsers = [];
        console.log("||=============================||");
        console.log("||    DRUNKEN DISCORD BOT      ||");
        console.log("||          by Mats            ||");
        console.log("||=============================||");
        console.log("");
        console.log("||=== Parsers =================||");
        this.registerCommandParsers();
        ImageProvider_1.ImageProvider.loadImageDatabase();
        console.log("||=============================||");
        console.log("BOT READY!");
        console.log("");
    }
    DrunkenBot.prototype.startListening = function () {
        var _this = this;
        this.client.on('message', function (message) {
            _this.registeredParsers.forEach(function (parser) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!parser.isAllowedCommand(message)) return [3, 2];
                            return [4, this.startWorkflow(parser, message)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2];
                    }
                });
            }); });
        });
    };
    DrunkenBot.prototype.startWorkflow = function (parser, message) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Logger_1.Logger.clearStack();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, parser.executeAsync(message)];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        e_1 = _a.sent();
                        message.channel.send("Oops, something went wrong, sorry. The error has been reported automatically. Please try again...");
                        DrunkenBot.reportMessage(message, parser.name, e_1);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    DrunkenBot.reportMessage = function (message, reporter, e) {
        var msg = "";
        msg += "Error reported by \"" + reporter + "\":\r\n";
        msg += "Exception: " + e + "\r\n";
        msg += "LogStack:\r\n";
        msg += "==========================================\r\n";
        var logStack = Logger_1.Logger.getStack();
        logStack.forEach(function (log) {
            msg += log + "\r\n";
        });
        msg += "==========================================";
        console.warn(msg);
        var reportChannel = message.client.channels.cache.map(function (c) { return c; }).find(function (c) { return c.name === "bot-reports"; });
        reportChannel.send(msg);
    };
    DrunkenBot.prototype.registerCommandParsers = function () {
        this.registeredParsers.push(new BotCommandParser_1.BotCommandParser(this.discordService, this.parameterService));
        this.registeredParsers.push(new MtgCommandParser_1.MtgCommandParser(this.discordService, this.parameterService));
        this.registeredParsers.push(new CsGoCommandParser_1.CsGoCommandParser(this.discordService, this.parameterService));
        this.registeredParsers.push(new DndCommandParser_1.DndCommandParser(this.discordService, this.parameterService));
    };
    return DrunkenBot;
}());
exports.DrunkenBot = DrunkenBot;
//# sourceMappingURL=drunkenbot.js.map