import { MtgCardRarity } from './MtgCardRarity';
import { MtgCardType } from './MtgCardType';
import { MtgOracleText } from './MtgOracleText';
import { MtgOracleTextWrapPreset } from './MtgOracleTextWrapPreset';

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

    public rarityScore: number;

    public oracle: MtgOracleText = new MtgOracleText();

    public flavorText: string;
    
    public imageUrl: string;

    public wrappedOracleLines: string[];

    public rendererPreset : MtgOracleTextWrapPreset;

    public getFullType() : string {
        return (this.supertype ? this.supertype + " " : "") + this.type + " — " + this.subtype;
    }

    public hasPowerToughness() : boolean {
        return this.type === MtgCardType.Creature;
    }
}