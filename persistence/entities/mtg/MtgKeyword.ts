import { StringHelper } from '../../../helpers/StringHelper';
export class MtgKeyword {
    public name: string;
    public hasCost: boolean;
    public score: number;
    public nameExtension: string;
    public colorIdentity: string;
    public types: string[];

    constructor(data: any) {
        this.name = data.name;
        this.hasCost = data.hasCost;
        this.score = data.score;
        this.nameExtension = data.nameExtension;
        this.colorIdentity = data.colorIdentity;
        this.types = data.types;
    }

    public parsedText: string;

    getText(): string {
        const costText = `(cost[s:${this.score},c:${this.colorIdentity}])`

        if (this.nameExtension.length > 0 && this.hasCost) 
            return this.name + " " + this.nameExtension + " - " + costText;

        if (this.nameExtension.length)
            return this.name + " " + this.nameExtension;

        if (this.hasCost) 
            return this.name + " " + costText;

        return this.name;
    }

    setParsedText(text: string): void {
        this.parsedText = StringHelper.capitalizeFirstChar(text.trim());
    }
}