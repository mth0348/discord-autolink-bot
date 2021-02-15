import { MtgCard } from "../../dtos/mtg/MtgCard";
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MessageAttachment } from "discord.js";
import { ImageProvider } from '../../persistence/repositories/ImageProvider';
import { Resources } from '../../helpers/Constants';
import { StringHelper } from "../../helpers/StringHelper";

import Canvas = require("canvas");

export class MtgCardRenderer {

    private canvas: Canvas.Canvas;
    private ctx: Canvas.CanvasRenderingContext2D;
    private card: MtgCard;

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

        this.adjustFontSizeForTitle();
        await this.drawCardCost();

        this.adjustFontSizeForType();
        this.drawCardType();

        this.drawCardArtwork();

        const attachment = new MessageAttachment(this.canvas.toBuffer(), this.card.name + '.png');
        return attachment;
    }

    fillBlack() {
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCardBorder() {
        const colorMapping = this.card.color.length <= 2 ? this.card.color : "m";
        const fileName = `${colorMapping}${this.card.type === MtgCardType.Creature ? "_creature" : ""}`;

        const cardImageUrl = Resources.MtgImageUrls.find(s => StringHelper.isEqualIgnoreCase(s.name, fileName)).path;
        const cardImage = ImageProvider.getImage(cardImageUrl);

        this.ctx.drawImage(cardImage, 0, 0, this.canvas.width, this.canvas.height);
    }

    adjustFontSizeForTitle() {
        this.ctx.font = `${this.card.name.length > 25 ? 34 : 38}px matrixbold`;
    }

    drawCardTitle() {
        const cardTitle = this.card.name;
        this.ctx.fillText(cardTitle, 55, 78, 585 - (this.card.manacost.length * 17));
    }

    async drawCardCost() {
        await this.overlaySymbols(this.card.manacost, 17, 32, 577 - (this.card.manacost.length * 16), 76, true);
    }

    adjustFontSizeForType() {
        this.ctx.font = '36px matrixbold';
    }

    drawCardType() {
         this.ctx.fillText(this.card.getFullType(), 55, 530, 520);
    }

    async drawCardArtwork() {
        const artwork = await Canvas.loadImage(this.card.imageUrl);
        this.drawImageProp(artwork, 50, 102, 530, 385, 0.5, 0.2);
    }
    /* 
    
    
            // render expansion symbol.
            const symbolFileName = ["common", "uncommon", "rare", "mythic"][rarity - 1];
            const expansionSymbol = await Canvas.loadImage(`src/assets/img/expansion/${symbolFileName}.png`);
            ctx.drawImage(expansionSymbol, 542, 502, 35, 35);
    
            let oracleFontSize = 28;
            let maxCharactersPerLine = 42;
            let lineOffset = 50;
    
            const totalOracleText = ability + secondAbility + keyword;
            const isLongOracle = totalOracleText.length > 120;
            const isVeryLongOracle = totalOracleText.length > 220;
            if (isLongOracle) {
                oracleFontSize = 26;
                maxCharactersPerLine = 45;
                lineOffset = 45;
            }
            if (isVeryLongOracle) {
                oracleFontSize = 23;
                maxCharactersPerLine = 50;
                lineOffset = 40;
            }
            const gapSize = isLongOracle ? 14 : 16;
            console.log(totalOracleText.length);
    
            ctx.font = `${oracleFontSize}px mplantin`;
    
            const wrappedKeywordText = this.wordWrapText(keyword, maxCharactersPerLine);
            const wrappedAbilityText = this.wordWrapText(ability, maxCharactersPerLine);
            const abilityWordWrapCount = this.lastWordWrapCount;
            const wrappedAbility2Text = this.wordWrapText(secondAbility, maxCharactersPerLine);
    
            // render oracle text.
            let offset = 590;
            if (keyword.length > 0) {
                ctx.fillText(wrappedKeywordText, 55, offset, 520);
                offset += lineOffset;
            }
            ctx.fillText(wrappedAbilityText.replace(/X[^\s]{1}/g, "    "), 55, offset, 520);
            await this.overlaySymbols(ctx, wrappedAbilityText, gapSize, oracleFontSize, 55, offset);
            
            offset += lineOffset + (15 * abilityWordWrapCount);
            ctx.fillText(wrappedAbility2Text.replace(/X[^\s]{1}/g, "    "), 55, offset, 520);
            await this.overlaySymbols(ctx, wrappedAbility2Text, gapSize, oracleFontSize, 55, offset);
            
            // render power and toughnes.
            if (this.card.type === "Creature") {
                const pt = `${this.card.power}/${this.card.toughness}`;
                const offset = pt.length === 3 ? 520 : pt.length === 4 ? 508 : 500;
                ctx.font = pt.length > 4 ? '37px mplantinbold' : '38px mplantinbold';
                ctx.fillText(pt, offset, 822);
            }
        
            // render card number;
            ctx.font = `$14px mplantin`;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(this.random(100, 999), 38, 833);
     
    
            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
        
            // this.sendCard(message);
            message.channel.send('', attachment);
    
            // ==============================================================================
            // ==============================================================================
            // ==============================================================================
        }
    
        
    
    */

    async overlaySymbols(text: string, gap: number, size: number, positionX: number, positionY: number, drawShadow: boolean = false) {

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

    // wordWrapText(text: string, maxCharactersPerLine: number) {
    //     this.lastWordWrapCount = 0;

    //     let resultString = '';
    //     let remainingWords = text.split(" ");
    //     while (remainingWords.length > 0)
    //     {
    //         let nextWordLength = 0;
    //         let line = "";
    //         do {
    //             line += remainingWords[0] + " ";
    //             remainingWords.splice(0, 1);
    //             nextWordLength = line.length + (remainingWords.length > 0 ? remainingWords[0].length : 0);
    //         } while (nextWordLength < maxCharactersPerLine && remainingWords.length > 0);
    //         resultString += line + "\r\n";
    //         this.lastWordWrapCount++;
    //     }
    //     return resultString.trim().substring(0, resultString.length - 2);
    // }

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