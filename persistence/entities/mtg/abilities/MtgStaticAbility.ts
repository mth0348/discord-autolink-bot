import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../../../../dtos/mtg/MtgAbilityType';
import { MtgPermanentStatics } from '../MtgPermanentStatics';

export class MtgStaticAbility implements MtgAbility {

    public type = MtgAbilityType.Static;

    public event: MtgPermanentStatics;

    constructor(event: MtgPermanentStatics) {
        this.event = event;
    }

}