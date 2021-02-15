import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentActivatedCost } from '../../../persistence/entities/mtg/MtgPermanentActivatedCost';
import { MtgPermanentEvent } from '../../../persistence/entities/mtg/MtgPermanentEvent';

export class MtgActivatedAbility implements MtgAbility {

    public type = MtgAbilityType.Activated;

    public cost: MtgPermanentActivatedCost;

    public event: MtgPermanentEvent;

    constructor(cost: MtgPermanentActivatedCost, event: MtgPermanentEvent) {
        this.cost = cost;
        this.event = event;
    }

    public getText() : string {
        return this.cost.text + ": " + this.event.text;
    }    

}