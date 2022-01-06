export class LolRoleCount {

    public role: string;

    public primaries: number;

    public secondaries: number;

    constructor(role: string) {
        this.role = role;
        this.primaries = 0;
        this.secondaries = 0;
    }
}