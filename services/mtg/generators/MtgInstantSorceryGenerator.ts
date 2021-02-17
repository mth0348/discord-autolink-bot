import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { Random } from '../../../helpers/Random';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';

import { MtgHelper } from '../../../helpers/mtg/MtgHelper';
import { MtgStaticAbility } from '../../../dtos/mtg/abilities/MtgStaticAbility';
import { MtgBaseGenerator } from './MtgBaseGenerator';

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
        card.color = MtgHelper.getDominantColor(card);
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
            const isRequiredToBePositive = i === 0; /* first ability is always a positive one */
            this.mtgAbilityService.generateSpellAbility(card, isRequiredToBePositive);
        }

        // combine two abilities with ", then".
        if (abilityCount === 3 || (abilityCount === 2 && Random.chance(0.25))) {
            const a1 = card.oracle.abilities[0] as MtgStaticAbility;
            const a2 = card.oracle.abilities[1] as MtgStaticAbility;

            a1.combine(a2);

            card.oracle.abilities = [a1, ...card.oracle.abilities.slice(2)];
        }
    }
}