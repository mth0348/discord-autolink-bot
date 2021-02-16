import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentStatics } from '../../../persistence/entities/mtg/MtgPermanentStatics';
import { StringHelper } from '../../../helpers/StringHelper';
import { Random } from '../../../helpers/Random';
import { Logger } from '../../../helpers/Logger';
import { LogType } from '../../LogType';

export class MtgStaticAbility implements MtgAbility {

    public type = MtgAbilityType.Static;

    public parsedText: string;

    public parserValue: number;

    public event: MtgPermanentStatics;

    constructor(event: MtgPermanentStatics) {
        this.event = event;
    }

    public getColorIdentity(): string {
        return this.event.colorIdentity;
    }

    public getText(): string {
        return StringHelper.capitalizeFirstChar(this.event.text);
    }

    public getScore(): number {
        const scoreWeight = Random.next(80, 100) / 100;

        const eventScore = this.event.score * scoreWeight;
        const parsedScore = this.parserValue / 2;
        const finalScore = eventScore + parsedScore;

        Logger.log("Ability '" + this.getText().substr(0, 10) + "..':", LogType.CostEstimation)
        Logger.log(" - event score: " + eventScore, LogType.CostEstimation);
        Logger.log(" - parsed score: " + parsedScore, LogType.CostEstimation);
        Logger.log(" - final score: " + finalScore, LogType.CostEstimation);

        return finalScore;
    }

    public combine(other: MtgStaticAbility) {
        this.event.text += ", then " + other.event.text;
        this.event.score += other.event.score;
        this.event.colorIdentity += other.event.colorIdentity;
    }

    public getContext(): string {
        return "";
    }

}