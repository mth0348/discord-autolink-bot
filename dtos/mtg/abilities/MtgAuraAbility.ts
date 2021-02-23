import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { StringHelper } from '../../../helpers/StringHelper';
import { Random } from '../../../helpers/Random';
import { Logger } from '../../../helpers/Logger';
import { LogType } from '../../LogType';
import { MtgEnchantmentEffect } from '../../../persistence/entities/mtg/MtgEnchantmentEffect';

export class MtgAuraAbility implements MtgAbility {

    public type = MtgAbilityType.Static;

    public parsedText: string;

    public parserValue: number = 0;

    public effect: MtgEnchantmentEffect;

    constructor(effect: MtgEnchantmentEffect) {
        if (effect === undefined)
            throw "effect is undefined for MtgAuraAbility";

        this.effect = effect;
    }

    public getColorIdentity(): string {
        return this.effect.colorIdentity;
    }

    public getText(): string {
        return StringHelper.capitalizeFirstChar(this.effect.text);
    }

    public getScore(): number {
        const scoreWeight = Random.next(80, 100) / 100;

        const effectScore = this.effect.score * scoreWeight;
        const parsedScore = this.parserValue / 2.5;
        const finalScore = effectScore + parsedScore;

        Logger.log("Ability '" + this.getText().substr(0, 10) + "..':", LogType.CostEstimation)
        Logger.log(" - effect score: " + effectScore, LogType.CostEstimation);
        Logger.log(" - parsed score: " + parsedScore, LogType.CostEstimation);
        Logger.log(" - final score: " + finalScore, LogType.CostEstimation);

        return finalScore;
    }

    public combine(other: MtgAuraAbility) {
        this.effect.text += " and " + other.effect.text;
        this.effect.score += other.effect.score;
        this.effect.colorIdentity += other.effect.colorIdentity;
    }

    public getContext(): string {
        return "";
    }

}