export class MtgInstantSorceryEvent {
    public text: string;
    public colorIdentity: string;
    public score: number;
    public instantOnly: boolean | undefined;
    public noFollowUp: boolean | undefined;
    
    constructor(data: any) {
        this.text = data.text;
        this.colorIdentity = data.colorIdentity;
        this.score = data.score;
        this.instantOnly = data.instantOnly;
        this.noFollowUp = data.noFollowUp;
    }
}