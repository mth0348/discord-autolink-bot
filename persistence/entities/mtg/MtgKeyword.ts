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
        return this.name + " " + this.nameExtension + (this.hasCost ? " - (cost)" : "");
    }

    setParsedText(text: string): void {
        this.parsedText = StringHelper.capitalizeFirstChar(text.trim());
    }
}