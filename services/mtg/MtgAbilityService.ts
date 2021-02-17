import { MtgCard } from '../../dtos/mtg/MtgCard';
import { MtgAbilityType } from '../../dtos/mtg/MtgAbilityType';
import { MtgDataRepository } from '../../persistence/repositories/MtgDataRepository';
import { Random } from '../../helpers/Random';
import { MtgActivatedAbility } from '../../dtos/mtg/abilities/MtgActivatedAbility';
import { MtgStaticAbility } from '../../dtos/mtg/abilities/MtgStaticAbility';
import { MtgTriggeredAbility } from '../../dtos/mtg/abilities/MtgTriggeredAbility';
import { StringHelper } from '../../helpers/StringHelper';
import { MtgCardRarity } from '../../dtos/mtg/MtgCardRarity';
import { Collection } from 'discord.js';
import { MtgPermanentActivatedCost } from '../../persistence/entities/mtg/MtgPermanentActivatedCost';
import { MtgHelper } from '../../helpers/mtg/MtgHelper';

export class MtgAbilityService {

    rarityScoreLUT: Collection<MtgCardRarity, number> = new Collection<MtgCardRarity, number>([
        [MtgCardRarity.Common, 2],
        [MtgCardRarity.Uncommon, 3],
        [MtgCardRarity.Rare, 5.5],
        [MtgCardRarity.Mythic, 9999]
    ]);

    constructor(private mtgDataRepository: MtgDataRepository) {
    }

    public generateSpellAbility(card: MtgCard, requiredPositive: boolean = false) {

        const colors = card.color.toLowerCase().split('');

        const events = this.mtgDataRepository.getInstantSorceryEvents()
            .filter(a =>
                (!requiredPositive || a.score > 0)
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0 || c === "c")
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        const spellEvent = Random.nextFromList(events);
        card.oracle.abilities.push(new MtgStaticAbility(spellEvent));
    }

    public generateCreatureAbility(card: MtgCard, abilityType: MtgAbilityType, requiredPositive: boolean = false) {

        switch (abilityType) {
            case MtgAbilityType.Activated:
                this.generateActivatedAbility(card, requiredPositive);
                break;

            case MtgAbilityType.Triggered:
                this.generateTriggeredAbility(card, requiredPositive);
                break;

            case MtgAbilityType.Static:
                this.generateStaticAbility(card, requiredPositive);
                break;
        }
    }

    private generateActivatedAbility(card: MtgCard, requiredPositive: boolean) {
        const colors = card.color.toLowerCase().split('');

        const positiveEvents = this.mtgDataRepository.getPermanentEvents()
            .filter(a =>
                a.score > 0
                && (!requiredPositive || a.score > 0)
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0 || c === "c")
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        const activatedEvent = Random.nextFromList(positiveEvents);

        let cost = null;

        // decide whether to use DB activatedCost or craft one out of mana symbols.
        if (Random.chance(0.2)) {
            // db.
            const costs = this.mtgDataRepository.getPermanentActivatedCosts()
                .filter(a =>
                    (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                    && colors.some(c => a.colorIdentity.indexOf(c) >= 0));

            // sort descending by score.
            let fairCosts = costs.filter(c => c.score >= activatedEvent.score).sort((a, b) => b.score - a.score);
            if (fairCosts.length < 3) {
                // sort descending by score.
                fairCosts = costs.sort((a, b) => b.score - a.score);
            }

            // get three of the most reasonable (closest score) costs, then pick one.
            cost = fairCosts[Random.next(0, 2)];

        } else {
            // craft
            const useTapSymbol = Random.chance(0.5);
            const tapSymbolText = useTapSymbol ? ", XT" : "";

            const cmc = Math.max(1, Math.min(6, Math.round(activatedEvent.score * Random.next(50, 80) / 100)));
            const manacost = MtgHelper.getManacost(cmc, activatedEvent.colorIdentity);

            cost = new MtgPermanentActivatedCost({
                text: manacost + tapSymbolText,
                score: cmc,
                colorIdentity: activatedEvent.colorIdentity
            });
        }

        card.oracle.abilities.push(new MtgActivatedAbility(cost, activatedEvent));
    }

    private generateTriggeredAbility(card: MtgCard, requiredPositive: boolean) {
        const colors = card.color.toLowerCase().split('');

        const conditions = this.mtgDataRepository.getPermanentConditions();

        const events = this.mtgDataRepository.getPermanentEvents()
            .filter(a =>
                (!requiredPositive || a.score > 0)
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0 || c === "c")
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        const condition = Random.nextFromList(conditions);
        const triggeredEvent = Random.nextFromList(events);
        card.oracle.abilities.push(new MtgTriggeredAbility(condition, triggeredEvent));
    }

    private generateStaticAbility(card: MtgCard, requiredPositive: boolean) {
        const colors = card.color.toLowerCase().split('');

        const statics = this.mtgDataRepository.getPermanentStatics()
            .filter(a =>
                (!requiredPositive || a.score > 0)
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0 || c === "c")
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        const staticEvent = Random.nextFromList(statics);
        card.oracle.abilities.push(new MtgStaticAbility(staticEvent));
    }
}