import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { Random } from '../../../helpers/Random';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';
import { MtgStaticAbility } from '../../../dtos/mtg/abilities/MtgStaticAbility';
import { MtgBaseGenerator } from './MtgBaseGenerator';
import { MtgAbilityType } from '../../../dtos/mtg/MtgAbilityType';
import { MtgHelper } from '../../../helpers/mtg/MtgHelper';
import { MtgPermanentStatics } from '../../../persistence/entities/mtg/MtgPermanentStatics';

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
        this.estimateCmc(card); /* CMC for lands is used to determine dominant colors */

        card.manacost = "";
        card.color = MtgHelper.getDominantColor(card, 99);

        return card;
    }

    private chooseAbilities(card: MtgCard) {
        const entersTapped = Random.chance(0.5);
        const hasManaAbility = Random.chance(0.3);

        // first, decide on abilities.
        const abilityCount = Random.complex([
            { value: 0, chance: 0.30 },
            { value: 1, chance: 0.50 },
            { value: 2, chance: 0.20 + (entersTapped || card.rarityScore <= 1 ? -1.0 : card.rarityScore >= 4 ? 0.2 : 0.0) }
        ], 1);

        let abilityTypes: MtgAbilityType[] = [];

        for (let i = 0; i < abilityCount; i++) {
            const abilityType = Random.complex([
                { value: MtgAbilityType.Activated, chance: 0.40 },
                { value: MtgAbilityType.Triggered, chance: 0.40 },
                { value: MtgAbilityType.Static, chance: 0.20 }
            ], 0);
            abilityTypes.push(abilityType);
        }

        // decide if enters tapped. Only makes sense if also has mana ability.
        if (entersTapped && hasManaAbility) {
            this.mtgAbilityService.generateLandEtbAbility(card);
        }

        // decide to add mana abilities.
        if (hasManaAbility) {
            // enters tapped allows for more colored mana abilities.
            if (entersTapped) {
                this.mtgAbilityService.generateManaAbility(card);
            }
        }

        // actually add rest of the abilities.
        for (let i = 0; i < abilityCount; i++) {
            this.generateAbility(card, abilityTypes[i]);
        }
    }

    private generateAbility(card: MtgCard, abilityType: MtgAbilityType) {

        switch (abilityType) {
            case MtgAbilityType.Activated:
                this.mtgAbilityService.generateActivatedAbility(card);
                break;

            case MtgAbilityType.Triggered:
                this.mtgAbilityService.generateTriggeredAbility(card);
                break;

            case MtgAbilityType.Static:
                this.mtgAbilityService.generateStaticAbility(card);
                break;
        }
    }
}