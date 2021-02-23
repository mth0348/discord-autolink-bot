"use strict";
exports.__esModule = true;
exports.MtgDataRepository = void 0;
var Random_1 = require("../../helpers/Random");
var StringHelper_1 = require("../../helpers/StringHelper");
var MtgKeyword_1 = require("../entities/mtg/MtgKeyword");
var MtgPermanentCondition_1 = require("../entities/mtg/MtgPermanentCondition");
var MtgPermanentEvent_1 = require("../entities/mtg/MtgPermanentEvent");
var MtgPermanentStatics_1 = require("../entities/mtg/MtgPermanentStatics");
var MtgPermanentActivatedCost_1 = require("../entities/mtg/MtgPermanentActivatedCost");
var MtgInstantSorceryEvent_1 = require("../entities/mtg/MtgInstantSorceryEvent");
var Logger_1 = require("../../helpers/Logger");
var LogType_1 = require("../../dtos/LogType");
var MtgHelper_1 = require("../../helpers/mtg/MtgHelper");
var MtgCommandParser_1 = require("../../parsers/MtgCommandParser");
var MtgEnchantmentEffect_1 = require("../entities/mtg/MtgEnchantmentEffect");
var database = require("../../src/data/mtg.json");
var MtgDataRepository = (function () {
    function MtgDataRepository() {
    }
    MtgDataRepository.prototype.getTypes = function () {
        return database.types;
    };
    MtgDataRepository.prototype.getPermanentTypes = function () {
        return database.permanentTypes;
    };
    MtgDataRepository.prototype.getSubtypes = function (count) {
        if (count <= 0)
            return [];
        var list = database.subtypes;
        var result = [Random_1.Random.nextFromList(list)];
        for (var i = 1; i < count - 1; i++) {
            var second = Random_1.Random.nextFromList(list.filter(function (f) { return result.every(function (r) { return f !== r; }); }));
            result.push(second);
        }
        return result;
    };
    MtgDataRepository.prototype.getArtifactCreatureSubtype = function () {
        return Random_1.Random.nextFromList(database.subtypesArtifactCreatures);
    };
    MtgDataRepository.prototype.getKeywordsByColorAndType = function (colorColors, type, count, simpleOnly) {
        if (simpleOnly === void 0) { simpleOnly = false; }
        if (count <= 0)
            return [];
        var colors = this.getColors(colorColors);
        var list = database.keywords
            .filter(function (k) { return k.types.some(function (t) { return t === type.toLowerCase(); }); })
            .filter(function (k) { return colors.some(function (c) { return k.colorIdentity.indexOf(c) >= 0; }); })
            .filter(function (k) { return !simpleOnly || (!k.hasCost && k.nameExtension.length === 0 && (k.excludeFromSimple === undefined || !k.excludeFromSimple)); })
            .map(function (k) { return new MtgKeyword_1.MtgKeyword(k); });
        if (list.length <= 0) {
            Logger_1.Logger.log("No keyword found for { colors:" + colors + ", type:" + type + ", count:" + count + ", simpleOnly:" + simpleOnly + " }", LogType_1.LogType.Warning);
            return [];
        }
        var result = [Random_1.Random.nextFromList(list)];
        for (var i = 1; i < count - 1; i++) {
            var reducedList = list.filter(function (f) { return result.every(function (r) { return f !== r; }); });
            if (reducedList.length > 0) {
                var second = Random_1.Random.nextFromList(reducedList);
                result.push(second);
            }
        }
        return result;
    };
    MtgDataRepository.prototype.getPermanentConditions = function () {
        return database.permanentConditions.map(function (x) { return new MtgPermanentCondition_1.MtgPermanentCondition(x); });
    };
    MtgDataRepository.prototype.getPermanentEvents = function () {
        return database.permanentEvents.map(function (x) { return new MtgPermanentEvent_1.MtgPermanentEvent(x); });
    };
    MtgDataRepository.prototype.getPermanentStatics = function () {
        return database.permanentStatics.map(function (x) { return new MtgPermanentStatics_1.MtgPermanentStatics(x); });
    };
    MtgDataRepository.prototype.getPermanentActivatedCosts = function () {
        return database.permanentActivatedCosts.map(function (x) { return new MtgPermanentActivatedCost_1.MtgPermanentActivatedCost(x); });
    };
    MtgDataRepository.prototype.getInstantSorceryEvents = function () {
        return database.instantSorceryEvents.map(function (x) { return new MtgInstantSorceryEvent_1.MtgInstantSorceryEvent(x); });
    };
    MtgDataRepository.prototype.getEnchantmentEffects = function () {
        return database.enchantmentEffects.map(function (x) { return new MtgEnchantmentEffect_1.MtgEnchantmentEffect(x); });
    };
    MtgDataRepository.prototype.getCreatureName = function (isLegendary) {
        var name = Random_1.Random.nextFromList(database.creatureTexts.names) + ", ";
        var adjective = Random_1.Random.nextFromList(database.creatureTexts.adjectives) + " ";
        var noun = Random_1.Random.nextFromList(database.creatureTexts.nouns);
        if (isLegendary) {
            if (Random_1.Random.chance(0.3)) {
                return StringHelper_1.StringHelper.toCamelCase(name + "the " + adjective);
            }
            return StringHelper_1.StringHelper.toCamelCase(name + adjective + noun);
        }
        else {
            return StringHelper_1.StringHelper.toCamelCase(adjective + noun);
        }
    };
    MtgDataRepository.prototype.getLandName = function (isLegendary) {
        var name = Random_1.Random.nextFromList(database.landTexts.names) + ", ";
        var adjective = Random_1.Random.nextFromList(database.landTexts.adjectives) + " ";
        var noun = Random_1.Random.nextFromList(database.landTexts.nouns);
        var descriptor = Random_1.Random.nextFromList(database.landTexts.descriptors);
        if (isLegendary) {
            return StringHelper_1.StringHelper.toCamelCase(name + adjective + descriptor);
        }
        if (Random_1.Random.chance(0.5)) {
            return StringHelper_1.StringHelper.capitalizeFirstChar(descriptor) + " of " + StringHelper_1.StringHelper.capitalizeFirstChar(noun);
        }
        return StringHelper_1.StringHelper.toCamelCase(adjective + descriptor);
    };
    MtgDataRepository.prototype.getCreatureFlavorText = function (maxCharacterLength) {
        return Random_1.Random.nextFromList(database.creatureTexts.flavors.filter(function (f) { return f.length < maxCharacterLength; }));
    };
    MtgDataRepository.prototype.getLandFlavorText = function (maxCharacterLength) {
        return Random_1.Random.nextFromList(database.landTexts.flavors.filter(function (f) { return f.length < maxCharacterLength; }));
    };
    MtgDataRepository.prototype.getSpellFlavorText = function (maxCharacterLength) {
        return Random_1.Random.nextFromList(database.spellTexts.flavors.filter(function (f) { return f.length < maxCharacterLength; }));
    };
    MtgDataRepository.prototype.getArtifactFlavorText = function (maxCharacterLength) {
        return Random_1.Random.nextFromList(database.artifactTexts.flavors.filter(function (f) { return f.length < maxCharacterLength; }));
    };
    MtgDataRepository.prototype.getArtifactName = function (isLegendary, isEquipment) {
        var nouns = Random_1.Random.nextFromList(database.landTexts.nouns);
        var adjectives = Random_1.Random.nextFromList(database.artifactTexts.adjectives) + " ";
        var equipmentDescriptor = Random_1.Random.nextFromList(database.artifactTexts.equipmentDescriptors);
        var artifactDescriptor = Random_1.Random.nextFromList(database.artifactTexts.artifactDescriptors);
        if (isEquipment) {
            if (isLegendary) {
                var name_1 = Random_1.Random.nextFromList(database.artifactTexts.names) + ", ";
                return StringHelper_1.StringHelper.toCamelCase(name_1 + adjectives + equipmentDescriptor);
            }
            else {
                if (Random_1.Random.chance(0.5)) {
                    return StringHelper_1.StringHelper.capitalizeFirstChar(equipmentDescriptor) + " of " + StringHelper_1.StringHelper.capitalizeFirstChar(nouns);
                }
                return StringHelper_1.StringHelper.toCamelCase(adjectives + equipmentDescriptor);
            }
        }
        if (Random_1.Random.chance(0.5)) {
            return StringHelper_1.StringHelper.capitalizeFirstChar(artifactDescriptor) + " of " + StringHelper_1.StringHelper.capitalizeFirstChar(nouns);
        }
        return StringHelper_1.StringHelper.toCamelCase(adjectives + artifactDescriptor);
    };
    MtgDataRepository.prototype.getPlaneswalkerName = function () {
        var name = Random_1.Random.nextFromList(database.planeswalkerTexts.names) + ", ";
        var secondName = Random_1.Random.nextFromList(database.planeswalkerTexts.names) + " ";
        var adjective = Random_1.Random.nextFromList(database.creatureTexts.adjectives) + " ";
        var noun = Random_1.Random.nextFromList(database.creatureTexts.nouns);
        if (Random_1.Random.chance(0.3)) {
            return StringHelper_1.StringHelper.toCamelCase(name + "the " + adjective);
        }
        if (Random_1.Random.chance(0.3)) {
            return StringHelper_1.StringHelper.toCamelCase(name + secondName);
        }
        return StringHelper_1.StringHelper.toCamelCase(name + adjective + noun);
    };
    MtgDataRepository.prototype.getInstantSorceryName = function () {
        var adjective = Random_1.Random.nextFromList(database.spellTexts.adjectives) + " ";
        var noun = Random_1.Random.nextFromList(database.spellTexts.nouns);
        return StringHelper_1.StringHelper.toCamelCase(adjective + noun);
    };
    MtgDataRepository.prototype.getEnchantmentName = function () {
        var adjective = Random_1.Random.nextFromList(database.spellTexts.adjectives) + " ";
        var noun = Random_1.Random.nextFromList(database.enchantmentTexts.nouns);
        return StringHelper_1.StringHelper.toCamelCase(adjective + noun);
    };
    MtgDataRepository.prototype.getColors = function (cardColors) {
        return MtgHelper_1.MtgHelper.isExactlyColor(cardColors, "c") ? MtgCommandParser_1.MtgCommandParser.BASIC_COLORS.map(function (c) { return c; }) : cardColors.split('');
    };
    return MtgDataRepository;
}());
exports.MtgDataRepository = MtgDataRepository;
//# sourceMappingURL=MtgDataRepository.js.map