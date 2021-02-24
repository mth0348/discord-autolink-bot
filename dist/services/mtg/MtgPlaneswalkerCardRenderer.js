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
exports.MtgPlaneswalkerCardRenderer = void 0;
var MtgCardType_1 = require("../../dtos/mtg/MtgCardType");
var discord_js_1 = require("discord.js");
var ImageProvider_1 = require("../../persistence/repositories/ImageProvider");
var Constants_1 = require("../../helpers/Constants");
var StringHelper_1 = require("../../helpers/StringHelper");
var Random_1 = require("../../helpers/Random");
var MtgHelper_1 = require("../../helpers/mtg/MtgHelper");
var MtgCardRenderer_1 = require("./MtgCardRenderer");
var Canvas = require("canvas");
var MtgPlaneswalkerCardRenderer = (function () {
    function MtgPlaneswalkerCardRenderer(card) {
        this.card = card;
        this.canvas = Canvas.createCanvas(630, 880);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = '#000000';
    }
    MtgPlaneswalkerCardRenderer.prototype.renderCard = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attachment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.fillBlack();
                        return [4, this.drawCardArtwork()];
                    case 1:
                        _a.sent();
                        return [4, this.drawLineSeparator()];
                    case 2:
                        _a.sent();
                        this.drawCardBorder();
                        this.drawCardTitle();
                        return [4, this.drawCardCost()];
                    case 3:
                        _a.sent();
                        this.drawCardType();
                        this.drawExpansionSymbol();
                        return [4, this.drawOracleText()];
                    case 4:
                        _a.sent();
                        this.drawStartingLoyalty();
                        this.drawCardNumber();
                        attachment = new discord_js_1.MessageAttachment(this.canvas.toBuffer(), this.card.name + '.png');
                        return [2, attachment];
                }
            });
        });
    };
    MtgPlaneswalkerCardRenderer.prototype.drawLineSeparator = function () {
        return __awaiter(this, void 0, void 0, function () {
            var spearator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Canvas.loadImage("assets/img/mtg/pw_separator.png")];
                    case 1:
                        spearator = _a.sent();
                        this.ctx.drawImage(spearator, 10, 615, 610, 120);
                        return [2];
                }
            });
        });
    };
    MtgPlaneswalkerCardRenderer.prototype.fillBlack = function () {
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    MtgPlaneswalkerCardRenderer.prototype.drawCardBorder = function () {
        var colorMapping = this.card.color.length <= 2 ? MtgHelper_1.MtgHelper.sortWubrg(this.card.color) : "m";
        var fileName = "IMAGEURL_BORDER_" + colorMapping + "_PLANESWALKER";
        var cardImageUrl = Constants_1.Resources.MtgImageUrls.find(function (s) { return StringHelper_1.StringHelper.isEqualIgnoreCase(s.name, fileName); });
        var cardImage = ImageProvider_1.ImageProvider.getImage(cardImageUrl.path);
        this.ctx.drawImage(cardImage, 0, 0, this.canvas.width, this.canvas.height);
    };
    MtgPlaneswalkerCardRenderer.prototype.drawCardTitle = function () {
        var cardTitle = this.card.name;
        this.ctx.font = (cardTitle.length > 25 ? 34 : 38) + "px matrixbold";
        var offsetRight = 0;
        if (this.card.manacost.length > 0) {
            offsetRight = this.card.manacost.length * 17;
        }
        this.ctx.fillText(cardTitle, 52, 65, 520 - offsetRight);
    };
    MtgPlaneswalkerCardRenderer.prototype.drawCardCost = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.overlayManacostSymbols(this.card.manacost, 17, 32, 577 - (this.card.manacost.length * 16), 64)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    MtgPlaneswalkerCardRenderer.prototype.drawCardType = function () {
        this.ctx.font = '34px matrixbold';
        this.ctx.fillText(this.card.getFullType(), 52, 530, 490);
    };
    MtgPlaneswalkerCardRenderer.prototype.drawCardArtwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var artwork;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Canvas.loadImage(this.card.imageUrl)];
                    case 1:
                        artwork = _a.sent();
                        this.drawImageProp(artwork, 20, 20, this.canvas.width - 40, this.canvas.height - 40, 0.5, 0.2);
                        return [2];
                }
            });
        });
    };
    MtgPlaneswalkerCardRenderer.prototype.drawExpansionSymbol = function () {
        var expansionSymbol = ImageProvider_1.ImageProvider.getImage("assets/img/mtg/expansion/" + this.card.rarity.toString() + ".png");
        this.ctx.drawImage(expansionSymbol, 545, 502, 35, 35);
    };
    MtgPlaneswalkerCardRenderer.prototype.drawCardNumber = function () {
        this.ctx.font = "$14px mplantin";
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(Random_1.Random.next(100, 999).toString(), 37, 833);
    };
    MtgPlaneswalkerCardRenderer.prototype.drawOracleText = function () {
        return __awaiter(this, void 0, void 0, function () {
            var preset, oracleLines, posX, posY, singleLineOffset, lineHeight, i, activatedAbility, cost, isUp, pwSymbolImage, line1, line2, line3, blockOffset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        preset = this.card.rendererPreset;
                        oracleLines = this.card.wrappedOracleLines;
                        this.ctx.fillStyle = '#FFFFFF';
                        this.ctx.font = preset.fontSize + "px mplantin";
                        posX = 100;
                        posY = 557;
                        singleLineOffset = preset.fontSize + preset.lineDifInPixel;
                        lineHeight = 3 * singleLineOffset;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 3)) return [3, 8];
                        activatedAbility = this.card.oracle.abilities[i];
                        cost = activatedAbility.cost;
                        isUp = parseInt(cost.text) > 0;
                        pwSymbolImage = ImageProvider_1.ImageProvider.getImage("assets/img/mtg/symbols/mtg_pw_" + (isUp ? 'up' : 'down') + ".png");
                        this.ctx.drawImage(pwSymbolImage, 25, 570 + (i * (lineHeight + 2)), 75, 52);
                        this.ctx.fillStyle = '#FFFFFF';
                        this.ctx.font = "28px mplantinbold";
                        this.ctx.fillText(cost.text, 25 + (isUp ? 21 : 25), 570 + (i * (lineHeight + 2)) + (isUp ? 36 : 34));
                        this.ctx.fillStyle = '#000000';
                        this.ctx.font = preset.fontSize + "px mplantin";
                        line1 = oracleLines[i * 3 + 0];
                        line2 = oracleLines[i * 3 + 1];
                        line3 = oracleLines[i * 3 + 2];
                        blockOffset = i * lineHeight;
                        if (line2 === "" && line3 === "") {
                            blockOffset += singleLineOffset / 1.25;
                        }
                        else if (line3 === "") {
                            blockOffset += singleLineOffset / 4;
                        }
                        if (!(line1 !== "")) return [3, 3];
                        return [4, this.drawOracleTextLine(line1, posX, posY + blockOffset + singleLineOffset, preset)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!(line2 !== "")) return [3, 5];
                        return [4, this.drawOracleTextLine(line2, posX, posY + blockOffset + singleLineOffset * 2, preset)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!(line3 !== "")) return [3, 7];
                        return [4, this.drawOracleTextLine(line3, posX, posY + blockOffset + singleLineOffset * 3, preset)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3, 1];
                    case 8:
                        this.ctx.fillStyle = '#000000';
                        return [2];
                }
            });
        });
    };
    MtgPlaneswalkerCardRenderer.prototype.drawStartingLoyalty = function () {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = "32px mplantinbold";
        this.ctx.fillText(this.card.startingLoyalty.toString(), 545, 816);
    };
    MtgPlaneswalkerCardRenderer.prototype.drawOracleTextLine = function (line, posX, posY, preset) {
        return __awaiter(this, void 0, void 0, function () {
            var lineWithoutSymbols;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lineWithoutSymbols = line.replace(MtgCardRenderer_1.MtgCardRenderer.MANASYMBOL_PATTERN, "    ");
                        this.ctx.fillText(lineWithoutSymbols, posX, posY, 470);
                        return [4, this.overlaySymbols(lineWithoutSymbols, line, preset.fontSize, posX, posY)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    MtgPlaneswalkerCardRenderer.prototype.overlaySymbols = function (lineWithoutSymbols, line, size, positionX, positionY) {
        return __awaiter(this, void 0, void 0, function () {
            var match, timesFound, i, measuredTextSoFar, relativePosX, s, symbol;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timesFound = 0;
                        _a.label = 1;
                    case 1:
                        if (!(match = MtgCardRenderer_1.MtgCardRenderer.MANASYMBOL_PATTERN.exec(line))) return [3, 3];
                        i = match.index;
                        measuredTextSoFar = this.ctx.measureText(lineWithoutSymbols.substring(0, i + timesFound));
                        relativePosX = measuredTextSoFar.width;
                        timesFound += 2;
                        s = line.substring(i + 1, i + 2).toUpperCase();
                        return [4, Canvas.loadImage("assets/img/mtg/symbols/mtg_" + s + ".png")];
                    case 2:
                        symbol = _a.sent();
                        this.ctx.drawImage(symbol, positionX + relativePosX, positionY + 5 - size, size, size);
                        return [3, 1];
                    case 3: return [2];
                }
            });
        });
    };
    MtgPlaneswalkerCardRenderer.prototype.overlayManacostSymbols = function (text, gap, size, positionX, positionY) {
        return __awaiter(this, void 0, void 0, function () {
            var i, shadowSymbol, s, symbol;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = StringHelper_1.StringHelper.regexIndexOf(text, /X[^\s]{1}/g);
                        _a.label = 1;
                    case 1:
                        if (!(i >= 0)) return [3, 4];
                        return [4, Canvas.loadImage("assets/img/mtg/symbols/mtg_Shadow.png")];
                    case 2:
                        shadowSymbol = _a.sent();
                        this.ctx.drawImage(shadowSymbol, positionX + i * gap, positionY + 9 - size, size, size);
                        s = text.substring(i + 1, i + 2).toUpperCase();
                        return [4, Canvas.loadImage("assets/img/mtg/symbols/mtg_" + s + ".png")];
                    case 3:
                        symbol = _a.sent();
                        this.ctx.drawImage(symbol, positionX + i * gap, positionY + 5 - size, size, size);
                        i = StringHelper_1.StringHelper.regexIndexOf(text, /X[^\s]{1}/g, i + 1);
                        return [3, 1];
                    case 4: return [2];
                }
            });
        });
    };
    MtgPlaneswalkerCardRenderer.prototype.drawImageProp = function (img, x, y, w, h, offsetX, offsetY) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (w === void 0) { w = this.canvas.width; }
        if (h === void 0) { h = this.canvas.height; }
        if (offsetX === void 0) { offsetX = 0; }
        if (offsetY === void 0) { offsetY = 0; }
        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;
        if (offsetX < 0)
            offsetX = 0;
        if (offsetY < 0)
            offsetY = 0;
        if (offsetX > 1)
            offsetX = 1;
        if (offsetY > 1)
            offsetY = 1;
        var iw = img.width, ih = img.height, r = Math.min(w / iw, h / ih), nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;
        if (nw < w)
            ar = w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < h)
            ar = h / nh;
        nw *= ar;
        nh *= ar;
        cw = iw / (nw / w);
        ch = ih / (nh / h);
        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;
        if (cx < 0)
            cx = 0;
        if (cy < 0)
            cy = 0;
        if (cw > iw)
            cw = iw;
        if (ch > ih)
            ch = ih;
        this.ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    };
    MtgPlaneswalkerCardRenderer.prototype.getTypeFileSuffix = function () {
        switch (this.card.type) {
            case MtgCardType_1.MtgCardType.Creature:
                return "_CREATURE";
            case MtgCardType_1.MtgCardType.Land:
                return "_LAND";
            case MtgCardType_1.MtgCardType.Planeswalker:
                return "_PLANESWALKER";
        }
        return "";
    };
    return MtgPlaneswalkerCardRenderer;
}());
exports.MtgPlaneswalkerCardRenderer = MtgPlaneswalkerCardRenderer;
//# sourceMappingURL=MtgPlaneswalkerCardRenderer.js.map