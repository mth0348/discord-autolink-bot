import { MtgCard } from "../../dtos/mtg/MtgCard";
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MessageAttachment } from "discord.js";
import { ImageProvider } from '../../persistence/repositories/ImageProvider';
import { Resources } from '../../helpers/Constants';
import { StringHelper } from '../../helpers/StringHelper';
import { Random } from "../../helpers/Random";

import Canvas = require("canvas");
import { Logger } from "../../helpers/Logger";
import { LogType } from "../../dtos/LogType";

export class MtgCardRenderer {

    private static MANASYMBOL_PATTERN = /X[^\s]{1}/g;

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

        Logger.log("Pre-draw card: ", LogType.Verbose, this.card);

        this.fillBlack();
        this.drawCardBorder();
        this.drawCardTitle();
        await this.drawCardCost();
        this.drawCardType();
        await this.drawCardArtwork();
        this.drawExpansionSymbol();
        await this.drawOracleAndFlavorText();
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
        const fileName = `IMAGEURL_BORDER_${colorMapping}${this.getTypeFileSuffix()}`;

        const cardImageUrl = Resources.MtgImageUrls.find(s => StringHelper.isEqualIgnoreCase(s.name, fileName)).path;
        const cardImage = ImageProvider.getImage(cardImageUrl);

        this.ctx.drawImage(cardImage, 0, 0, this.canvas.width, this.canvas.height);
    }

    private drawCardTitle() {
        const cardTitle = this.card.name;
        this.ctx.font = `${cardTitle.length > 25 ? 34 : 38}px matrixbold`;

        // check is necessary, lands have no manacost.
        if (this.card.manacost.length > 0) {
            this.ctx.fillText(cardTitle, 52, 78, 520 - (this.card.manacost.length * 17));
        }
    }

    private async drawCardCost() {
        if (this.card.manacost.length > 0) {
            await this.overlayManacostSymbols(this.card.manacost, 17, 32, 577 - (this.card.manacost.length * 16), 75);
        }
    }

    private drawCardType() {
        this.ctx.font = '36px matrixbold';
        this.ctx.fillText(this.card.getFullType(), 52, 530, 520);
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

    private async drawOracleAndFlavorText() {

        const preset = this.card.rendererPreset;
        const oracleLines = this.card.wrappedOracleLines;

        this.ctx.font = `${preset.fontSize}px mplantin`;

        // if there is enough space, leave some area free before oracle text starts.
        const initialOffset = oracleLines.length < 4 ? (40 - oracleLines.length * 10) : 0;

        const posX = 60;
        const posY = 588 + initialOffset;

        for (let i = 0; i < oracleLines.length; i++) {
            let line = oracleLines[i];

            const lineOffset = (i * preset.fontSize) + preset.lineDifInPixel;
            const isFlavorText = StringHelper.startsWith(line, "FT_");
            const isFlavorTextSeparator = StringHelper.startsWith(line, "FT_LINE");

            if (!isFlavorText) {
                // make placeholder space for symbols.
                const lineWithoutSymbols = line.replace(MtgCardRenderer.MANASYMBOL_PATTERN, "    ");

                this.ctx.fillText(lineWithoutSymbols, posX, posY + lineOffset, 520);
                await this.overlaySymbols(lineWithoutSymbols, line, preset.fontSize, posX, posY + lineOffset);
            }
            else {
                // from here on, we can safely assume the rest is flavor text, so set font to italic.
                this.ctx.font = `${preset.fontSize}px mplantinitalic`;
                if (isFlavorTextSeparator) {
                    // skip text if its a line.
                    const symbol = await Canvas.loadImage(`assets/img/mtg/separator.png`);
                    this.ctx.drawImage(symbol, 40, posY + lineOffset - 20, 540, 20);
                } else {
                    line = line.substring(3);
                    this.ctx.fillText(line, posX, posY + lineOffset, 520);
                }
            }
        }
    }

    private async overlaySymbols(lineWithoutSymbols: string, line: string, size: number, positionX: number, positionY: number) {

        let match;
        let timesFound = 0;
        while (match = MtgCardRenderer.MANASYMBOL_PATTERN.exec(line)) {
            const i = match.index;
            let measuredTextSoFar = this.ctx.measureText(lineWithoutSymbols.substring(0, i + timesFound));
            const relativePosX = measuredTextSoFar.width;
            timesFound += 2; /* account for two extra spaces that are added when clearing the text. */

            const s = line.substring(i + 1, i + 2).toUpperCase();
            const symbol = await Canvas.loadImage(`assets/img/mtg/symbols/mtg_${s}.png`);
            this.ctx.drawImage(symbol, positionX + relativePosX, positionY + 5 - size, size, size);
        }
    }

    private async overlayManacostSymbols(text: string, gap: number, size: number, positionX: number, positionY: number) {

        let i = StringHelper.regexIndexOf(text, /X[^\s]{1}/g);
        while (i >= 0) {
            // draw drop shadow.
            const shadowSymbol = await Canvas.loadImage(`assets/img/mtg/symbols/mtg_Shadow.png`);
            this.ctx.drawImage(shadowSymbol, positionX + i * gap, positionY + 9 - size, size, size);

            // draw symbol.
            const s = text.substring(i + 1, i + 2).toUpperCase();
            const symbol = await Canvas.loadImage(`assets/img/mtg/symbols/mtg_${s}.png`);
            this.ctx.drawImage(symbol, positionX + i * gap, positionY + 5 - size, size, size);

            i = StringHelper.regexIndexOf(text, /X[^\s]{1}/g, i + 1);
        }
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

    private getTypeFileSuffix() {
        switch (this.card.type) {
            case MtgCardType.Creature:
                return "_CREATURE";
            case MtgCardType.Land:
                return "_LAND";
        }
        return "";
    }
}