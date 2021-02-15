import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentEvent } from '../../../persistence/entities/mtg/MtgPermanentEvent';
import { MtgPermanentCondition } from '../../../persistence/entities/mtg/MtgPermanentCondition';

export class MtgTriggeredAbility implements MtgAbility {

    public type = MtgAbilityType.Triggered;

    public condition: MtgPermanentCondition;

    public event: MtgPermanentEvent;

    constructor(condition: MtgPermanentCondition, event: MtgPermanentEvent) {
        this.condition = condition;
        this.event = event;
    }

    public getText() : string {
        return this.condition.text + ", " + this.event.text;
    }

    public getScore(): number {
        return this.event.score;
    }

}