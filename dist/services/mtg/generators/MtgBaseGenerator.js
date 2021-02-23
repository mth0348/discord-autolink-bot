"use strict";
exports.__esModule = true;
exports.MtgBaseGenerator = void 0;
var Random_1 = require("../../../helpers/Random");
var MtgCardRarity_1 = require("../../../dtos/mtg/MtgCardRarity");
var Logger_1 = require("../../../helpers/Logger");
var LogType_1 = require("../../../dtos/LogType");
var fs = require("fs");
var MtgBaseGenerator = (function () {
    function MtgBaseGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) {
        this.mtgDataRepository = mtgDataRepository;
        this.mtgAbilityService = mtgAbilityService;
        this.mtgSyntaxResolver = mtgSyntaxResolver;
        this.mtgOracleTextWrapperService = mtgOracleTextWrapperService;
    }
    MtgBaseGenerator.prototype.estimateCmc = function (card) {
        var totalScore = 0;
        var minScore = 1;
        Logger_1.Logger.log("Started card cost estimation:", LogType_1.LogType.CostEstimation);
        if (card.hasPowerToughness()) {
            totalScore += card.power / 2;
            totalScore += card.toughness / 2.5;
            Logger_1.Logger.log("Power: " + card.power / 2, LogType_1.LogType.CostEstimation);
            Logger_1.Logger.log("Toughness: " + card.toughness / 2.5, LogType_1.LogType.CostEstimation);
            minScore = Math.round(totalScore);
        }
        card.oracle.keywords.forEach(function (k) { return totalScore += k.getScore(); });
        card.oracle.abilities.forEach(function (a) { return totalScore += a.getScore(); });
        var minCmcForReduction = 3;
        var randomReduction = totalScore > minCmcForReduction ? Random_1.Random.chance((totalScore - minCmcForReduction) / 10) ? 1 : 0 : 0;
        var mythicReduction = card.rarity === MtgCardRarity_1.MtgCardRarity.Mythic ? Random_1.Random.chance(0.33) ? 0.5 : 0.25 : 0;
        var reducedCmc = totalScore - randomReduction - mythicReduction;
        Logger_1.Logger.log("Random reduction: " + randomReduction, LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log("Mythic reduction: " + mythicReduction, LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log("Before rounding: " + (reducedCmc), LogType_1.LogType.CostEstimation);
        var roundedScore = Math.round(reducedCmc);
        Logger_1.Logger.log("After rounding: " + roundedScore, LogType_1.LogType.CostEstimation);
        card.cmc = Math.max(minScore, Math.min(9, roundedScore));
        Logger_1.Logger.log("Final capped CMC = " + card.cmc, LogType_1.LogType.CostEstimation);
    };
    MtgBaseGenerator.prototype.chooseArtwork = function (card, folder) {
        var artPath = "assets/img/mtg/cards/" + folder + "/";
        var files = fs.readdirSync(artPath);
        var randomArtworkFile = Random_1.Random.nextFromList(files);
        card.imageUrl = artPath + randomArtworkFile;
    };
    MtgBaseGenerator.prototype.resolveSyntax = function (card) {
        this.mtgSyntaxResolver.resolveSyntax(card);
    };
    MtgBaseGenerator.prototype.wrapTextForRenderer = function (card) {
        var preset = this.mtgOracleTextWrapperService.calculateTextWrapPreset(card.oracle);
        var wrappedTextLines = this.mtgOracleTextWrapperService.wordWrapAllOracleText(card.oracle, preset);
        card.wrappedOracleLines = wrappedTextLines;
        card.rendererPreset = preset;
    };
    return MtgBaseGenerator;
}());
exports.MtgBaseGenerator = MtgBaseGenerator;
//# sourceMappingURL=MtgBaseGenerator.js.map