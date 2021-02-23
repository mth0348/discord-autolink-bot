"use strict";
exports.__esModule = true;
exports.MtgCardService = void 0;
var MtgCard_1 = require("../../dtos/mtg/MtgCard");
var MtgCardRarity_1 = require("../../dtos/mtg/MtgCardRarity");
var MtgCardType_1 = require("../../dtos/mtg/MtgCardType");
var MtgCreatureGenerator_1 = require("./generators/MtgCreatureGenerator");
var MtgInstantSorceryGenerator_1 = require("./generators/MtgInstantSorceryGenerator");
var MtgLandGenerator_1 = require("./generators/MtgLandGenerator");
var MtgPlaneswalkerGenerator_1 = require("./generators/MtgPlaneswalkerGenerator");
var Logger_1 = require("../../helpers/Logger");
var LogType_1 = require("../../dtos/LogType");
var MtgEnchantmentGenerator_1 = require("./generators/MtgEnchantmentGenerator");
var Random_1 = require("../../helpers/Random");
var MtgArtifactGenerator_1 = require("./generators/MtgArtifactGenerator");
var MtgCardService = (function () {
    function MtgCardService(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) {
        this.mtgCreatureGenerator = new MtgCreatureGenerator_1.MtgCreatureGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgInstantSorceryGenerator = new MtgInstantSorceryGenerator_1.MtgInstantSorceryGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgLandGenerator = new MtgLandGenerator_1.MtgLandGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgPlaneswalkerGenerator = new MtgPlaneswalkerGenerator_1.MtgPlaneswalkerGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgEnchantmentGenerator = new MtgEnchantmentGenerator_1.MtgEnchantmentGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgArtifactGenerator = new MtgArtifactGenerator_1.MtgArtifactGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
    }
    MtgCardService.prototype.generateCard = function (cardType, cardRarity, color, name) {
        var card = new MtgCard_1.MtgCard();
        card.type = cardType;
        card.rarity = cardRarity;
        card.rarityScore = [MtgCardRarity_1.MtgCardRarity.Common, MtgCardRarity_1.MtgCardRarity.Uncommon, MtgCardRarity_1.MtgCardRarity.Rare, MtgCardRarity_1.MtgCardRarity.Mythic].indexOf(cardRarity) + 1;
        card.color = color.toLowerCase();
        card.name = name === undefined ? "" : name.trim().substring(0, 25).replace(/_/g, " ");
        switch (cardType) {
            case MtgCardType_1.MtgCardType.Creature:
                card = this.mtgCreatureGenerator.generate(card);
                break;
            case MtgCardType_1.MtgCardType.Artifactcreature:
                card.color = "c";
                card = this.mtgCreatureGenerator.generate(card);
                break;
            case MtgCardType_1.MtgCardType.Instant:
                card = this.mtgInstantSorceryGenerator.generate(card);
                break;
            case MtgCardType_1.MtgCardType.Sorcery:
                card = this.mtgInstantSorceryGenerator.generate(card);
                break;
            case MtgCardType_1.MtgCardType.Land:
                card = this.mtgLandGenerator.generate(card);
                break;
            case MtgCardType_1.MtgCardType.Planeswalker:
                card = this.mtgPlaneswalkerGenerator.generate(card);
                break;
            case MtgCardType_1.MtgCardType.Aura:
            case MtgCardType_1.MtgCardType.Enchantment:
                card = this.mtgEnchantmentGenerator.generate(card);
                break;
            case MtgCardType_1.MtgCardType.Artifact:
                var isArtifactCreature = Random_1.Random.chance(0.10);
                if (isArtifactCreature) {
                    card.type = MtgCardType_1.MtgCardType.Artifactcreature;
                    card.color = "c";
                    card = this.mtgCreatureGenerator.generate(card);
                }
                else {
                    card = this.mtgArtifactGenerator.generate(card);
                }
                break;
            case MtgCardType_1.MtgCardType.Equipment:
                card = this.mtgArtifactGenerator.generate(card);
                break;
            default:
                throw "Not implemented";
        }
        Logger_1.Logger.log("Generated card for params \"type: " + cardType + ", rarity: " + cardRarity + ", color: " + color + "\":");
        card.toLogString().forEach(function (l) { return Logger_1.Logger.log(l, LogType_1.LogType.Verbose); });
        Logger_1.Logger.log("Card Object: ", LogType_1.LogType.Verbose, card);
        return card;
    };
    return MtgCardService;
}());
exports.MtgCardService = MtgCardService;
//# sourceMappingURL=MtgCardService.js.map