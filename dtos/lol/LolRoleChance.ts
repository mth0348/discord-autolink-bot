export class LolRoleChance {

    public playerId: string;

    public chance: number;

    public squashedChance: number;

    constructor(playerId: string, chance: number) {
        this.playerId = playerId;
        this.chance = chance;
    }
}