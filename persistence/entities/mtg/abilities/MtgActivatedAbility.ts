import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../../../../dtos/mtg/MtgAbilityType';
import { MtgPermanentActivatedCost } from '../MtgPermanentActivatedCost';
import { MtgPermanentEvent } from '../MtgPermanentEvent';

export class MtgActivatedAbility implements MtgAbility {

    public type = MtgAbilityType.Activated;

    public cost: MtgPermanentActivatedCost;

    public event: MtgPermanentEvent;

    constructor(cost: MtgPermanentActivatedCost, event: MtgPermanentEvent) {
        this.cost = cost;
        this.event = event;
    }

}