import { MtgCard } from "../../dtos/mtg/MtgCard";
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MessageAttachment } from "discord.js";
import { ImageProvider } from '../../persistence/repositories/ImageProvider';
import { Resources } from '../../helpers/Constants';
import { StringHelper } from '../../helpers/StringHelper';
import { Random } from "../../helpers/Random";
import { Logger } from '../../helpers/Logger';
import { LogType } from "../../dtos/LogType";
import { MtgHelper } from '../../helpers/mtg/MtgHelper';
import { MtgCardRenderer } from "./MtgCardRenderer";
import { MtgActivatedAbility } from "../../dtos/mtg/abilities/MtgActivatedAbility";
import { MtgOracleTextWrapPreset } from '../../dtos/mtg/MtgOracleTextWrapPreset';

import Canvas = require("canvas");

export class MtgPlaneswalkerCardRenderer {

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
        await this.drawCardArtwork();
        await this.drawLineSeparator();
        this.drawCardBorder();
        this.drawCardTitle();
        await this.drawCardCost();
        this.drawCardType();
        this.drawExpansionSymbol();
        await this.drawOracleText();
        this.drawStartingLoyalty();
        this.drawCardNumber();

        const attachment = new MessageAttachment(this.canvas.toBuffer(), this.card.name + '.png');
        return attachment;
    }

    private async drawLineSeparator() {
        const spearator = await Canvas.loadImage(`assets/img/mtg/pw_separator.png`);
        this.ctx.drawImage(spearator, 10, 615, 610, 120);
    }

    private fillBlack() {
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawCardBorder() {
        const colorMapping = this.card.color.length <= 2 ? MtgHelper.sortWubrg(this.card.color) : "m";
        const fileName = `IMAGEURL_BORDER_${colorMapping}_PLANESWALKER`;

        const cardImageUrl = Resources.MtgImageUrls.find(s => StringHelper.isEqualIgnoreCase(s.name, fileName));
        const cardImage = ImageProvider.getImage(cardImageUrl.path);

        this.ctx.drawImage(cardImage, 0, 0, this.canvas.width, this.canvas.height);
    }

    private drawCardTitle() {
        const cardTitle = this.card.name;
        this.ctx.font = `${cardTitle.length > 25 ? 34 : 38}px matrixbold`;

        // check is necessary, lands have no manacost.
        let offsetRight = 0;
        if (this.card.manacost.length > 0) {
            offsetRight = this.card.manacost.length * 17;
        }
        this.ctx.fillText(cardTitle, 52, 65, 520 - offsetRight);
    }

    private async drawCardCost() {
        await this.overlayManacostSymbols(this.card.manacost, 17, 32, 577 - (this.card.manacost.length * 16), 64);
    }

    private drawCardType() {
        this.ctx.font = '34px matrixbold';
        this.ctx.fillText(this.card.getFullType(), 52, 530, 490);
    }

    private async drawCardArtwork() {
        const artwork = await Canvas.loadImage(this.card.imageUrl);
        this.drawImageProp(artwork, 20, 20, this.canvas.width - 40, this.canvas.height - 40, 0.5, 0.2);
    }

    private drawExpansionSymbol() {
        const expansionSymbol = ImageProvider.getImage(`assets/img/mtg/expansion/${this.card.rarity.toString()}.png`);
        this.ctx.drawImage(expansionSymbol, 545, 502, 35, 35);
    }

    private drawCardNumber() {
        this.ctx.font = `$14px mplantin`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(Random.next(100, 999).toString(), 37, 833);
    }

    private async drawOracleText() {

        const preset = this.card.rendererPreset;
        const oracleLines = this.card.wrappedOracleLines;

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `${preset.fontSize}px mplantin`;

        const posX = 100;
        const posY = 557;

        const singleLineOffset = preset.fontSize + preset.lineDifInPixel;
        const lineHeight = 3 * singleLineOffset;

        for (let i = 0; i < 3; i++) {
            // draw symbol.
            const activatedAbility = this.card.oracle.abilities[i] as MtgActivatedAbility;
            const cost = activatedAbility.cost;
            const isUp = parseInt(cost.text) > 0;
            const pwSymbolImage = ImageProvider.getImage(`assets/img/mtg/symbols/mtg_pw_${isUp ? 'up' : 'down'}.png`)
            this.ctx.drawImage(pwSymbolImage, 25, 570 + (i * (lineHeight + 2)), 75, 52);
            
            // draw symbol number.
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = `28px mplantinbold`;
            this.ctx.fillText(cost.text, 25 + (isUp ? 21 : 25), 570 + (i * (lineHeight + 2)) + (isUp ? 36 : 34));

            this.ctx.fillStyle = '#000000';
            this.ctx.font = `${preset.fontSize}px mplantin`;

            const line1 = oracleLines[i * 3 + 0];
            const line2 = oracleLines[i * 3 + 1];
            const line3 = oracleLines[i * 3 + 2];

            let blockOffset = i * lineHeight;

            // for debug: draw text borders.
            // this.ctx.strokeRect(posX, posY + blockOffset, 470, singleLineOffset * 3);

            if (line2 === "" && line3 === "") {
                /* center text if only one line */
                blockOffset += singleLineOffset / 1.25;
            } else if (line3 === "")  {
                 /* center text by half of line if only two lines */
                blockOffset += singleLineOffset / 4;
            }

            if (line1 !== "") 
               await this.drawOracleTextLine(line1, posX, posY + blockOffset + singleLineOffset, preset);
            if (line2 !== "")
                await this.drawOracleTextLine(line2, posX, posY + blockOffset + singleLineOffset * 2, preset);
            if (line3 !== "")
                await this.drawOracleTextLine(line3, posX, posY + blockOffset + singleLineOffset * 3, preset);
        }

        this.ctx.fillStyle = '#000000';
    }

    private drawStartingLoyalty() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `32px mplantinbold`;
        this.ctx.fillText(this.card.startingLoyalty.toString(), 545, 816);
    }

    
    private async drawOracleTextLine(line: string, posX: number, posY: number, preset: MtgOracleTextWrapPreset) {
        // make placeholder space for symbols.
        const lineWithoutSymbols = line.replace(MtgCardRenderer.MANASYMBOL_PATTERN, "    ");

        this.ctx.fillText(lineWithoutSymbols, posX, posY, 470);
        await this.overlaySymbols(lineWithoutSymbols, line, preset.fontSize, posX, posY);
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
            case MtgCardType.Planeswalker:
                return "_PLANESWALKER";
        }
        return "";
    }
}