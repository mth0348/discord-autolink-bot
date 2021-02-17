import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { Random } from '../../../helpers/Random';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';
import { MtgBaseGenerator } from './MtgBaseGenerator';
import { MtgAbilityType } from '../../../dtos/mtg/MtgAbilityType';
import { MtgCardRarity } from '../../../dtos/mtg/MtgCardRarity';

export class MtgLandGenerator extends MtgBaseGenerator {

    constructor(
        mtgDataRepository: MtgDataRepository,
        mtgAbilityService: MtgAbilityService,
        mtgSyntaxResolver: MtgSyntaxResolver,
        mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
        super(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
    }

    public generate(card: MtgCard): MtgCard {

        card.isLegendary = card.isLegendary || Random.chance(0.25) && (card.rarity === MtgCardRarity.Rare || card.rarity === MtgCardRarity.Mythic);
        card.supertype = card.isLegendary ? "Legendary" : "";
        card.name = card.name || this.mtgDataRepository.getLandName(card.isLegendary);

        this.chooseAbilities(card);
        this.chooseArtwork(card, "land");
        this.resolveSyntax(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);

        card.manacost = "";
        card.cmc = 0;

        return card;
    }

    private chooseAbilities(card: MtgCard) {

        const entersTapped = false; // TODO remove. Random.chance(0.5);
        const hasManaAbility = true; // TODO remove. Random.chance(0.7);
        card.color = "gb";

        // first, decide on abilities.
        let abilityCount = 0;
        if (card.rarity === MtgCardRarity.Common || card.rarity === MtgCardRarity.Uncommon) {
            abilityCount = Random.complex([
                { value: 0, chance: 0.70 },
                { value: 1, chance: 0.30 },
            ], 0);
        }
        if (card.rarity === MtgCardRarity.Rare || card.rarity === MtgCardRarity.Mythic) {
            abilityCount = Random.complex([
                { value: 1, chance: 0.50 },
                { value: 2, chance: 0.50 + ((entersTapped || hasManaAbility) ? -1.0 : 0.0) } /* mercy on the oracle text length */
            ], 1);
        }

        // TODO remove.
        abilityCount = 0;

        let abilityTypes: MtgAbilityType[] = [];

        for (let i = 0; i < abilityCount; i++) {
            const abilityType = Random.complex([
                { value: MtgAbilityType.Activated, chance: 0.40 },
                { value: MtgAbilityType.Triggered, chance: 0.40 },
                { value: MtgAbilityType.Static, chance: 0.20 }
            ], MtgAbilityType.Activated);
            abilityTypes.push(abilityType);
        }

        // decide if enters tapped. Only makes sense if also has mana ability.
        if (entersTapped && hasManaAbility) {
            this.mtgAbilityService.generateLandEtbAbility(card);
        }

        // decide to add mana abilities.
        if (hasManaAbility || abilityCount === 0) {
            // enters tapped allows for more colored mana abilities.
            const colorsAllowed = entersTapped ? 5 : Random.next(0, 1);
            this.mtgAbilityService.generateManaAbility(card, colorsAllowed);

            if (card.color.length > 1 && !entersTapped) {
                // still add in entersTapped.
                this.mtgAbilityService.generateLandEtbAbility(card);
                card.oracle.abilities.reverse(); /* swap */
            }
        }

        // actually add rest of the abilities.
        for (let i = 0; i < abilityCount; i++) {
            this.generateAbility(card, abilityTypes[i]);
        }
    }

    private generateAbility(card: MtgCard, abilityType: MtgAbilityType) {

        const scoreSoFar = card.oracle.abilities.length > 0 ? card.oracle.abilities.reduce((a, b) => a += b.getScore(), 0) : 0;
        const minScore = scoreSoFar <= 0 ? scoreSoFar : -99;
        const maxScore = Math.min(2, Math.max(1, 1 - scoreSoFar));

        switch (abilityType) {
            case MtgAbilityType.Activated:
                this.mtgAbilityService.generateActivatedAbility(card, minScore, maxScore);
                break;

            case MtgAbilityType.Triggered:
                this.mtgAbilityService.generateTriggeredAbility(card, minScore, maxScore);
                break;

            case MtgAbilityType.Static:
                this.mtgAbilityService.generateStaticAbility(card, minScore, maxScore);
                break;
        }
    }

    private chooseFlavorText(card: MtgCard) {
        if (Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            const maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            const smallEnoughFlavorText = this.mtgDataRepository.getLandFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                const flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine)
                flavorTextLines.forEach(f => card.wrappedOracleLines.push("FT_" + f));
            }
        }
    }
}