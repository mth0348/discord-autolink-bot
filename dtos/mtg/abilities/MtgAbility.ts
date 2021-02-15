import { MtgAbilityType } from '../MtgAbilityType';

export interface MtgAbility {
    
    type: MtgAbilityType;
    
    parsedText: string;

    getContext(): string;

    getScore(): number;

    getText(): string;

    setParsedText(text: string): void;

}
