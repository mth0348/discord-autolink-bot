"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.MtgHelper = void 0;
var discord_js_1 = require("discord.js");
var MtgCardType_1 = require("../../dtos/mtg/MtgCardType");
var Random_1 = require("../Random");
var StringHelper_1 = require("../StringHelper");
var Logger_1 = require("../Logger");
var LogType_1 = require("../../dtos/LogType");
var MtgHelper = (function () {
    function MtgHelper() {
    }
    MtgHelper.sortWubrg = function (text) {
        var lut = this.standardSortLUT;
        if (this.isExactlyColor(text, "br")
            || this.isExactlyColor(text, "gw")
            || this.isExactlyColor(text, "rw")
            || this.isExactlyColor(text, "rgw")
            || this.isExactlyColor(text, "rgwu")
            || this.isExactlyColor(text, "brgw"))
            lut = this.brgwuSortLUT;
        if (this.isExactlyColor(text, "gu")
            || this.isExactlyColor(text, "wu")
            || this.isExactlyColor(text, "gwu")
            || this.isExactlyColor(text, "rwb")
            || this.isExactlyColor(text, "gwub"))
            lut = this.rgwubSortLUT;
        if (this.isExactlyColor(text, "bgu")
            || this.isExactlyColor(text, "gur")
            || this.isExactlyColor(text, "urw"))
            lut = this.bgurwSortLUT;
        return text.split('').sort(function (a, b) { return lut.get(a) - lut.get(b); }).join("");
    };
    MtgHelper.isExactlyColor = function (text, color) {
        var i = StringHelper_1.StringHelper.regexIndexOf(color, new RegExp("^[d" + text + "]+$"));
        return i === 0;
    };
    MtgHelper.getManacost = function (cmc, colorString) {
        var manacost = this.getRandomManacostWithoutX(cmc, colorString);
        return "X" + MtgHelper.sortWubrg(manacost).split("").join("X");
    };
    MtgHelper.getDominantColor = function (card, maxCount) {
        if (MtgHelper.isExactlyColor(card.color, "c"))
            return card.color;
        var colorIdentities = card.color + card.color;
        card.oracle.keywords.forEach(function (k) { return colorIdentities += k.colorIdentity; });
        card.oracle.abilities.forEach(function (k) { return colorIdentities += k.getColorIdentity(); });
        colorIdentities = colorIdentities;
        var colorCount = [{ c: "w", count: 0 }, { c: "u", count: 0 }, { c: "b", count: 0 }, { c: "r", count: 0 }, { c: "g", count: 0 }];
        colorCount[0].count = colorIdentities.split("").filter(function (c) { return c === "w"; }).length;
        colorCount[1].count = colorIdentities.split("").filter(function (c) { return c === "u"; }).length;
        colorCount[2].count = colorIdentities.split("").filter(function (c) { return c === "b"; }).length;
        colorCount[3].count = colorIdentities.split("").filter(function (c) { return c === "r"; }).length;
        colorCount[4].count = colorIdentities.split("").filter(function (c) { return c === "g"; }).length;
        colorCount = colorCount.filter(function (c) { return c.count > 0; }).sort(function (a, b) { return b.count - a.count; });
        Logger_1.Logger.log("Color identities: " + colorIdentities, LogType_1.LogType.Colors);
        Logger_1.Logger.log("Color chart: [ " + colorCount.map(function (x) { return "{" + x.c + " (" + x.count + ")"; }).join(", ") + " ]", LogType_1.LogType.Colors);
        Logger_1.Logger.log("Card colors: " + card.color.length, LogType_1.LogType.Colors);
        Logger_1.Logger.log("Color max count: " + maxCount, LogType_1.LogType.Colors);
        var takeThreshold = card.type === MtgCardType_1.MtgCardType.Planeswalker ? 3 : 2;
        var diff = card.color.length < colorCount.length ? Math.abs(colorCount[0].count - colorCount[card.color.length].count) : 0;
        var take = Math.min(card.color.length + (diff < takeThreshold ? 1 : 0), Math.min(maxCount, colorCount.length));
        Logger_1.Logger.log("Color max take: " + take, LogType_1.LogType.Colors);
        var topColors = colorCount.slice(0, take).map(function (c) { return c.c; }).join("");
        Logger_1.Logger.log("Final pick: " + topColors, LogType_1.LogType.Colors);
        return topColors;
    };
    MtgHelper.getRandomManacostWithoutX = function (cmc, colorString) {
        if (colorString.length === 0 || colorString.toLowerCase() === "c") {
            return "" + Math.min(9, cmc);
        }
        var manacost = "";
        var color = colorString.split("");
        if (color.length === 1) {
            if (cmc === 1) {
                manacost = "" + color[0];
            }
            else if (cmc === 2) {
                var twoSymbols = Random_1.Random.flipCoin();
                if (twoSymbols) {
                    manacost = "" + color[0] + color[0];
                }
                else {
                    manacost = "" + Math.min(9, cmc - 1) + color[0];
                }
            }
            else if (cmc === 3) {
                var threeSymbols = Random_1.Random.chance(0.25);
                if (threeSymbols) {
                    return "" + color[0] + color[0] + color[0];
                }
                var twoSymbols = Random_1.Random.flipCoin();
                if (twoSymbols)
                    return "1" + color[0] + color[0];
                return "2" + color[0];
            }
            else if (cmc > 3) {
                var twoSymbols = Random_1.Random.flipCoin();
                if (twoSymbols)
                    return "" + Math.min(9, cmc - 2) + color[0] + color[0];
                var threeSymbols = Random_1.Random.chance(0.25);
                if (threeSymbols && cmc > 2)
                    return "" + Math.min(9, cmc - 3) + color[0] + color[0] + color[0];
                manacost = "" + Math.min(9, cmc - 1) + color[0];
            }
        }
        if (color.length === 2) {
            if (cmc === 1) {
                manacost = "" + color[Random_1.Random.next(0, 1)];
            }
            else if (cmc === 2) {
                manacost = "" + color[0] + color[1];
            }
            else if (cmc === 3) {
                var threeSymbols = Random_1.Random.next(0, 2);
                switch (threeSymbols) {
                    case 0:
                        manacost = "1" + color[0] + color[1];
                        break;
                    case 1:
                        manacost = "" + color[0] + color[0] + color[1];
                        break;
                    case 2:
                        manacost = "" + color[0] + color[1] + color[1];
                        break;
                }
            }
            else if (cmc > 3) {
                var fourSymbols = Random_1.Random.next(0, 3);
                switch (fourSymbols) {
                    case 0:
                        manacost = "" + Math.min(9, cmc - 2) + color[0] + color[1];
                        break;
                    case 1:
                        manacost = "" + Math.min(9, cmc - 3) + color[0] + color[0] + color[1];
                        break;
                    case 2:
                        manacost = "" + Math.min(9, cmc - 3) + color[0] + color[1] + color[1];
                        break;
                    case 3:
                        manacost = "" + color[0] + color[0] + color[1] + color[1];
                        if (cmc > 4) {
                            manacost = "" + Math.min(9, cmc - 4) + manacost;
                        }
                        break;
                }
            }
        }
        if (color.length === 3) {
            if (cmc === 1) {
                manacost = "" + Random_1.Random.nextFromList(color);
            }
            else if (cmc === 2) {
                var rnd = Random_1.Random.next(0, color.length - 2);
                manacost = "" + color[rnd] + color[rnd + 1];
            }
            else if (cmc === 3) {
                manacost = "" + color[0] + color[1] + color[2];
            }
            else if (cmc > 3) {
                manacost = "" + Math.min(9, cmc - 3) + color[0] + color[1] + color[2];
            }
        }
        if (color.length === 4) {
            if (cmc === 1) {
                manacost = "" + Random_1.Random.nextFromList(color);
            }
            else if (cmc === 2) {
                var rnd = Random_1.Random.next(0, 2);
                manacost = "" + color[rnd] + color[rnd + 1];
            }
            else if (cmc === 3) {
                var rnd = Random_1.Random.next(0, 1);
                manacost = "" + color[rnd] + color[rnd + 1] + color[rnd + 2];
            }
            else if (cmc === 4) {
                manacost = "" + color[0] + color[1] + color[2] + color[3];
            }
            else if (cmc > 4) {
                manacost = "" + Math.min(9, cmc - 4) + color[0] + color[1] + color[2] + color[3];
            }
        }
        if (color.length === 5) {
            if (cmc === 1) {
                manacost = "" + Random_1.Random.nextFromList(color);
            }
            else if (cmc === 2) {
                var rnd = Random_1.Random.next(0, 3);
                manacost = "" + color[rnd] + color[rnd + 1];
            }
            else if (cmc === 3) {
                var rnd = Random_1.Random.next(0, 2);
                manacost = "" + color[rnd] + color[rnd + 1] + color[rnd + 2];
            }
            else if (cmc === 4) {
                var rnd = Random_1.Random.next(0, 1);
                manacost = "" + color[rnd] + color[rnd + 1] + color[rnd + 2] + color[rnd + 3];
            }
            else if (cmc === 5) {
                manacost = "" + color[0] + color[1] + color[2] + color[3] + color[4];
            }
            else if (cmc > 4) {
                manacost = "" + Math.min(9, cmc - 5) + color[0] + color[1] + color[2] + color[3];
            }
        }
        return manacost;
    };
    MtgHelper.numberSortLUT = [
        ["0", 0],
        ["1", 1],
        ["2", 2],
        ["3", 3],
        ["4", 4],
        ["5", 5],
        ["6", 6],
        ["7", 7],
        ["8", 8],
        ["9", 9],
    ];
    MtgHelper.standardSortLUT = new discord_js_1.Collection(__spreadArrays(MtgHelper.numberSortLUT, [
        ["w", 10],
        ["u", 11],
        ["b", 12],
        ["r", 13],
        ["g", 14],
    ]));
    MtgHelper.brgwuSortLUT = new discord_js_1.Collection(__spreadArrays(MtgHelper.numberSortLUT, [
        ["b", 10],
        ["r", 11],
        ["g", 12],
        ["w", 13],
        ["u", 14],
    ]));
    MtgHelper.rgwubSortLUT = new discord_js_1.Collection(__spreadArrays(MtgHelper.numberSortLUT, [
        ["r", 10],
        ["g", 11],
        ["w", 12],
        ["u", 13],
        ["b", 14],
    ]));
    MtgHelper.bgurwSortLUT = new discord_js_1.Collection(__spreadArrays(MtgHelper.numberSortLUT, [
        ["b", 10],
        ["g", 11],
        ["u", 12],
        ["r", 13],
        ["w", 14],
    ]));
    return MtgHelper;
}());
exports.MtgHelper = MtgHelper;
//# sourceMappingURL=MtgHelper.js.map