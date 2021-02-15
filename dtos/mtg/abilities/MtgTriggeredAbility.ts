import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentEvent } from '../../../persistence/entities/mtg/MtgPermanentEvent';
import { MtgPermanentCondition } from '../../../persistence/entities/mtg/MtgPermanentCondition';
import { StringHelper } from '../../../helpers/StringHelper';

export class MtgTriggeredAbility implements MtgAbility {

    public type = MtgAbilityType.Triggered;

    public condition: MtgPermanentCondition;

    public event: MtgPermanentEvent;

    constructor(condition: MtgPermanentCondition, event: MtgPermanentEvent) {
        this.condition = condition;
        this.event = event;
    }

    public getText(): string {
        return StringHelper.capitalizeFirstChar(this.condition.text) + ", " + this.event.text;
    }

    public getScore(): number {
        return this.event.score;
    }

    public getContext(): string {
        return this.condition.context;
    }

    public parsedText: string;

    setParsedText(text: string): void {
        this.parsedText = text;
    }

}