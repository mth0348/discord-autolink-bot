export class CsGoVideo {
    public description: string;
    public map: string;
    public side: string;
    public type: string;
    public location: string;
    public source: string;
    
    constructor(data: any) {
        this.description = data.description;
        this.map = data.map;
        this.side = data.side;
        this.type = data.type;
        this.location = data.location;
        this.source = data.source;
    }
}