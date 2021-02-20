import { MtgCard } from '../../dtos/mtg/MtgCard';
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
import { MtgPermanentEvent } from '../../persistence/entities/mtg/MtgPermanentEvent';
import { MtgCommandParser } from '../../parsers/MtgCommandParser';
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { Logger } from '../../helpers/Logger';
import { LogType } from '../../dtos/LogType';
import { MtgActivatedPwAbility } from '../../dtos/mtg/abilities/MtgActivatedPwAbility';

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
        const colors = this.getColors(card);

        const events = this.mtgDataRepository.getInstantSorceryEvents()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0 || c === "c")
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        if (events.length <= 0) {
            Logger.log(`No spell ability found for card.`, LogType.Warning, card);
            return;
        }

        const spellEvent = Random.nextFromList(events);
        card.oracle.abilities.push(new MtgStaticAbility(spellEvent));
    }

    public generateLandEtbAbility(card: MtgCard) {
        const colors = this.getColors(card);

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

            if (costs.length <= 0) {
                Logger.log(`No land ETB ability found for card.`, LogType.Warning, card);
                return;
            }

            const chosenCost = Random.nextFromList(costs);

            const etbEvent = new MtgPermanentStatics({
                colorIdentity: chosenCost.colorIdentity,
                text: "as (self) enters the battlefield, you may " + chosenCost.text + ". If you don't, (self) enters the battlefield tapped",
                score: 1 - chosenCost.score / 6
            });
            card.oracle.abilities.push(new MtgStaticAbility(etbEvent));

        }
    }

    public generateManaAbility(card: MtgCard, collorsAllowed: number) {
        let colorString = "";

        if (collorsAllowed === 0)
            colorString = "XC";
        else if (card.color.length === 1 || collorsAllowed === 1)
            colorString = "X" + Random.nextFromList(card.color.split(""));
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
        const colors = this.getColors(card);

        const events = this.mtgDataRepository.getPermanentEvents()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0)
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        if (events.length <= 0) {
            Logger.log(`No activated ability event found for card.`, LogType.Warning, card);
            return;
        }

        const activatedEvent = Random.nextFromList(events);

        let cost = null;
        // decide whether to use DB activatedCost or craft one out of mana symbols.
        if (Random.chance(0.2)) {
            // db.
            const costs = this.mtgDataRepository.getPermanentActivatedCosts()
                .filter(a =>
                    (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                    && colors.some(c => a.colorIdentity.indexOf(c) >= 0));

            if (costs.length <= 0) {
                Logger.log(`No activated costs found for card.`, LogType.Warning, card);
                return;
            }

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

            let cmc = Math.max(1, Math.min(6, Math.round(activatedEvent.score * Random.next(50, 80) / 100)));
            cmc += card.type === MtgCardType.Land ? 1 : 0; /* lands are op */
            const manacost = MtgHelper.getManacost(cmc, activatedEvent.colorIdentity);

            cost = new MtgPermanentActivatedCost({
                text: manacost + tapSymbolText,
                score: cmc,
                colorIdentity: activatedEvent.colorIdentity
            });
        }

        card.oracle.abilities.push(new MtgActivatedAbility(cost, activatedEvent));
    }

    public generateActivatedPwAbility(card: MtgCard, minScore: number = 0, maxScore: number = 99, isFirst: boolean = false) {
        const colors = this.getColors(card);

        const events = this.mtgDataRepository.getPermanentEvents()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0));

        if (events.length <= 0) {
            Logger.log(`No activated ability event found for card.`, LogType.Warning, card);
            return;
        }

        const activatedEvent = Random.nextFromList(events);
        const score = Math.max(-8, Math.min(8, activatedEvent.score * Random.next(60, 100) / 100));
        let roundedScore = Math.round(score);
        if (roundedScore === 0) roundedScore = 1;

        // sort descending by score.
        const cost = new MtgPermanentActivatedCost({
            text: `${isFirst ? '+' : '-'}${Math.abs(roundedScore)}`,
            score: roundedScore,
            colorIdentity: activatedEvent.colorIdentity
        });

        card.oracle.abilities.push(new MtgActivatedPwAbility(cost, activatedEvent));
    }

    public generateTriggeredAbility(card: MtgCard, minScore: number = -99, maxScore: number = 99) {
        const colors = this.getColors(card);

        const conditions = this.mtgDataRepository.getPermanentConditions()
            .filter(c => c.restrictedTypes == undefined || c.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)));

        const events = this.mtgDataRepository.getPermanentEvents()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0)
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        if (conditions.length <= 0) {
            Logger.log(`No conditions found for card.`, LogType.Warning, card);
            return;
        }
        if (events.length <= 0) {
            Logger.log(`No triggered events found for card.`, LogType.Warning, card);
            return;
        }

        const condition = Random.nextFromList(conditions);
        const triggeredEvent = Random.nextFromList(events);
        card.oracle.abilities.push(new MtgTriggeredAbility(condition, triggeredEvent));
    }

    public generateStaticAbility(card: MtgCard, minScore: number = -99, maxScore: number = 99) {
        const colors = this.getColors(card);

        const statics = this.mtgDataRepository.getPermanentStatics()
            .filter(a =>
                a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(t => StringHelper.isEqualIgnoreCase(t, card.type)))
                && colors.some(c => a.colorIdentity.indexOf(c) >= 0)
                && a.score <= this.rarityScoreLUT.get(card.rarity));

        if (statics.length <= 0) {
            Logger.log(`No static events found for card.`, LogType.Warning, card);
            return;
        }

        const staticEvent = Random.nextFromList(statics);
        card.oracle.abilities.push(new MtgStaticAbility(staticEvent));
    }

    private getColors(card: MtgCard): string[] {
        return MtgHelper.isExactlyColor(card.color, "c") ? MtgCommandParser.BASIC_COLORS.map(c => c) : card.color.split('');
    }
}