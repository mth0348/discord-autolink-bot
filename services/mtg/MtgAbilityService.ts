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
import { MtgPermanentStatics } from '../../persistence/entities/mtg/MtgPermanentStatics';
import { isatty } from 'tty';
import { MtgPermanentEvent } from '../../persistence/entities/mtg/MtgPermanentEvent';

export class MtgAbilityService {

    rarityScoreLUT: Collection<MtgCardRarity, number> = new Collection<MtgCardRarity, number>([
        [MtgCardRarity.Common, 2],
        [MtgCardRarity.Uncommon, 3],
        [MtgCardRarity.Rare, 5.5],
        [MtgCardRarity.Mythic, 9999]
    ]);

    constructor(private mtgDataRepository: MtgDataRepository) {
    }

    public generateSpellAbility(card: MtgCard, minScore: number = 0, maxScore: number = 99) {

        const colors = card.color.toLowerCase().split('');

        const events = this.mtgDataRepository.getInstantSorceryEvents()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0 || c === "c")
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        const spellEvent = Random.nextFromList(events);
        card.oracle.abilities.push(new MtgStaticAbility(spellEvent));
    }

    public generateLandEtbAbility(card: MtgCard) {
        const colors = card.color.toLowerCase().split('');

        const isRegularTapped = Random.chance(0.8);
        if (isRegularTapped) {

            const etbEvent = new MtgPermanentStatics({
                colorIdentity: "",
                text: "(self) enters the battlefield tapped",
                score: -1.5
            });
            card.oracle.abilities.push(new MtgStaticAbility(etbEvent));

        } else {

            const costs = this.mtgDataRepository.getPermanentActivatedCosts()
                .filter(a =>
                    (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                    && colors.some(c => a.colorIdentity.indexOf(c) >= 0));

            const chosenCost = Random.nextFromList(costs);

            const etbEvent = new MtgPermanentStatics({
                colorIdentity: chosenCost.colorIdentity,
                text: "as (self) enters the battlefield, you may " + chosenCost.text + ". If you don't, (self) enters the battlefield tapped",
                score: -chosenCost.score / 2
            });
            card.oracle.abilities.push(new MtgStaticAbility(etbEvent));

        }
    }

    public generateManaAbility(card: MtgCard) {
        let colorString = "";

        if (card.color.length === 1)
            colorString = "X" + card.color;
        else if (card.color.length === 2)
            colorString = "X" + card.color.split("").join(" or X");
        else if (card.color.length > 2)
            colorString = "X" + card.color.slice(0, card.color.length - 1).split("").join(", X") + " or X" + card.color[card.color.length - 1];

        const cost = new MtgPermanentActivatedCost({
            text: "XT",
            score: 0,
            colorIdentity: card.color
        });

        const event = new MtgPermanentEvent({
            text: "add " + colorString,
            score: 1,
            colorIdentity: card.color
        });

        card.oracle.abilities.push(new MtgActivatedAbility(cost, event));
    }


    public generateActivatedAbility(card: MtgCard, minScore: number = 0, maxScore: number = 99) {
        const colors = card.color.toLowerCase().split('');

        const positiveEvents = this.mtgDataRepository.getPermanentEvents()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
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

    public generateTriggeredAbility(card: MtgCard, minScore: number = -99, maxScore: number = 99) {
        const colors = card.color.toLowerCase().split('');

        const conditions = this.mtgDataRepository.getPermanentConditions();

        const events = this.mtgDataRepository.getPermanentEvents()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0 || c === "c")
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        const condition = Random.nextFromList(conditions);
        const triggeredEvent = Random.nextFromList(events);
        card.oracle.abilities.push(new MtgTriggeredAbility(condition, triggeredEvent));
    }

    public generateStaticAbility(card: MtgCard, minScore: number = -99, maxScore: number = 99) {
        const colors = card.color.toLowerCase().split('');

        const statics = this.mtgDataRepository.getPermanentStatics()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0 || c === "c")
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        const staticEvent = Random.nextFromList(statics);
        card.oracle.abilities.push(new MtgStaticAbility(staticEvent));
    }
}