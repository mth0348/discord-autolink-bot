"use strict";
exports.__esModule = true;
exports.MtgOracleTextWrapperService = void 0;
var MtgOracleTextWrapperService = (function () {
    function MtgOracleTextWrapperService() {
        this.presets = [
            MtgOracleTextWrapperService.PRESET_LARGE,
            MtgOracleTextWrapperService.PRESET_MEDIUM,
            MtgOracleTextWrapperService.PRESET_SMALL,
            MtgOracleTextWrapperService.PRESET_TINY,
        ];
    }
    MtgOracleTextWrapperService.prototype.calculatePlaneswalkerTextWrapPreset = function (oracle) {
        var _this = this;
        var okPreset = null;
        this.presets.forEach(function (preset) {
            var wrappedOracle = _this.wordWrapAllPlaneswalkerOracleText(oracle, preset.maxCharactersPerLine - 4);
            if (okPreset == null && wrappedOracle.length <= 9) {
                okPreset = preset;
            }
        });
        if (okPreset === null) {
            okPreset = MtgOracleTextWrapperService.PRESET_TINY;
        }
        return okPreset;
    };
    MtgOracleTextWrapperService.prototype.calculateTextWrapPreset = function (oracle) {
        var _this = this;
        var okPreset = null;
        this.presets.forEach(function (preset) {
            var wrappedOracle = _this.wordWrapAllOracleText(oracle, preset);
            if (okPreset == null && wrappedOracle.length <= preset.maxLines) {
                okPreset = preset;
            }
        });
        if (okPreset === null) {
            okPreset = MtgOracleTextWrapperService.PRESET_TINY;
        }
        return okPreset;
    };
    MtgOracleTextWrapperService.prototype.wordWrapAllOracleText = function (oracle, preset) {
        var lines = [];
        if (oracle.keywords.some(function (k) { return k.isTop; })) {
            var nameExtendedKeywords = oracle.keywords.filter(function (k) { return k.isTop && k.nameExtension.length > 0; }).map(function (k) { return k.parsedText; });
            nameExtendedKeywords.forEach(function (line) { lines.push(line.trim()); });
            if (nameExtendedKeywords.length > 0) {
                lines.push("");
            }
            var regularKeywords = oracle.keywords.filter(function (k) { return k.isTop && k.nameExtension.length === 0; }).map(function (k) { return k.parsedText; }).join(", ");
            if (regularKeywords.length > 0) {
                lines.push(regularKeywords.trim());
                lines.push("");
            }
        }
        if (oracle.abilities.length > 0) {
            var abilityText = oracle.abilities[0].parsedText;
            var ability1Lines = this.wordWrapText(abilityText, preset.maxCharactersPerLine);
            ability1Lines.forEach(function (line) { return lines.push(line.trim()); });
            lines.push("");
            if (oracle.abilities.length > 1) {
                for (var i = 1; i < oracle.abilities.length; i++) {
                    var ability2Text = oracle.abilities[i].parsedText;
                    var ability2Lines = this.wordWrapText(ability2Text, preset.maxCharactersPerLine);
                    ability2Lines.forEach(function (line) { return lines.push(line.trim()); });
                    lines.push("");
                }
            }
        }
        if (oracle.keywords.some(function (k) { return !k.isTop; })) {
            var keywordsWithCost = oracle.keywords.filter(function (k) { return !k.isTop; }).map(function (k) { return k.parsedText; });
            if (keywordsWithCost.length === 1) {
                lines.push(keywordsWithCost[0]);
            }
        }
        if (lines.length > 0 && lines[lines.length - 1] === "")
            lines.splice(lines.length - 1, 1);
        return lines;
    };
    MtgOracleTextWrapperService.prototype.wordWrapAllPlaneswalkerOracleText = function (oracle, maxCharactersPerLine) {
        var lines = [];
        for (var i = 0; i < oracle.abilities.length; i++) {
            var abilityText = oracle.abilities[i].parsedText;
            var abilityLines = this.wordWrapText(abilityText, maxCharactersPerLine);
            if (abilityLines.length === 1) {
                lines.push(abilityLines[0].trim());
                lines.push("");
                lines.push("");
            }
            else if (abilityLines.length === 2) {
                lines.push(abilityLines[0].trim());
                lines.push(abilityLines[1].trim());
                lines.push("");
            }
            else {
                abilityLines.forEach(function (line) { return lines.push(line.trim()); });
            }
        }
        return lines;
    };
    MtgOracleTextWrapperService.prototype.wordWrapText = function (text, maxCharactersPerLine) {
        var lines = [];
        if (text !== undefined && text.length > 0) {
            var remainingWords = text.split(" ");
            while (remainingWords.length > 0) {
                var nextWordLength = 0;
                var line = "";
                do {
                    line += remainingWords[0] + " ";
                    remainingWords.splice(0, 1);
                    nextWordLength = line.length + (remainingWords.length > 0 ? remainingWords[0].length : 0);
                } while (nextWordLength < maxCharactersPerLine && remainingWords.length > 0);
                lines.push(line);
            }
        }
        return lines;
    };
    MtgOracleTextWrapperService.PRESET_LARGE = { fontSize: 28, maxCharactersPerLine: 41, maxLines: 7, lineDifInPixel: 4 };
    MtgOracleTextWrapperService.PRESET_MEDIUM = { fontSize: 26, maxCharactersPerLine: 44, maxLines: 8, lineDifInPixel: 5 };
    MtgOracleTextWrapperService.PRESET_SMALL = { fontSize: 24, maxCharactersPerLine: 48, maxLines: 9, lineDifInPixel: 4 };
    MtgOracleTextWrapperService.PRESET_TINY = { fontSize: 22, maxCharactersPerLine: 52, maxLines: 10, lineDifInPixel: 4 };
    return MtgOracleTextWrapperService;
}());
exports.MtgOracleTextWrapperService = MtgOracleTextWrapperService;
//# sourceMappingURL=MtgOracleTextWrapperService.js.map