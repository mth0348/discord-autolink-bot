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
exports.MtgCreatureGenerator = void 0;
var Random_1 = require("../../../helpers/Random");
var MtgCardRarity_1 = require("../../../dtos/mtg/MtgCardRarity");
var MtgAbilityType_1 = require("../../../dtos/mtg/MtgAbilityType");
var MtgHelper_1 = require("../../../helpers/mtg/MtgHelper");
var MtgBaseGenerator_1 = require("./MtgBaseGenerator");
var MtgCardType_1 = require("../../../dtos/mtg/MtgCardType");
var MtgCreatureGenerator = (function (_super) {
    __extends(MtgCreatureGenerator, _super);
    function MtgCreatureGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) {
        return _super.call(this, mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) || this;
    }
    MtgCreatureGenerator.prototype.generate = function (card) {
        card.isLegendary = card.isLegendary || Random_1.Random.chance(0.25) && (card.rarity === MtgCardRarity_1.MtgCardRarity.Rare || card.rarity === MtgCardRarity_1.MtgCardRarity.Mythic);
        card.supertype = card.isLegendary ? "Legendary" : "";
        card.name = card.name || this.mtgDataRepository.getCreatureName(card.isLegendary);
        var isArtifactCreature = MtgHelper_1.MtgHelper.isExactlyColor(card.color, "c") || card.type === MtgCardType_1.MtgCardType.Artifactcreature;
        card.type = isArtifactCreature ? MtgCardType_1.MtgCardType.Artifactcreature : MtgCardType_1.MtgCardType.Creature;
        this.chooseSubtypes(card, isArtifactCreature);
        this.chooseKeywords(card);
        this.chooseAbilities(card);
        this.chooseArtwork(card, isArtifactCreature ? "artifactcreature" : "creature");
        this.choosePower(card);
        this.chooseToughness(card);
        this.matchPowerToughnessToColor(card);
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper_1.MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper_1.MtgHelper.getManacost(card.cmc, card.color);
        return card;
    };
    MtgCreatureGenerator.prototype.chooseSubtypes = function (card, isArtifactCreature) {
        if (!card.subtype) {
            if (isArtifactCreature) {
                card.subtype = this.mtgDataRepository.getArtifactCreatureSubtype();
            }
            else {
                var subtypeCount = Random_1.Random.complex([
                    { value: 1, chance: 0.7 },
                    { value: 2, chance: 0.3 }
                ], 1);
                card.subtype = this.mtgDataRepository.getSubtypes(subtypeCount).join(" ");
            }
        }
    };
    MtgCreatureGenerator.prototype.choosePower = function (card) {
        var power = Random_1.Random.complex([
            { value: 1, chance: 0.15 + (card.rarityScore <= 1 ? 0.1 : 0) },
            { value: 2, chance: 0.20 + (card.rarityScore <= 1 ? 0.1 : 0) },
            { value: 3, chance: 0.20 + (card.rarityScore <= 2 ? 0.1 : 0) },
            { value: 4, chance: 0.15 },
            { value: 5, chance: 0.10 },
            { value: 6, chance: 0.10 + (card.rarityScore >= 3 ? 0.1 : 0) },
            { value: 7, chance: 0.05 + (card.rarityScore >= 3 ? 0.1 : 0) },
            { value: 8, chance: 0.05 + (card.rarityScore >= 3 ? 0.1 : 0) }
        ], Random_1.Random.next(1, 4));
        card.power = power;
    };
    MtgCreatureGenerator.prototype.chooseToughness = function (card) {
        var toughness = Random_1.Random.complex([
            { value: 1, chance: 0.15 + (card.rarityScore <= 1 ? 0.1 : 0) },
            { value: 2, chance: 0.20 + (card.rarityScore <= 1 ? 0.1 : 0) },
            { value: 3, chance: 0.20 + (card.rarityScore <= 2 ? 0.1 : 0) },
            { value: 4, chance: 0.15 },
            { value: 5, chance: 0.10 },
            { value: 6, chance: 0.10 + (card.rarityScore >= 3 ? 0.1 : 0) },
            { value: 7, chance: 0.05 + (card.rarityScore >= 3 ? 0.1 : 0) },
            { value: 8, chance: 0.05 + (card.rarityScore >= 3 ? 0.1 : 0) }
        ], Random_1.Random.next(1, 4));
        card.toughness = toughness;
    };
    MtgCreatureGenerator.prototype.matchPowerToughnessToColor = function (card) {
        var p = card.power;
        var t = card.toughness;
        if (MtgHelper_1.MtgHelper.isExactlyColor(card.color, "w") || MtgHelper_1.MtgHelper.isExactlyColor(card.color, "u")) {
            card.power = Math.min(p, t);
            card.toughness = Math.max(p, t);
        }
        if ((card.color.indexOf("w") >= 0 || card.color.indexOf("u") >= 0) && Random_1.Random.chance(0.3)) {
            card.power = Math.min(p, t);
            card.toughness = Math.max(p, t);
        }
        if (card.color.indexOf("r") >= 0 && Random_1.Random.chance(0.5)) {
            card.power = Math.max(p, t);
            card.toughness = Math.min(p, t);
        }
        if (Random_1.Random.chance(0.5)) {
            var dif = card.power - card.toughness;
            if (dif > 3) {
                card.power -= 1;
                card.toughness += 1;
            }
            if (dif < -3) {
                card.power += 1;
                card.toughness -= 1;
            }
        }
        if (card.oracle.keywords.some(function (k) { return k.name === "Persist"; })) {
            card.toughness = Math.max(card.toughness, 2);
        }
    };
    MtgCreatureGenerator.prototype.chooseKeywords = function (card) {
        var keywordCount = Random_1.Random.complex([
            { value: 0, chance: 0.25 },
            { value: 1, chance: 0.35 },
            { value: 2, chance: 0.35 + (card.rarityScore >= 3 ? 0.2 : 0) },
            { value: 3, chance: 0.05 + (card.rarityScore >= 4 ? 0.2 : 0) }
        ], card.rarityScore >= 4 ? 1 : 0);
        var keywords = this.mtgDataRepository.getKeywordsByColorAndType(card.color, card.type, keywordCount);
        card.oracle.keywords = keywords;
        if (keywords.some(function (k) { return k.name === "Changeling"; })) {
            card.subtype = "Shapeshifter";
        }
    };
    MtgCreatureGenerator.prototype.chooseAbilities = function (card) {
        if (card.rarity === MtgCardRarity_1.MtgCardRarity.Common) {
            return;
        }
        var abilityCount = Random_1.Random.complex([
            { value: 0, chance: 0.25 },
            { value: 1, chance: 0.50 + (card.rarityScore <= 2 ? -0.2 : 0.2) },
            { value: 2, chance: 0.25 + (card.rarityScore <= 2 ? -1.0 : 0.2) }
        ], 0);
        for (var i = 0; i < abilityCount; i++) {
            var abilityType = Random_1.Random.complex([
                { value: MtgAbilityType_1.MtgAbilityType.Activated, chance: 0.40 },
                { value: MtgAbilityType_1.MtgAbilityType.Triggered, chance: 0.40 },
                { value: MtgAbilityType_1.MtgAbilityType.Static, chance: 0.20 }
            ], 0);
            this.generateAbility(card, abilityType);
        }
        card.oracle.abilities.sort(function (a, b) { return a.type - b.type; });
    };
    MtgCreatureGenerator.prototype.generateAbility = function (card, abilityType) {
        switch (abilityType) {
            case MtgAbilityType_1.MtgAbilityType.Activated:
                return this.mtgAbilityService.generateActivatedAbility(card);
            case MtgAbilityType_1.MtgAbilityType.Triggered:
                return this.mtgAbilityService.generateTriggeredAbility(card);
            case MtgAbilityType_1.MtgAbilityType.Static:
                return this.mtgAbilityService.generateStaticAbility(card);
        }
    };
    MtgCreatureGenerator.prototype.chooseFlavorText = function (card) {
        if (Random_1.Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            var maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            var smallEnoughFlavorText = this.mtgDataRepository.getCreatureFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                var flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine);
                flavorTextLines.forEach(function (f) { return card.wrappedOracleLines.push("FT_" + f); });
            }
        }
    };
    return MtgCreatureGenerator;
}(MtgBaseGenerator_1.MtgBaseGenerator));
exports.MtgCreatureGenerator = MtgCreatureGenerator;
//# sourceMappingURL=MtgCreatureGenerator.js.map