import { MtgCardRarity } from './MtgCardRarity';
import { MtgCardType } from './MtgCardType';

export class MtgCardParams {
    
    public name: string;

    public color: string;

    public manacost: string;

    public type: MtgCardType;

    public subtype: string;

    public supertype: string;

    public power: number;

    public toughness: number;

    public rarity: MtgCardRarity;

    public oracleText: string;

    public flavorText: string;

    public getFullType() : string {
        return (this.supertype ? this.supertype + " " : "") + this.type + " — " + this.subtype;
    }

    public hasPowerToughness() : boolean {
        return this.type === MtgCardType.Creature;
    }
}