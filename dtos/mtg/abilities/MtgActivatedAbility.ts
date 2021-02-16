import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentActivatedCost } from '../../../persistence/entities/mtg/MtgPermanentActivatedCost';
import { MtgPermanentEvent } from '../../../persistence/entities/mtg/MtgPermanentEvent';
import { StringHelper } from '../../../helpers/StringHelper';
import { Random } from '../../../helpers/Random';
import { Logger } from '../../../helpers/Logger';
import { parse } from 'path';
import { LogType } from '../../LogType';

export class MtgActivatedAbility implements MtgAbility {

    public type = MtgAbilityType.Activated;

    public parsedText: string;

    public parserValue: number;

    public cost: MtgPermanentActivatedCost;

    public event: MtgPermanentEvent;

    constructor(cost: MtgPermanentActivatedCost, event: MtgPermanentEvent) {
        this.cost = cost;
        this.event = event;
    }

    public getText(): string {
        return StringHelper.capitalizeFirstChar(this.cost.text) + ": " + StringHelper.capitalizeFirstChar(this.event.text);
    }

    public getScore(): number {
        // cost can be ignored, already accounted for when fetching costs.

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
        return "";
    }

}