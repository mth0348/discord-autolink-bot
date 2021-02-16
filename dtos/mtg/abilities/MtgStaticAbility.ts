import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentStatics } from '../../../persistence/entities/mtg/MtgPermanentStatics';
import { StringHelper } from '../../../helpers/StringHelper';

export class MtgStaticAbility implements MtgAbility {

    public type = MtgAbilityType.Static;

    public event: MtgPermanentStatics;

    constructor(event: MtgPermanentStatics) {
        this.event = event;
    }

    public getText(): string {
        return StringHelper.capitalizeFirstChar(this.event.text);
    }

    public getScore(): number {
        return this.event.score;
    }

    public getContext(): string {
        return "";
    }

    public parsedText: string;

    setParsedText(text: string): void {
        this.parsedText = StringHelper.capitalizeFirstChar(text);
    }

}