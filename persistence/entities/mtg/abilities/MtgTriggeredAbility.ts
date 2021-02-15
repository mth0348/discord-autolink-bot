import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../../../../dtos/mtg/MtgAbilityType';
import { MtgPermanentEvent } from '../MtgPermanentEvent';
import { MtgPermanentCondition } from '../MtgPermanentCondition';

export class MtgTriggeredAbility implements MtgAbility {

    public type = MtgAbilityType.Triggered;

    public condition: MtgPermanentCondition;

    public event: MtgPermanentEvent;

    constructor(condition: MtgPermanentCondition, event: MtgPermanentEvent) {
        this.condition = condition;
        this.event = event;
    }

}