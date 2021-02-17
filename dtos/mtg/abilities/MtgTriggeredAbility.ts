import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentEvent } from '../../../persistence/entities/mtg/MtgPermanentEvent';
import { MtgPermanentCondition } from '../../../persistence/entities/mtg/MtgPermanentCondition';
import { StringHelper } from '../../../helpers/StringHelper';
import { Random } from '../../../helpers/Random';
import { Logger } from '../../../helpers/Logger';
import { LogType } from '../../LogType';

export class MtgTriggeredAbility implements MtgAbility {

    public type = MtgAbilityType.Triggered;

    public parsedText: string;

    public parserValue: number = 0;

    public condition: MtgPermanentCondition;

    public event: MtgPermanentEvent;

    constructor(condition: MtgPermanentCondition, event: MtgPermanentEvent) {
        this.condition = condition;
        this.event = event;
    }

    public getColorIdentity(): string {
        return this.event.colorIdentity;
    }

    public getText(): string {
        return StringHelper.capitalizeFirstChar(this.condition.text) + ", " + this.event.text;
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

    public getContext(): string {
        return this.condition.context;
    }

}