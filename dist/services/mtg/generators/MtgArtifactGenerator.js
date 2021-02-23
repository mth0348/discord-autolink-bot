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
exports.MtgArtifactGenerator = void 0;
var Random_1 = require("../../../helpers/Random");
var MtgCardRarity_1 = require("../../../dtos/mtg/MtgCardRarity");
var MtgAbilityType_1 = require("../../../dtos/mtg/MtgAbilityType");
var MtgHelper_1 = require("../../../helpers/mtg/MtgHelper");
var MtgBaseGenerator_1 = require("./MtgBaseGenerator");
var MtgKeyword_1 = require("../../../persistence/entities/mtg/MtgKeyword");
var MtgCardType_1 = require("../../../dtos/mtg/MtgCardType");
var MtgArtifactGenerator = (function (_super) {
    __extends(MtgArtifactGenerator, _super);
    function MtgArtifactGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) {
        return _super.call(this, mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) || this;
    }
    MtgArtifactGenerator.prototype.generate = function (card) {
        card.isLegendary = card.isLegendary || Random_1.Random.chance(0.25) && (card.rarity === MtgCardRarity_1.MtgCardRarity.Rare || card.rarity === MtgCardRarity_1.MtgCardRarity.Mythic);
        card.supertype = card.isLegendary ? "Legendary" : "";
        card.color = "c";
        var isEquipment = Random_1.Random.chance(0.33) || card.type === MtgCardType_1.MtgCardType.Equipment;
        card.name = card.name || this.mtgDataRepository.getArtifactName(card.isLegendary, isEquipment);
        card.type = MtgCardType_1.MtgCardType.Artifact;
        this.chooseSubtypes(card, isEquipment);
        this.chooseAbilities(card, isEquipment);
        this.chooseArtwork(card, isEquipment ? "equipment" : "artifact");
        this.resolveSyntax(card);
        if (isEquipment)
            card.oracle.keywords[0].score = 0;
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper_1.MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper_1.MtgHelper.getManacost(card.cmc, card.color);
        return card;
    };
    MtgArtifactGenerator.prototype.chooseSubtypes = function (card, isEquipment) {
        if (isEquipment) {
            card.subtype = "Equipment";
        }
    };
    MtgArtifactGenerator.prototype.chooseAbilities = function (card, isEquipment) {
        var abilityCount = Random_1.Random.complex([
            { value: 1, chance: 0.50 },
            { value: 2, chance: 0.50 + (card.rarityScore <= 2 ? -1.0 : 0.0) }
        ], 1);
        if (isEquipment) {
            this.mtgAbilityService.generateEquipmentAbility(card, -99, +99);
            var a1 = card.oracle.abilities[0];
            card.oracle.keywords.push(new MtgKeyword_1.MtgKeyword({
                name: "Equip",
                score: a1.effect.score,
                colorIdentity: a1.effect.colorIdentity,
                nameExtension: "",
                hasCost: true,
                isTop: false
            }));
            a1.effect.text = "Equipped " + a1.effect.auraType + " " + a1.effect.text;
            if (abilityCount === 2) {
                this.mtgAbilityService.generateEquipmentAbility(card, -99, +99, a1.effect);
                var a2 = card.oracle.abilities[1];
                a1.combine(a2);
                card.oracle.abilities = [a1];
            }
        }
        else {
            for (var i = 0; i < abilityCount; i++) {
                var abilityType = Random_1.Random.complex([
                    { value: MtgAbilityType_1.MtgAbilityType.Activated, chance: 0.60 },
                    { value: MtgAbilityType_1.MtgAbilityType.Triggered, chance: 0.20 },
                    { value: MtgAbilityType_1.MtgAbilityType.Static, chance: 0.20 }
                ], 0);
                this.generateArtifactAbility(card, abilityType);
            }
        }
        card.oracle.abilities.sort(function (a, b) { return a.type - b.type; });
    };
    MtgArtifactGenerator.prototype.generateArtifactAbility = function (card, abilityType) {
        switch (abilityType) {
            case MtgAbilityType_1.MtgAbilityType.Activated:
                return this.mtgAbilityService.generateActivatedAbility(card, 0, +99, true, true);
            case MtgAbilityType_1.MtgAbilityType.Triggered:
                return this.mtgAbilityService.generateTriggeredAbility(card, 0, +99);
            case MtgAbilityType_1.MtgAbilityType.Static:
                return this.mtgAbilityService.generateStaticAbility(card, 0, +99);
        }
    };
    MtgArtifactGenerator.prototype.chooseFlavorText = function (card) {
        if (Random_1.Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            var maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            var smallEnoughFlavorText = this.mtgDataRepository.getArtifactFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                var flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine);
                flavorTextLines.forEach(function (f) { return card.wrappedOracleLines.push("FT_" + f); });
            }
        }
    };
    return MtgArtifactGenerator;
}(MtgBaseGenerator_1.MtgBaseGenerator));
exports.MtgArtifactGenerator = MtgArtifactGenerator;
//# sourceMappingURL=MtgArtifactGenerator.js.map