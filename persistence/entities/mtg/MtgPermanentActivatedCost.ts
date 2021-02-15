export class MtgPermanentActivatedCost {
    public text: string;
    public colorIdentity: string;
    public score: number;
    public creatureOnly: boolean | undefined;
    
    constructor(data: any) {
        this.text = data.text;
        this.colorIdentity = data.colorIdentity;
        this.score = data.score;
        this.creatureOnly = data.creatureOnly;
    }
}