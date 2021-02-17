import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { Random } from '../../../helpers/Random';
import { MtgCardRarity } from '../../../dtos/mtg/MtgCardRarity';
import { MtgAbilityType } from '../../../dtos/mtg/MtgAbilityType';
import { MtgAbilityService } from '../MtgAbilityService';
import { MtgSyntaxResolver } from '../MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from '../MtgOracleTextWrapperService';
import { MtgHelper } from '../../../helpers/mtg/MtgHelper';
import { MtgBaseGenerator } from './MtgBaseGenerator';

export class MtgCreatureGenerator extends MtgBaseGenerator {

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
        card.name = card.name || this.mtgDataRepository.getCreatureName(card.isLegendary);

        const isArtifactCreature = MtgHelper.isExactlyColor(card.color, "c");

        this.chooseSubtypes(card, isArtifactCreature);
        this.chooseKeywords(card);
        this.chooseAbilities(card);
        this.chooseArtwork(card, isArtifactCreature ? "artifactcreature" : "creature");
        this.choosePower(card);
        this.chooseToughness(card);
        this.matchPowerToughnessToColor(card);
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper.getManacost(card.cmc, card.color);

        return card;
    }

    private chooseSubtypes(card: MtgCard, isArtifactCreature: boolean) {
        if (!card.subtype) {
            if (isArtifactCreature) {
                card.subtype = this.mtgDataRepository.getArtifactCreatureSubtype();
            } else {
                const subtypeCount = Random.complex([
                    { value: 1, chance: 0.7 },
                    { value: 2, chance: 0.3 }
                ], 1);
                card.subtype = this.mtgDataRepository.getSubtypes(subtypeCount).join(" ");
            }
        }
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

    private matchPowerToughnessToColor(card: MtgCard) {
        const p = card.power;
        const t = card.toughness;

        // ensure W/U can't have higher p than t, and R has increased chance to have more p than t.
        if (MtgHelper.isExactlyColor(card.color, "w") || MtgHelper.isExactlyColor(card.color, "u")) {
            card.power = Math.min(p, t);
            card.toughness = Math.max(p, t);
        }
        if ((card.color.indexOf("w") >= 0 || card.color.indexOf("u") >= 0) && Random.chance(0.3)) {
            card.power = Math.min(p, t);
            card.toughness = Math.max(p, t);
        }
        if (card.color.indexOf("r") >= 0 && Random.chance(0.5)) {
            card.power = Math.max(p, t);
            card.toughness = Math.min(p, t);
        }

        // bring p/t closer to each other, if distance is large enough.
        if (Random.chance(0.5)) {
            let dif = card.power - card.toughness;
            if (dif > 3) {
                card.power -= 1;
                card.toughness += 1;
            }
            if (dif < -3) {
                card.power += 1;
                card.toughness -= 1;
            }
        }

        // special rule: persist.
        if (card.oracle.keywords.some(k => k.name === "Persist")) {
            card.toughness = Math.max(card.toughness, 2);
        }
    }

    private chooseKeywords(card: MtgCard) {
        const keywordCount = Random.complex([
            { value: 0, chance: 0.25 },
            { value: 1, chance: 0.35 },
            { value: 2, chance: 0.35 + (card.rarityScore >= 3 ? 0.2 : 0) },
            { value: 3, chance: 0.05 + (card.rarityScore >= 4 ? 0.2 : 0) }
        ], card.rarityScore >= 4 ? 1 : 0);

        const keywords = this.mtgDataRepository.getKeywordsByColorAndType(card.color.split(''), card.type, keywordCount);
        card.oracle.keywords = keywords;

        // special rule: shapeshifter.
        if (keywords.some(k => k.name === "Changeling")) {
            card.subtype = "Shapeshifter";
        }
    }

    private chooseAbilities(card: MtgCard) {
        if (card.rarity === MtgCardRarity.Common) {
            return;
        }

        const abilityCount = Random.complex([
            { value: 0, chance: 0.25 },
            { value: 1, chance: 0.50 + (card.rarityScore <= 2 ? -0.2 : 0.2) },
            { value: 2, chance: 0.25 + (card.rarityScore <= 2 ? -1.0 : 0.2) }
        ], 0);

        for (let i = 0; i < abilityCount; i++) {
            const abilityType = Random.complex([
                { value: MtgAbilityType.Activated, chance: 0.40 },
                { value: MtgAbilityType.Triggered, chance: 0.40 },
                { value: MtgAbilityType.Static, chance: 0.20 }
            ], 0);

            this.generateAbility(card, abilityType);
        }

        card.oracle.abilities.sort((a, b) => { return a.type - b.type; });
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

    private chooseFlavorText(card: MtgCard) {
        if (Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            const maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            const smallEnoughFlavorText = this.mtgDataRepository.getCreatureFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                const flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine)
                flavorTextLines.forEach(f => card.wrappedOracleLines.push("FT_" + f));
            }
        }
    }
}