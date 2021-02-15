import { MtgCard } from '../../dtos/mtg/MtgCard';
import { MtgAbilityType } from '../../dtos/mtg/MtgAbilityType';
import { MtgDataRepository } from '../../persistence/repositories/MtgDataRepository';
import { Random } from '../../helpers/Random';
import { MtgActivatedAbility } from '../../persistence/entities/mtg/abilities/MtgActivatedAbility';
import { MtgStaticAbility } from '../../persistence/entities/mtg/abilities/MtgStaticAbility';
import { MtgTriggeredAbility } from '../../persistence/entities/mtg/abilities/MtgTriggeredAbility';

export class MtgAbilityService {

    constructor(private mtgDataRepository: MtgDataRepository) {
    }

    public addAbility(card: MtgCard, abilityType: MtgAbilityType) {

        switch (abilityType) {
            case MtgAbilityType.Activated:
                const cost = Random.nextFromList(this.mtgDataRepository.getPermanentActivatedCosts());
                const activatedEvent = Random.nextFromList(this.mtgDataRepository.getPermanentEvents());
                card.oracle.abilities.push(new MtgActivatedAbility(cost, activatedEvent));
                break;

            case MtgAbilityType.Triggered:
                const condition = Random.nextFromList(this.mtgDataRepository.getPermanentConditions());
                const triggeredEvent = Random.nextFromList(this.mtgDataRepository.getPermanentEvents());
                card.oracle.abilities.push(new MtgTriggeredAbility(condition, triggeredEvent));
                break;

            case MtgAbilityType.Static:
                const staticEvent = Random.nextFromList(this.mtgDataRepository.getPermanentStatics());
                card.oracle.abilities.push(new MtgStaticAbility(staticEvent));
                break;
        }
    }
}