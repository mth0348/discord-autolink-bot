import { MtgCard } from "../../dtos/mtg/MtgCard";
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MessageAttachment } from "discord.js";
import { ImageProvider } from '../../persistence/repositories/ImageProvider';
import { Resources } from '../../helpers/Constants';
import { StringHelper } from "../../helpers/StringHelper";

import Canvas = require("canvas");
import { Random } from "../../helpers/Random";

export class MtgCardRenderer {

    private canvas: Canvas.Canvas;
    private ctx: Canvas.CanvasRenderingContext2D;
    private card: MtgCard;
    
    private lastWordWrapCount: number;

    constructor(card: MtgCard) {
        this.card = card;

        this.canvas = Canvas.createCanvas(630, 880);
        this.ctx = this.canvas.getContext('2d');

        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = '#000000';
    }

    public async renderCard(): Promise<MessageAttachment> {

        this.fillBlack();
        this.drawCardBorder();
        this.drawCardTitle();
        await this.drawCardCost();
        this.drawCardType();
        await this.drawCardArtwork();
        this.drawExpansionSymbol();
        this.drawOracleText();
        this.drawPowerToughness();
        this.drawCardNumber();

        const attachment = new MessageAttachment(this.canvas.toBuffer(), this.card.name + '.png');
        return attachment;
    }

    private fillBlack() {
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawCardBorder() {
        const colorMapping = this.card.color.length <= 2 ? this.card.color : "m";
        const fileName = `IMAGEURL_BORDER_${colorMapping}${this.card.type === MtgCardType.Creature ? "_CREATURE" : ""}`;

        const cardImageUrl = Resources.MtgImageUrls.find(s => StringHelper.isEqualIgnoreCase(s.name, fileName)).path;
        const cardImage = ImageProvider.getImage(cardImageUrl);

        this.ctx.drawImage(cardImage, 0, 0, this.canvas.width, this.canvas.height);
    }

    private drawCardTitle() {
        const cardTitle = this.card.name;
        this.ctx.font = `${cardTitle.length > 25 ? 34 : 38}px matrixbold`;
        this.ctx.fillText(cardTitle, 55, 78, 585 - (this.card.manacost.length * 17));
    }

    private async drawCardCost() {
        await this.overlaySymbols(this.card.manacost, 17, 32, 577 - (this.card.manacost.length * 16), 76, true);
    }

    private drawCardType() {
        this.ctx.font = '36px matrixbold';
        this.ctx.fillText(this.card.getFullType(), 55, 530, 520);
    }

    private async drawCardArtwork() {
        const artwork = await Canvas.loadImage(this.card.imageUrl);
        this.drawImageProp(artwork, 50, 102, 530, 385, 0.5, 0.2);
    }

    private drawExpansionSymbol() {
        const expansionSymbol = ImageProvider.getImage(`assets/img/mtg/expansion/${this.card.rarity.toString()}.png`);
        this.ctx.drawImage(expansionSymbol, 542, 502, 35, 35);
    }
    
    private drawPowerToughness() {
        if (!this.card.hasPowerToughness()) {
            return;
        }

        const pt = `${this.card.power}/${this.card.toughness}`;
        const offset = pt.length === 3 ? 520 : pt.length === 4 ? 508 : 500;
        this.ctx.font = pt.length > 4 ? '37px mplantinbold' : '38px mplantinbold';
        this.ctx.fillText(pt, offset, 822);
    }

    private drawCardNumber() {
        this.ctx.font = `$14px mplantin`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(Random.next(100, 999).toString(), 38, 833);
    }
    
    private drawOracleText() {
        // let oracleFontSize = 28;
        // let maxCharactersPerLine = 42;
        // let lineOffset = 50;

        // const totalOracleText = ability + secondAbility + keyword;
        // const isLongOracle = totalOracleText.length > 120;
        // const isVeryLongOracle = totalOracleText.length > 220;
        // if (isLongOracle) {
        //     oracleFontSize = 26;
        //     maxCharactersPerLine = 45;
        //     lineOffset = 45;
        // }
        // if (isVeryLongOracle) {
        //     oracleFontSize = 23;
        //     maxCharactersPerLine = 50;
        //     lineOffset = 40;
        // }
        // const gapSize = isLongOracle ? 14 : 16;
        // console.log(totalOracleText.length);

        // ctx.font = `${oracleFontSize}px mplantin`;

        // const wrappedKeywordText = this.wordWrapText(keyword, maxCharactersPerLine);
        // const wrappedAbilityText = this.wordWrapText(ability, maxCharactersPerLine);
        // const abilityWordWrapCount = this.lastWordWrapCount;
        // const wrappedAbility2Text = this.wordWrapText(secondAbility, maxCharactersPerLine);

        // // render oracle text.
        // let offset = 590;
        // if (keyword.length > 0) {
        //     ctx.fillText(wrappedKeywordText, 55, offset, 520);
        //     offset += lineOffset;
        // }
        // ctx.fillText(wrappedAbilityText.replace(/X[^\s]{1}/g, "    "), 55, offset, 520);
        // await this.overlaySymbols(ctx, wrappedAbilityText, gapSize, oracleFontSize, 55, offset);
        
        // offset += lineOffset + (15 * abilityWordWrapCount);
        // ctx.fillText(wrappedAbility2Text.replace(/X[^\s]{1}/g, "    "), 55, offset, 520);
        // await this.overlaySymbols(ctx, wrappedAbility2Text, gapSize, oracleFontSize, 55, offset);
    }

    private async overlaySymbols(text: string, gap: number, size: number, positionX: number, positionY: number, drawShadow: boolean = false) {

        let i = StringHelper.regexIndexOf(text, /X[^\s]{1}/g);
        while (i >= 0) {
            if (drawShadow) {
                const shadowSymbol = await Canvas.loadImage(`assets/img/mtg/symbols/mtg_Shadow.png`);
                this.ctx.drawImage(shadowSymbol, positionX + i * gap, positionY + 9 - size, size, size);
            }

            const s = text.substring(i + 1, i + 2).toUpperCase();
            const symbol = await Canvas.loadImage(`assets/img/mtg/symbols/mtg_${s}.png`);
            this.ctx.drawImage(symbol, positionX + i * gap, positionY + 5 - size, size, size);

            i = StringHelper.regexIndexOf(text, /X[^\s]{1}/g, i + 1);
        }
    }

    private wordWrapText(text: string, maxCharactersPerLine: number) {
        this.lastWordWrapCount = 0;

        let resultString = '';
        let remainingWords = text.split(" ");
        while (remainingWords.length > 0)
        {
            let nextWordLength = 0;
            let line = "";
            do {
                line += remainingWords[0] + " ";
                remainingWords.splice(0, 1);
                nextWordLength = line.length + (remainingWords.length > 0 ? remainingWords[0].length : 0);
            } while (nextWordLength < maxCharactersPerLine && remainingWords.length > 0);
            resultString += line + "\r\n";
            this.lastWordWrapCount++;
        }
        return resultString.trim().substring(0, resultString.length - 2);
    }

    private drawImageProp(img: Canvas.Image, x: number = 0, y: number = 0, w: number = this.canvas.width, h: number = this.canvas.height, offsetX: number = 0, offsetY: number = 0) {

        // default offset is center
        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;

        // keep bounds [0.0, 1.0]
        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;

        var iw = img.width,
            ih = img.height,
            r = Math.min(w / iw, h / ih),
            nw = iw * r,   // new prop. width
            nh = ih * r,   // new prop. height
            cx, cy, cw, ch, ar = 1;

        // decide which gap to fill    
        if (nw < w) ar = w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
        nw *= ar;
        nh *= ar;

        // calc source rectangle
        cw = iw / (nw / w);
        ch = ih / (nh / h);

        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;

        // make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;

        // fill image in dest. rectangle
        this.ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    }
}