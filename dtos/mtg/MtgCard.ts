import { MtgCardRarity } from './MtgCardRarity';
import { MtgCardType } from './MtgCardType';
import { MtgOracleText } from './MtgOracleText';
import { MtgOracleTextWrapPreset } from './MtgOracleTextWrapPreset';
import { MtgHelper } from '../../helpers/mtg/MtgHelper';

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

    public rendererPreset: MtgOracleTextWrapPreset;

    public startingLoyalty: number;

    public getFullType(): string {
        const supertypeText = this.supertype ? this.supertype + " " : "";
        const typeText = this.type;
        const subtypeText = (this.subtype ? (" — " + this.subtype) : "");
        return supertypeText + typeText + subtypeText;
    }

    public hasPowerToughness(): boolean {
        return this.type === MtgCardType.Creature || this.type === MtgCardType.Artifactcreature;
    }

    public toLogString(): string[] {
        let result: string[] = [];
        result.push(`MtgCard: { name: ${this.name}, type: ${this.supertype} ${this.type} - ${this.subtype}, cost: ${this.manacost} (${this.cmc}), rarity: ${this.rarity}, P/T: ${this.power}/${this.toughness}, image: ${this.imageUrl} }`);
        result.push(`\t- keywords (${this.oracle.keywords.length}): ${this.oracle.keywords.map(k => k.getText(this)).join(", ")}`);
        result.push(`\t- abilities (${this.oracle.abilities.length}):`);
        this.oracle.abilities.forEach(a => {
            result.push(`\t-- ${a.getText()}`);
        });
        return result;
    }
}