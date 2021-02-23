export class MtgEnchantmentEffect {
    public text: string;
    public colorIdentity: string;
    public score: number;
    public auraType: string;
    public onlyOnce: boolean;
    public isForOpponent: boolean | undefined;
    
    constructor(data: any) {
        this.text = data.text;
        this.colorIdentity = data.colorIdentity;
        this.score = data.score;
        this.auraType = data.auraType;
        this.onlyOnce = data.onlyOnce;
        this.isForOpponent = data.isForOpponent;
    }
}