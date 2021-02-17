import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { Random } from '../../../helpers/Random';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';
import { MtgStaticAbility } from '../../../dtos/mtg/abilities/MtgStaticAbility';
import { MtgBaseGenerator } from './MtgBaseGenerator';
import { MtgAbilityType } from '../../../dtos/mtg/MtgAbilityType';

export class MtgLandGenerator extends MtgBaseGenerator {

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
        this.chooseArtwork(card, "land");
        this.resolveSyntax(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);

        card.manacost = "";
        card.color = "C";
        card.cmc = 0;

        return card;
    }

    private chooseAbilities(card: MtgCard) {
        const abilityCount = Random.complex([
            { value: 1, chance: 0.50 + (card.rarityScore <= 2 ? +0.3 : 0.0) },
            { value: 2, chance: 0.20 + (card.rarityScore <= 1 ? -1.0 : card.rarityScore >= 4 ? 0.5 : 0.0) },
            { value: 3, chance: 0.10 + (card.rarityScore <= 1 ? -1.0 : card.rarityScore >= 4 ? 0.2 : 0.0) }
        ], 1);

        for (let i = 0; i < abilityCount; i++) {
            const abilityType = Random.complex([
                { value: MtgAbilityType.Activated, chance: 0.40 },
                { value: MtgAbilityType.Triggered, chance: 0.40 },
                { value: MtgAbilityType.Static, chance: 0.20 }
            ], 0);
            const isRequiredToBePositive = i === 0; /* first ability is always a positive one */
            this.mtgAbilityService.generateCreatureAbility(card, abilityType, isRequiredToBePositive);
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