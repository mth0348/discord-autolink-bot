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
exports.__esModule = true;
exports.MtgPlaneswalkerGenerator = void 0;
var Random_1 = require("../../../helpers/Random");
var MtgCardRarity_1 = require("../../../dtos/mtg/MtgCardRarity");
var MtgOracleTextWrapperService_1 = require("../MtgOracleTextWrapperService");
var MtgHelper_1 = require("../../../helpers/mtg/MtgHelper");
var MtgBaseGenerator_1 = require("./MtgBaseGenerator");
var Logger_1 = require("../../../helpers/Logger");
var LogType_1 = require("../../../dtos/LogType");
var MtgPlaneswalkerGenerator = (function (_super) {
    __extends(MtgPlaneswalkerGenerator, _super);
    function MtgPlaneswalkerGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) {
        return _super.call(this, mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) || this;
    }
    MtgPlaneswalkerGenerator.prototype.generate = function (card) {
        card.isLegendary = true;
        card.supertype = "Legendary";
        card.name = card.name || this.mtgDataRepository.getPlaneswalkerName();
        card.rarity = Random_1.Random.chance(0.5) ? MtgCardRarity_1.MtgCardRarity.Rare : MtgCardRarity_1.MtgCardRarity.Mythic;
        this.chooseSubtypes(card);
        this.chooseAbilities(card);
        this.chooseArtwork(card, 'planeswalker');
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.estimateStartingLoyalty(card);
        card.color = MtgHelper_1.MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper_1.MtgHelper.getManacost(card.cmc, card.color);
        return card;
    };
    MtgPlaneswalkerGenerator.prototype.wrapTextForRenderer = function (card) {
        card.rendererPreset = MtgOracleTextWrapperService_1.MtgOracleTextWrapperService.PRESET_TINY;
        var wrappedTextLines = this.mtgOracleTextWrapperService.wordWrapAllPlaneswalkerOracleText(card.oracle, card.rendererPreset.maxCharactersPerLine - 2);
        card.wrappedOracleLines = wrappedTextLines;
    };
    MtgPlaneswalkerGenerator.prototype.estimateCmc = function (card) {
        var totalScore = 0;
        Logger_1.Logger.log("Started card cost estimation:", LogType_1.LogType.CostEstimation);
        card.oracle.abilities.forEach(function (a) { return totalScore += a.getScore(); });
        totalScore *= Random_1.Random.next(50, 70) / 100;
        var minCmcForReduction = 3;
        var randomReduction = totalScore > minCmcForReduction ? Random_1.Random.chance((totalScore - minCmcForReduction) / 10) ? 1 : 0 : 0;
        var randomReduction2 = Random_1.Random.chance(0.5) ? 0.5 : 0.25;
        var reducedCmc = totalScore - randomReduction - randomReduction2;
        Logger_1.Logger.log("Random reduction: " + randomReduction, LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log("Random reduction 2: " + randomReduction2, LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log("Before rounding: " + (reducedCmc), LogType_1.LogType.CostEstimation);
        var roundedScore = Math.round(reducedCmc);
        Logger_1.Logger.log("After rounding: " + roundedScore, LogType_1.LogType.CostEstimation);
        card.cmc = Math.max(3, Math.min(9, roundedScore));
        Logger_1.Logger.log("Final capped CMC = " + card.cmc, LogType_1.LogType.CostEstimation);
    };
    MtgPlaneswalkerGenerator.prototype.chooseSubtypes = function (card) {
        card.subtype = card.name.split(",")[0].split(" ")[0];
    };
    MtgPlaneswalkerGenerator.prototype.chooseAbilities = function (card) {
        this.mtgAbilityService.generateActivatedPwAbility(card, +0.0, +1.00, true);
        this.mtgAbilityService.generateActivatedPwAbility(card, +1.1, +2.99);
        this.mtgAbilityService.generateActivatedPwAbility(card, +3.0, +99.0);
    };
    MtgPlaneswalkerGenerator.prototype.estimateStartingLoyalty = function (card) {
        var startingLoyalty = card.cmc - Random_1.Random.next(0, 1);
        var thirdAbility = card.oracle.abilities[2];
        if (thirdAbility.getRawScore() <= 4)
            startingLoyalty += Random_1.Random.next(0, 1);
        card.startingLoyalty = Math.max(2, Math.min(6, startingLoyalty));
    };
    return MtgPlaneswalkerGenerator;
}(MtgBaseGenerator_1.MtgBaseGenerator));
exports.MtgPlaneswalkerGenerator = MtgPlaneswalkerGenerator;
//# sourceMappingURL=MtgPlaneswalkerGenerator.js.map