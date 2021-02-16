import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { MtgParsable } from '../../../dtos/mtg/abilities/MtgParsable';
import { Logger } from '../../../helpers/Logger';
import { LogType } from '../../../dtos/LogType';

export class MtgKeyword implements MtgParsable {

    public name: string;
    public hasCost: boolean;
    public score: number;
    public nameExtension: string;
    public colorIdentity: string;
    public types: string[];

    public parsedText: string;
    public parserValue: number;

    constructor(data: any) {
        this.name = data.name;
        this.hasCost = data.hasCost;
        this.score = data.score;
        this.nameExtension = data.nameExtension;
        this.colorIdentity = data.colorIdentity;
        this.types = data.types;
    }

    public getScore(): number {
        Logger.log("Keyword '" + this.name + "': " + this.score, LogType.CostEstimation)
        return this.score;
    }

    public getText(card: MtgCard): string {
        const costText = `(cost[s:${this.score},c:${card.color}])`

        if (this.nameExtension.length > 0 && this.hasCost)
            return this.name + " " + this.nameExtension + " - " + costText;

        if (this.nameExtension.length)
            return this.name + " " + this.nameExtension;

        if (this.hasCost)
            return this.name + " " + costText;

        return this.name;
    }

    public getContext() { return ""; }
}