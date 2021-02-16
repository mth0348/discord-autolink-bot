import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { MtgCardType } from '../../../dtos/mtg/MtgCardType';
import { Random } from '../../../helpers/Random';
import { MtgCardRarity } from '../../../dtos/mtg/MtgCardRarity';
import { MtgAbilityType } from '../../../dtos/mtg/MtgAbilityType';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';

import fs = require("fs");
import { MtgHelper } from '../../../helpers/mtg/MtgHelper';
import { Logger } from '../../../helpers/Logger';
import { LogType } from '../../../dtos/LogType';
import { MtgStaticAbility } from '../../../dtos/mtg/abilities/MtgStaticAbility';

export class MtgInstantSorceryGenerator {

    constructor(
        private mtgDataRepository: MtgDataRepository,
        private mtgAbilityService: MtgAbilityService,
        private mtgSyntaxResolver: MtgSyntaxResolver,
        private mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
    }

    public generate(card: MtgCard): MtgCard {

        card.subtype = Random.chance(0.05) ? "Arcane" : undefined;
        card.name = card.name || this.mtgDataRepository.getInstantSorceryName();

        this.chooseAbilities(card);
        this.chooseArtwork(card);
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper.getDominantColor(card);
        card.manacost = MtgHelper.getManacost(card.cmc, card.color);

        return card;
    }

    private wrapTextForRenderer(card: MtgCard) {
        const preset = this.mtgOracleTextWrapperService.calculateTextWrapPreset(card.oracle);
        const wrappedTextLines = this.mtgOracleTextWrapperService.wordWrapAllOracleText(card.oracle, preset);
        card.wrappedOracleLines = wrappedTextLines;
        card.rendererPreset = preset;
    }

    private chooseFlavorText(card: MtgCard) {
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

    private estimateCmc(card: MtgCard) {
        let totalScore = 0;

        Logger.log("Started card cost estimation:", LogType.CostEstimation);

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

    private chooseArtwork(card: MtgCard) {
        const artPath = "assets/img/mtg/cards/spell/";
        const files = fs.readdirSync(artPath);
        let randomArtworkFile = Random.nextFromList(files);
        card.imageUrl = artPath + randomArtworkFile;
    }

    private resolveSyntax(card: MtgCard): void {
        this.mtgSyntaxResolver.resolveSyntax(card);
    }
}