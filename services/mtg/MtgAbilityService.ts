import { MtgCard } from '../../dtos/mtg/MtgCard';
import { MtgAbilityType } from '../../dtos/mtg/MtgAbilityType';
import { MtgDataRepository } from '../../persistence/repositories/MtgDataRepository';
import { Random } from '../../helpers/Random';
import { MtgActivatedAbility } from '../../dtos/mtg/abilities/MtgActivatedAbility';
import { MtgStaticAbility } from '../../dtos/mtg/abilities/MtgStaticAbility';
import { MtgTriggeredAbility } from '../../dtos/mtg/abilities/MtgTriggeredAbility';
import { StringHelper } from '../../helpers/StringHelper';

export class MtgAbilityService {

    constructor(private mtgDataRepository: MtgDataRepository) {
    }

    public generateAbility(card: MtgCard, abilityType: MtgAbilityType, restrictTypes: boolean = false) {

        const colors = card.color.toLowerCase().split('');

        const conditions = this.mtgDataRepository.getPermanentConditions();

        const statics = this.mtgDataRepository.getPermanentStatics()
            .filter(a => colors.some(c => a.colorIdentity.indexOf(c) >= 0));
        
        const costs = this.mtgDataRepository.getPermanentActivatedCosts()
            .filter(a => 
                (!restrictTypes || a.restrictedTypes.every(t => !StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0));
        
        const events = this.mtgDataRepository.getPermanentEvents()
            .filter(a =>
                (!restrictTypes || a.restrictedTypes.every(t => !StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0));

        switch (abilityType) {
            case MtgAbilityType.Activated:
                const cost = Random.nextFromList(costs);
                const activatedEvent = Random.nextFromList(events);
                card.oracle.abilities.push(new MtgActivatedAbility(cost, activatedEvent));
                break;

            case MtgAbilityType.Triggered:
                const condition = Random.nextFromList(conditions);
                const triggeredEvent = Random.nextFromList(events);
                card.oracle.abilities.push(new MtgTriggeredAbility(condition, triggeredEvent));
                break;

            case MtgAbilityType.Static:
                const staticEvent = Random.nextFromList(statics);
                card.oracle.abilities.push(new MtgStaticAbility(staticEvent));
                break;
        }
    }
}