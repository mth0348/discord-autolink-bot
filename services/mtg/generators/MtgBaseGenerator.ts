import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { Random } from '../../../helpers/Random';
import { MtgCardRarity } from '../../../dtos/mtg/MtgCardRarity';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';
import { Logger } from '../../../helpers/Logger';
import { LogType } from '../../../dtos/LogType';

import fs = require("fs");

export class MtgBaseGenerator {

    constructor(
        protected mtgDataRepository: MtgDataRepository,
        protected mtgAbilityService: MtgAbilityService,
        protected mtgSyntaxResolver: MtgSyntaxResolver,
        protected mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
    }

    protected estimateCmc(card: MtgCard) {
        let totalScore = 0;

        Logger.log("Started card cost estimation:", LogType.CostEstimation);

        if (card.hasPowerToughness()) {
            totalScore += card.power / 2;
            totalScore += card.toughness / 2.5;

            Logger.log("Power: " + card.power / 2, LogType.CostEstimation);
            Logger.log("Toughness: " + card.toughness / 2, LogType.CostEstimation);
        }

        card.oracle.keywords.forEach(k => totalScore += k.getScore());
        card.oracle.abilities.forEach(a => totalScore += a.getScore());

        // the higher the cmc, the more likely a reduction occurs. (min-cmc: 3)
        const minCmcForReduction = 3;
        const randomReduction = totalScore > minCmcForReduction ? Random.chance((totalScore - minCmcForReduction) / 10) ? 1 : 0 : 0;
        const mythicReduction = card.rarity === MtgCardRarity.Mythic ? Random.chance(0.33) ? 0.5 : 0.25 : 0;
        const reducedCmc = totalScore - randomReduction - mythicReduction;

        Logger.log("Random reduction: " + randomReduction, LogType.CostEstimation);
        Logger.log("Mythic reduction: " + mythicReduction, LogType.CostEstimation);
        Logger.log("Before rounding: " + (reducedCmc), LogType.CostEstimation);

        const roundedScore = Math.round(reducedCmc);

        Logger.log("After rounding: " + roundedScore, LogType.CostEstimation);

        card.cmc = Math.max(1, Math.min(9, roundedScore));

        Logger.log("Final capped CMC = " + card.cmc, LogType.CostEstimation);
    }

    protected chooseArtwork(card: MtgCard, folder: string) {
        const artPath = `assets/img/mtg/cards/${folder}/`;
        const files = fs.readdirSync(artPath);
        let randomArtworkFile = Random.nextFromList(files);
        card.imageUrl = artPath + randomArtworkFile;
    }

    protected resolveSyntax(card: MtgCard): void {
        this.mtgSyntaxResolver.resolveSyntax(card);
    }

    protected wrapTextForRenderer(card: MtgCard) {
        const preset = this.mtgOracleTextWrapperService.calculateTextWrapPreset(card.oracle);
        const wrappedTextLines = this.mtgOracleTextWrapperService.wordWrapAllOracleText(card.oracle, preset);
        card.wrappedOracleLines = wrappedTextLines;
        card.rendererPreset = preset;
    }

    protected chooseFlavorText(card: MtgCard) {
        if (Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            const maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            const smallEnoughFlavorText = this.mtgDataRepository.getCreatureFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                const flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine)
                flavorTextLines.forEach(f => card.wrappedOracleLines.push("FT_" + f));
            }
        }
    }
}