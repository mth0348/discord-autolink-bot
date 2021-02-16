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

export class MtgCreatureGenerator {

    constructor(
        private mtgDataRepository: MtgDataRepository,
        private mtgAbilityService: MtgAbilityService,
        private mtgSyntaxResolver: MtgSyntaxResolver,
        private mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
    }

    public generate(card: MtgCard): MtgCard {
        card.type = MtgCardType.Creature;

        card.subtype = card.subtype || this.mtgDataRepository.getSubtypes(Random.complex([{ value: 1, chance: 0.7 }, { value: 2, chance: 0.3 }], 1)).join(" ");
        card.isLegendary = card.isLegendary || Random.chance(0.25) && (card.rarity === MtgCardRarity.Rare || card.rarity === MtgCardRarity.Mythic);
        card.supertype = card.isLegendary ? "Legendary" : "";
        card.name = card.name || this.mtgDataRepository.getCreatureName(card.isLegendary);
        card.flavorText = "Ain't that something to flip your biscuit...";

        this.choosePower(card);
        this.chooseToughness(card);
        this.chooseKeywords(card);
        this.chooseAbilities(card);
        this.chooseArtwork(card);
        this.estimateCmc(card);
        this.resolveSyntax(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.manacost = this.chooseManacost(card.cmc, card.color);

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

    private chooseKeywords(card: MtgCard) {
        const keywordCount = Random.complex([
            { value: 0, chance: 0.31 },
            { value: 1, chance: 0.31 },
            { value: 2, chance: 0.31 + (card.rarityScore >= 3 ? 0.5 : 0) },
            { value: 3, chance: 0.03 + (card.rarityScore >= 4 ? 0.5 : 0) }
        ], 1);

        const keywords = this.mtgDataRepository.getKeywordsByColor(card.color.toLowerCase().split(''), keywordCount);
        card.oracle.keywords = keywords;
    }

    private chooseAbilities(card: MtgCard) {
        const abilityCount = Random.complex([
            { value: 0, chance: 0.25 + (card.rarityScore <= 1 ? 0.5 : 0) },
            { value: 1, chance: 0.50 },
            { value: 2, chance: 0.25 }
        ], 1);

        for (let i = 0; i < abilityCount; i++) {
            const abilityType = Random.complex([
                { value: MtgAbilityType.Activated, chance: 0.40 },
                { value: MtgAbilityType.Triggered, chance: 0.40 },
                { value: MtgAbilityType.Static, chance: 0.20 }
            ], 0);

            this.mtgAbilityService.generateAbility(card, abilityType);
        }

        card.oracle.abilities.sort((a, b) => { return a.type - b.type; });
    }

    private choosePower(card: MtgCard) {
        const power = Random.complex([
            { value: 1, chance: 0.15 + (card.rarityScore <= 1 ? 0.1 : 0) },
            { value: 2, chance: 0.20 + (card.rarityScore <= 1 ? 0.1 : 0) },
            { value: 3, chance: 0.20 + (card.rarityScore <= 2 ? 0.1 : 0) },
            { value: 4, chance: 0.15 },
            { value: 5, chance: 0.10 },
            { value: 6, chance: 0.10 + (card.rarityScore >= 3 ? 0.1 : 0) },
            { value: 7, chance: 0.05 + (card.rarityScore >= 3 ? 0.1 : 0) },
            { value: 8, chance: 0.05 + (card.rarityScore >= 3 ? 0.1 : 0) }
        ], Random.next(1, 4));
        card.power = power;
    }

    private chooseToughness(card: MtgCard) {
        const toughness = Random.complex([
            { value: 1, chance: 0.15 + (card.rarityScore <= 1 ? 0.1 : 0) },
            { value: 2, chance: 0.20 + (card.rarityScore <= 1 ? 0.1 : 0) },
            { value: 3, chance: 0.20 + (card.rarityScore <= 2 ? 0.1 : 0) },
            { value: 4, chance: 0.15 },
            { value: 5, chance: 0.10 },
            { value: 6, chance: 0.10 + (card.rarityScore >= 3 ? 0.1 : 0) },
            { value: 7, chance: 0.05 + (card.rarityScore >= 3 ? 0.1 : 0) },
            { value: 8, chance: 0.05 + (card.rarityScore >= 3 ? 0.1 : 0) }
        ], Random.next(1, 4));
        card.toughness = toughness;
    }

    private estimateCmc(card: MtgCard) {
        let totalScore = 0;

        totalScore += card.power / 2;
        totalScore += card.toughness / 2;

        card.oracle.keywords.forEach(k => totalScore += k.score);
        card.oracle.abilities.forEach(a => totalScore += a.getScore());

        // the higher the cmc, the more likely a reduction occurs. (min-cmc: 3)
        const minCmcForReduction = 3;
        const randomReduction = totalScore > minCmcForReduction ? Random.chance((totalScore - minCmcForReduction) / 10) ? 1 : 0 : 0;
        const mythicReduction = card.rarity === MtgCardRarity.Mythic ? Random.chance(0.33) ? 0.5 : 0.25 : 0;

        const roundedScore = Math.round(totalScore - randomReduction - mythicReduction);
        card.cmc = Math.max(1, Math.min(9, roundedScore));
    }

    private chooseArtwork(card: MtgCard) {
        const artPath = "assets/img/mtg/cards/creature/";
        const files = fs.readdirSync(artPath);
        let randomArtworkFile = Random.nextFromList(files);
        card.imageUrl = artPath + randomArtworkFile;
    }

    private resolveSyntax(card: MtgCard) {
        this.mtgSyntaxResolver.resolveSyntax(card);
    }

    private chooseManacost(cmc: number, colorString: string): string {
        if (colorString.length === 0) {
            return `X${Math.min(9, cmc)}`;
        }

        let manacost = "";
        let color = colorString.split("");

        // Mono color.
        if (color.length === 1) {
            if (cmc === 1) {
                manacost = `X${color[0]}`;
            } else if (cmc === 2) {
                let twoSymbols = Random.flipCoin();
                if (twoSymbols) {
                    manacost = `X${color[0]}X${color[0]}`;
                }
                else {
                    manacost = `X${Math.min(9, cmc - 1)}X${color[0]}`;
                }
            } else if (cmc === 3) {
                let threeSymbols = Random.chance(0.25);
                if (threeSymbols) {
                    return `X${color[0]}X${color[0]}X${color[0]}`;
                }

                let twoSymbols = Random.flipCoin();
                if (twoSymbols)
                    return `X1X${color[0]}${color[0]}`;

                return `X2X${color[0]}`;
            } else if (cmc > 3) {
                let twoSymbols = Random.flipCoin();
                if (twoSymbols)
                    return `X${Math.min(9, cmc - 2)}X${color[0]}X${color[0]}`;

                let threeSymbols = Random.chance(0.25);
                if (threeSymbols && cmc > 2)
                    return `X${Math.min(9, cmc - 3)}X${color[0]}X${color[0]}X${color[0]}`;

                manacost = `X${Math.min(9, cmc - 1)}X${color[0]}`;
            }
        }

        // Two colors.
        if (color.length === 2) {
            if (cmc === 1) {
                manacost = `X${color[0]}X${color[1]}`; // TODO zweites X wegnehmen
            } else if (cmc === 2) {
                manacost = `X${color[0]}X${color[1]}`;
            } else if (cmc === 3) {
                let threeSymbols = Random.next(0, 2); // 0 = none, 1 = first symbol twice, 2 = second symbol twice.
                switch (threeSymbols) {
                    case 0:
                        manacost = `X1X${color[0]}X${color[1]}`;
                        break;
                    case 1:
                        manacost = `X${color[0]}X${color[0]}X${color[1]}`;
                        break;
                    case 2:
                        manacost = `X${color[0]}X${color[1]}X${color[1]}`;
                        break;
                }
            } else if (cmc > 3) {
                let fourSymbols = Random.next(0, 3); // 0 = none, 1 = first symbol twice, 2 = second symbol twice, 3 = both symbol twice.
                switch (fourSymbols) {
                    case 0:
                        manacost = `X${Math.min(9, cmc - 2)}X${color[0]}X${color[1]}`;
                        break;
                    case 1:
                        manacost = `X${Math.min(9, cmc - 3)}X${color[0]}X${color[0]}X${color[1]}`;
                        break;
                    case 2:
                        manacost = `X${Math.min(9, cmc - 3)}X${color[0]}X${color[1]}X${color[1]}`;
                        break;
                    case 3:
                        manacost = `X${color[0]}X${color[0]}X${color[1]}X${color[1]}`;
                        if (cmc > 4) {
                            manacost = `X${Math.min(9, cmc - 4)}${manacost}`;
                        }
                        break;
                }
            }
        }

        // More than two colors.
        if (color.length >= 3) {
            if (cmc === 1) {
                manacost = `X${Random.nextFromList(color)}`;
            } else if (cmc === 2) {
                let rnd = Random.next(0, color.length - 2);
                manacost = `X${color[rnd]}X${color[rnd + 1]}`;
            } else if (cmc === 3) {
                manacost = `X${color[0]}X${color[1]}X${color[2]}`;
            } else if (cmc > 3) {
                manacost = `X${Math.min(9, cmc - 3)}X${color[0]}X${color[1]}X${color[2]}`;
            }
        }

        return manacost;
    }
}