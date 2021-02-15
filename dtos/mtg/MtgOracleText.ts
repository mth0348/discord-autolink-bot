import { MtgAbility } from "./abilities/MtgAbility";
import { MtgKeyword } from "../../persistence/entities/mtg/MtgKeyword";

export class MtgOracleText {
    public keywords: MtgKeyword[] = [];

    public abilities: MtgAbility[] = [];

    public getLines(): string[] {
        const lines: string[] = [];
        if (this.keywords.length > 0) {
            lines.push(this.keywords.map(k => k.name).join(", "));
        }
        this.abilities.forEach(ability => {
            lines.push(ability.getText());
        });
        return lines;
    }

}