import { MtgCardRarity } from './MtgCardRarity';
import { MtgCardType } from './MtgCardType';
import { MtgOracleText } from './MtgOracleText';

export class MtgCard {
    
    public name: string;

    public color: string;

    public manacost: string;

    public cmc: number;

    public type: MtgCardType;

    public subtype: string;

    public supertype: string;

    public isLegendary: boolean;

    public power: number;

    public toughness: number;

    public rarity: MtgCardRarity;

    public oracle: MtgOracleText = new MtgOracleText();

    public flavorText: string;
    
    public imageUrl: string;

    public getFullType() : string {
        return (this.supertype ? this.supertype + " " : "") + this.type + " — " + this.subtype;
    }

    public hasPowerToughness() : boolean {
        return this.type === MtgCardType.Creature;
    }
}