import { MtgAbilityType } from '../MtgAbilityType';

export interface MtgAbility {
    
    type: MtgAbilityType;

    getText(): string;

}
