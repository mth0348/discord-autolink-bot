import { MtgAbilityType } from '../MtgAbilityType';
import { MtgParsable } from './MtgParsable';

export interface MtgAbility extends MtgParsable {

    type: MtgAbilityType;

    getColorIdentity(): string;

    getContext(): string;

    getScore(): number;

    getText(): string;

}
