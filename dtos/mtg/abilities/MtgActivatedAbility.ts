import { MtgAbility } from './MtgAbility';
import { MtgAbilityType } from '../MtgAbilityType';
import { MtgPermanentActivatedCost } from '../../../persistence/entities/mtg/MtgPermanentActivatedCost';
import { MtgPermanentEvent } from '../../../persistence/entities/mtg/MtgPermanentEvent';
import { StringHelper } from '../../../helpers/StringHelper';

export class MtgActivatedAbility implements MtgAbility {

    public type = MtgAbilityType.Activated;

    public cost: MtgPermanentActivatedCost;

    public event: MtgPermanentEvent;

    constructor(cost: MtgPermanentActivatedCost, event: MtgPermanentEvent) {
        this.cost = cost;
        this.event = event;
    }

    public getText(): string {
        return StringHelper.capitalizeFirstChar(this.cost.text) + ": " + StringHelper.capitalizeFirstChar(this.event.text);
    }

    public getScore(): number {
        return this.event.score / 1.5; // TODO: include cost in score
    }

    public getContext(): string {
        return "";
    }

    public parsedText: string;

    setParsedText(text: string): void {
        this.parsedText = text;
    }

}