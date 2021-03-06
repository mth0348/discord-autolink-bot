import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { Random } from '../../../helpers/Random';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';
import { MtgHelper } from '../../../helpers/mtg/MtgHelper';
import { MtgBaseGenerator } from './MtgBaseGenerator';
import { MtgSpellAbility } from '../../../dtos/mtg/abilities/MtgSpellAbility';

export class MtgInstantSorceryGenerator extends MtgBaseGenerator {

    constructor(
        mtgDataRepository: MtgDataRepository,
        mtgAbilityService: MtgAbilityService,
        mtgSyntaxResolver: MtgSyntaxResolver,
        mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
        super(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
    }

    public generate(card: MtgCard): MtgCard {

        card.subtype = Random.chance(0.05) ? "Arcane" : undefined;
        card.name = card.name || this.mtgDataRepository.getInstantSorceryName();

        this.chooseAbilities(card);
        this.chooseArtwork(card, "spell");
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper.getManacost(card.cmc, card.color);

        return card;
    }

    private chooseAbilities(card: MtgCard) {
        const abilityCount = Random.complex([
            { value: 1, chance: 0.50 + (card.rarityScore <= 2 ? +0.3 : 0.0) },
            { value: 2, chance: 0.20 + (card.rarityScore <= 1 ? -1.0 : card.rarityScore >= 4 ? 0.5 : 0.0) },
            { value: 3, chance: 0.10 + (card.rarityScore <= 1 ? -1.0 : card.rarityScore >= 4 ? 0.2 : 0.0) }
        ], 1);

        for (let i = 0; i < abilityCount; i++) {
            const minScore = i === 0 ? 0 : -99; /* first ability is always a positive one */
            this.mtgAbilityService.generateSpellAbility(card, minScore);
        }

        // combine two abilities with ", then".
        if (abilityCount === 3 || (abilityCount === 2 && Random.chance(0.25))) {
            const a1 = card.oracle.abilities[0] as MtgSpellAbility;
            const a2 = card.oracle.abilities[1] as MtgSpellAbility;

            if (!a1.event.noFollowUp) {
                a1.combine(a2);
                card.oracle.abilities = [a1, ...card.oracle.abilities.slice(2)];
            }
        }
    }

    private chooseFlavorText(card: MtgCard) {
        if (Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            const maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            const smallEnoughFlavorText = this.mtgDataRepository.getSpellFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                const flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine)
                flavorTextLines.forEach(f => card.wrappedOracleLines.push("FT_" + f));
            }
        }
    }
}