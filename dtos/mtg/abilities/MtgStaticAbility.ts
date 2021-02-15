import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentStatics } from '../../../persistence/entities/mtg/MtgPermanentStatics';

export class MtgStaticAbility implements MtgAbility {

    public type = MtgAbilityType.Static;

    public event: MtgPermanentStatics;

    constructor(event: MtgPermanentStatics) {
        this.event = event;
    }

    public getText() : string {
        return this.event.text;
    }

    public getScore() : number {
        return this.event.score;
    }

}