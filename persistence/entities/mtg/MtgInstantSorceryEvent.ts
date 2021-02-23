export class MtgInstantSorceryEvent {
    public text: string;
    public colorIdentity: string;
    public score: number;
    public restrictedTypes: string[] | undefined;
    public noFollowUp: boolean | undefined;
    
    constructor(data: any) {
        this.text = data.text;
        this.colorIdentity = data.colorIdentity;
        this.score = data.score;
        this.restrictedTypes = data.restrictedTypes;
        this.noFollowUp = data.noFollowUp;
    }
}