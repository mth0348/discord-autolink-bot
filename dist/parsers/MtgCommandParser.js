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
exports.MtgCommandParser = void 0;
var discord_js_1 = require("discord.js");
var MtgCardService_1 = require("../services/mtg/MtgCardService");
var BaseCommandParser_1 = require("./../base/BaseCommandParser");
var ConfigProvider_1 = require("../helpers/ConfigProvider");
var ParameterServiceConfig_1 = require("../dtos/ParameterServiceConfig");
var Random_1 = require("../helpers/Random");
var EnumHelper_1 = require("../helpers/EnumHelper");
var MtgCardRenderer_1 = require("../services/mtg/MtgCardRenderer");
var ImageProvider_1 = require("../persistence/repositories/ImageProvider");
var Constants_1 = require("../helpers/Constants");
var MtgCardRarity_1 = require("../dtos/mtg/MtgCardRarity");
var MtgCardType_1 = require("../dtos/mtg/MtgCardType");
var MtgOracleTextWrapperService_1 = require("../services/mtg/MtgOracleTextWrapperService");
var MtgDataRepository_1 = require("../persistence/repositories/MtgDataRepository");
var MtgSyntaxResolver_1 = require("../services/mtg/MtgSyntaxResolver");
var MtgAbilityService_1 = require("../services/mtg/MtgAbilityService");
var StringHelper_1 = require("../helpers/StringHelper");
var MtgPlaneswalkerCardRenderer_1 = require("../services/mtg/MtgPlaneswalkerCardRenderer");
var Logger_1 = require("../helpers/Logger");
var Canvas = require("canvas");
var MtgCommandParser = (function (_super) {
    __extends(MtgCommandParser, _super);
    function MtgCommandParser(discordService, parameterService) {
        var _this = _super.call(this, discordService, parameterService, ConfigProvider_1.ConfigProvider.current().channelPermissions.mtg, ConfigProvider_1.ConfigProvider.current().rolePermissions.mtg) || this;
        _this.name = "MtG Parser";
        _this.prefixes = ["mtg", "magic", "card"];
        _this.mtgDataRepository = new MtgDataRepository_1.MtgDataRepository();
        _this.mtgAbilityService = new MtgAbilityService_1.MtgAbilityService(_this.mtgDataRepository);
        _this.mtgSyntaxResolver = new MtgSyntaxResolver_1.MtgSyntaxResolver(_this.mtgDataRepository, _this.mtgAbilityService);
        _this.mtgOracleTextWrapperService = new MtgOracleTextWrapperService_1.MtgOracleTextWrapperService();
        _this.mtgCardService = new MtgCardService_1.MtgCardService(_this.mtgDataRepository, _this.mtgAbilityService, _this.mtgSyntaxResolver, _this.mtgOracleTextWrapperService);
        _this.paramConfigs = [
            new ParameterServiceConfig_1.ParameterServiceConfig("type", "t", MtgCommandParser.AVAILABLE_TYPES),
            new ParameterServiceConfig_1.ParameterServiceConfig("rarity", "r", MtgCommandParser.AVAILABLE_RARITIES),
            new ParameterServiceConfig_1.ParameterServiceConfig("color", "c"),
            new ParameterServiceConfig_1.ParameterServiceConfig("name", "n"),
        ];
        _this.initializeCardRendererData();
        console.log("|| - registered MtG parser.    ||");
        return _this;
    }
    MtgCommandParser.prototype.executeAsync = function (message) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var parameters, cardType, cardRarity, cardColor, cardName, card, mtgCardRenderer, renderedCard;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        Logger_1.Logger.log(message.author.username + " requested an MtG card with: " + message.content);
                        parameters = this.parameterService.extractParameters(message.content, this.paramConfigs);
                        if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
                            this.showHelp(message);
                            return [2];
                        }
                        cardType = (_a = this.parameterService.tryGetParameterValue("type", parameters)) !== null && _a !== void 0 ? _a : this.getRandomType();
                        cardRarity = (_b = this.parameterService.tryGetParameterValue("rarity", parameters)) !== null && _b !== void 0 ? _b : this.getRandomRarity();
                        cardColor = (_c = this.parameterService.tryGetParameterValue("color", parameters)) !== null && _c !== void 0 ? _c : this.getRandomColor(cardType);
                        cardName = this.parameterService.tryGetParameterValue("name", parameters);
                        card = this.mtgCardService.generateCard(EnumHelper_1.EnumHelper.toMtgCardType(cardType), EnumHelper_1.EnumHelper.toMtgCardRarity(cardRarity), this.stripInvalidColorValues(cardColor), cardName);
                        mtgCardRenderer = card.type === MtgCardType_1.MtgCardType.Planeswalker ? new MtgPlaneswalkerCardRenderer_1.MtgPlaneswalkerCardRenderer(card) : new MtgCardRenderer_1.MtgCardRenderer(card);
                        return [4, mtgCardRenderer.renderCard()];
                    case 1:
                        renderedCard = _d.sent();
                        this.discordService.sendMessageWithReactions(message, "", renderedCard);
                        return [2];
                }
            });
        });
    };
    MtgCommandParser.prototype.showHelp = function (message) {
        Logger_1.Logger.log(message.author.username + " requested help: " + message.content);
        var embed = new discord_js_1.MessageEmbed({
            files: [{
                    attachment: "assets/img/mtg/bot banner.png",
                    name: "banner.png"
                }]
        });
        embed.setTitle("MtG Bot Overview")
            .setDescription("The new MtG Bot can do a lot of awesome stuff. Here are its features:")
            .addField("Rendering System", "Yes, that's right. The bot generates and renders the cards at runtime to a 2D image canvas. Artworks are chosen randomly amongst those that fit the card's type best.")
            .addField("New Algorithm", "The way cards are generated has changed. Now, the color is chosen first, the rest comes after. This means better alignment of abilities with colors, plus better balancing of manacosts.")
            .addField("More Content", "There are over 5000 lines of config file for the generator to draw names, abilities and keywords from. Also, there are over 1000 card artworks to choose from, all hand-picked by Mats.")
            .addField("Card Types", "The bot can generate almost all types of cards. Supported are *creatures*, *artifacts*, *artifact creatures*, *instants*, *sorceries*, *lands*, *enchantments*, *planeswalkers*, and subtypes like *auras* and *equipments*.")
            .addField("Filters", "A new parameter system has taken the place of the old one, allowing for more control in generating cards. Use parameters like this:\r\n" +
            "`type:<type>` (short `t`), like 't:creature'\r\n`color:<color>` (short `c`), like 'c:ubr' or 'color:c'\r\n`rarity:<rarity>` (short `r`), like 'r:ymthic'.\r\n`name:<text>` (short `n`) to put a name yourself (use '_' for spaces).\r\n")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");
        this.discordService.sendMessageEmbed(message, "", embed);
    };
    MtgCommandParser.prototype.initializeCardRendererData = function () {
        Canvas.registerFont('assets/fonts/MPLANTIN.ttf', { family: "mplantin" });
        Canvas.registerFont('assets/fonts/MPLANTIN-BOLD.ttf', { family: "mplantinbold" });
        Canvas.registerFont('assets/fonts/MPLANTIN-ITALIC.ttf', { family: "mplantinitalic" });
        Canvas.registerFont('assets/fonts/MatrixBold.ttf', { family: "matrixbold" });
        Constants_1.Resources.MtgImageUrls.forEach(function (url) {
            ImageProvider_1.ImageProvider.registerImageUrl(url.path);
        });
        ImageProvider_1.ImageProvider.registerImageUrl("assets/img/mtg/expansion/common.png");
        ImageProvider_1.ImageProvider.registerImageUrl("assets/img/mtg/expansion/uncommon.png");
        ImageProvider_1.ImageProvider.registerImageUrl("assets/img/mtg/expansion/rare.png");
        ImageProvider_1.ImageProvider.registerImageUrl("assets/img/mtg/expansion/mythic.png");
    };
    MtgCommandParser.prototype.getRandomType = function () {
        var type = Random_1.Random.complex([
            { value: MtgCardType_1.MtgCardType.Creature, chance: 0.20 },
            { value: MtgCardType_1.MtgCardType.Instant, chance: 0.13 },
            { value: MtgCardType_1.MtgCardType.Sorcery, chance: 0.13 },
            { value: MtgCardType_1.MtgCardType.Planeswalker, chance: 0.13 },
            { value: MtgCardType_1.MtgCardType.Enchantment, chance: 0.13 },
            { value: MtgCardType_1.MtgCardType.Artifact, chance: 0.13 },
            { value: MtgCardType_1.MtgCardType.Land, chance: 0.13 },
        ], Random_1.Random.nextFromList([MtgCardType_1.MtgCardType.Creature, MtgCardType_1.MtgCardType.Instant, MtgCardType_1.MtgCardType.Sorcery, MtgCardType_1.MtgCardType.Planeswalker, MtgCardType_1.MtgCardType.Enchantment, MtgCardType_1.MtgCardType.Artifact, MtgCardType_1.MtgCardType.Land]));
        return type;
    };
    MtgCommandParser.prototype.getRandomRarity = function () {
        return Random_1.Random.nextFromList(Object.keys(MtgCardRarity_1.MtgCardRarity));
    };
    MtgCommandParser.prototype.getRandomColor = function (cardType) {
        var allowColorless = [MtgCardType_1.MtgCardType.Creature, MtgCardType_1.MtgCardType.Artifactcreature, MtgCardType_1.MtgCardType.Land, MtgCardType_1.MtgCardType.Artifact, MtgCardType_1.MtgCardType.Planeswalker].some(function (c) { return c == cardType; });
        var list = Random_1.Random.complex([
            { value: MtgCommandParser.COLORLESS, chance: (allowColorless ? 0.1 : 0.0) },
            { value: MtgCommandParser.BASIC_COLORS, chance: 0.25 },
            { value: MtgCommandParser.TWO_COLOR_PAIRS, chance: 0.30 },
            { value: MtgCommandParser.THREE_COLOR_PAIRS, chance: 0.15 },
            { value: MtgCommandParser.FOUR_COLOR_PAIRS, chance: 0.1 },
            { value: MtgCommandParser.FIVE_COLORS, chance: 0.1 },
        ], MtgCommandParser.BASIC_COLORS);
        return Random_1.Random.nextFromList(list);
    };
    MtgCommandParser.prototype.stripInvalidColorValues = function (cardColor) {
        return StringHelper_1.StringHelper.removeDuplicateChars(cardColor.replace(/[^wubrgcWUBRGC]/g, ""));
    };
    MtgCommandParser.AVAILABLE_TYPES = ["creature", "land", "instant", "sorcery", "planeswalker", "enchantment", "artifact", "aura", "artifactcreature", "equipment"];
    MtgCommandParser.AVAILABLE_RARITIES = ["common", "uncommon", "rare", "mythic"];
    MtgCommandParser.COLORLESS = ["c"];
    MtgCommandParser.BASIC_COLORS = ["w", "u", "b", "r", "g"];
    MtgCommandParser.TWO_COLOR_PAIRS = ["wu", "wb", "wr", "wg", "ub", "ur", "ug", "br", "bg", "rg"];
    MtgCommandParser.THREE_COLOR_PAIRS = ["wub", "wur", "wug", "wbr", "wbg", "wrg", "ubr", "ubg", "urg", "brg"];
    MtgCommandParser.FOUR_COLOR_PAIRS = ["wubr", "wugb", "wurg", "wbrg", "ubrg"];
    MtgCommandParser.FIVE_COLORS = ["wubrg"];
    return MtgCommandParser;
}(BaseCommandParser_1.BaseCommandParser));
exports.MtgCommandParser = MtgCommandParser;
//# sourceMappingURL=MtgCommandParser.js.map