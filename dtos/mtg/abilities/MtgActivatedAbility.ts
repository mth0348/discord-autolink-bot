import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentActivatedCost } from '../../../domain/models/mtg/MtgPermanentActivatedCost';
import { MtgPermanentEvent } from '../../../domain/models/mtg/MtgPermanentEvent';
import { StringHelper } from '../../../helpers/StringHelper';
import { Random } from '../../../helpers/Random';
import { Logger } from '../../../helpers/Logger';
import { LogType } from '../../LogType';

export class MtgActivatedAbility implements MtgAbility {

    public type = MtgAbilityType.Activated;

    public parsedText: string;

    public parserValue: number = 0;

    public cost: MtgPermanentActivatedCost;

    public event: MtgPermanentEvent;

    constructor(cost: MtgPermanentActivatedCost, event: MtgPermanentEvent) {
        if (event === undefined || cost === undefined)
            throw "event or cost is undefined for MtgPermanentActivatedCost";

        this.cost = cost;
        this.event = event;
    }

    public getColorIdentity(): string {
        return this.cost.colorIdentity + this.event.colorIdentity;
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