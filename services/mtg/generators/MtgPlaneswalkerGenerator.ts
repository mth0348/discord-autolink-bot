import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { Random } from '../../../helpers/Random';
import { MtgCardRarity } from '../../../dtos/mtg/MtgCardRarity';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';
import { MtgHelper } from '../../../helpers/mtg/MtgHelper';
import { MtgBaseGenerator } from './MtgBaseGenerator';
import { Logger } from '../../../helpers/Logger';
import { LogType } from '../../../dtos/LogType';

export class MtgPlaneswalkerGenerator extends MtgBaseGenerator {

    constructor(
        mtgDataRepository: MtgDataRepository,
        mtgAbilityService: MtgAbilityService,
        mtgSyntaxResolver: MtgSyntaxResolver,
        mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
        super(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
    }

    public generate(card: MtgCard): MtgCard {

        card.isLegendary = true;
        card.supertype = "Legendary";
        card.name = card.name || this.mtgDataRepository.getPlaneswalkerName();
        card.rarity = Random.chance(0.5) ? MtgCardRarity.Rare : MtgCardRarity.Mythic;

        this.chooseSubtypes(card);
        this.chooseAbilities(card);
        this.chooseArtwork(card, 'planeswalker');
        // this.chooseStartingLoyalty(card);
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.estimateStartingLoyalty(card);
        card.color = MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper.getManacost(card.cmc, card.color);

        return card;
    }

    protected wrapTextForRenderer(card: MtgCard) {
        card.rendererPreset = MtgOracleTextWrapperService.PRESET_TINY;
        const wrappedTextLines = this.mtgOracleTextWrapperService.wordWrapAllPlaneswalkerOracleText(card.oracle, card.rendererPreset.maxCharactersPerLine - 2);
        card.wrappedOracleLines = wrappedTextLines;
    }
    
    protected estimateCmc(card: MtgCard) {
        let totalScore = 0;

        Logger.log("Started card cost estimation:", LogType.CostEstimation);

        card.oracle.abilities.forEach(a => totalScore += a.getScore());
        totalScore *= Random.next(50, 70) / 100;

        // the higher the cmc, the more likely a reduction occurs. (min-cmc: 3)
        const minCmcForReduction = 3;
        const randomReduction = totalScore > minCmcForReduction ? Random.chance((totalScore - minCmcForReduction) / 10) ? 1 : 0 : 0;
        const reducedCmc = totalScore - randomReduction;

        Logger.log("Random reduction: " + randomReduction, LogType.CostEstimation);
        Logger.log("Before rounding: " + (reducedCmc), LogType.CostEstimation);

        const roundedScore = Math.round(reducedCmc);

        Logger.log("After rounding: " + roundedScore, LogType.CostEstimation);

        card.cmc = Math.max(1, Math.min(9, roundedScore));

        Logger.log("Final capped CMC = " + card.cmc, LogType.CostEstimation);
    }
    private chooseSubtypes(card: MtgCard) {
        // first word of name.
        card.subtype = card.name.split(",")[0].split(" ")[0];
    }

    private chooseAbilities(card: MtgCard) {
        this.mtgAbilityService.generateActivatedPwAbility(card, +0.0, +1.00, true);
        this.mtgAbilityService.generateActivatedPwAbility(card, +1.1, +3.99);
        this.mtgAbilityService.generateActivatedPwAbility(card, +4.0, +99.0);
    }

    private estimateStartingLoyalty(card: MtgCard) {
        card.startingLoyalty = 5;
    }
}