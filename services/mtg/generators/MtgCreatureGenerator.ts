import { MtgDataRepository } from '../../../persistence/repositories/MtgDataRepository';
import { MtgCard } from '../../../dtos/mtg/MtgCard';
import { MtgCardType } from '../../../dtos/mtg/MtgCardType';
import { Random } from '../../../helpers/Random';
import { MtgCardRarity } from '../../../dtos/mtg/MtgCardRarity';
import { MtgAbilityType } from '../../../dtos/mtg/MtgAbilityType';
import { MtgAbilityService } from '../MtgAbilityService';

import fs = require("fs");

export class MtgCreatureGenerator {

    constructor(private mtgDataRepository: MtgDataRepository, private mtgAbilityService: MtgAbilityService) {
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

        this.estimateManacost(card);
        // this.resolveSyntax(card);

        return card;
    }

    private chooseKeywords(card: MtgCard) {
        const keywordCount = Random.complex([
            { value: 0, chance: 0.31 },
            { value: 1, chance: 0.31 },
            { value: 2, chance: 0.31 },
            { value: 3, chance: 0.03 }
        ], 1);

        const keywords = this.mtgDataRepository.getKeywordsByColor(card.color.toLowerCase().split(''), keywordCount);
        card.oracle.keywords = keywords;
    }

    private chooseAbilities(card: MtgCard) {
        const abilityCount = Random.complex([
            { value: 0, chance: 0.00 }, // TODO
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
            { value: 1, chance: 0.15 },
            { value: 2, chance: 0.20 },
            { value: 3, chance: 0.20 },
            { value: 4, chance: 0.15 },
            { value: 5, chance: 0.10 },
            { value: 6, chance: 0.10 },
            { value: 7, chance: 0.05 },
            { value: 8, chance: 0.05 }
        ], Random.next(1, 4));
        card.power = power;
    }

    private chooseToughness(card: MtgCard) {
        const toughness = Random.complex([
            { value: 1, chance: 0.15 },
            { value: 2, chance: 0.20 },
            { value: 3, chance: 0.20 },
            { value: 4, chance: 0.15 },
            { value: 5, chance: 0.10 },
            { value: 6, chance: 0.10 },
            { value: 7, chance: 0.05 },
            { value: 8, chance: 0.05 }
        ], Random.next(1, 4));
        card.toughness = toughness;
    }

    private estimateManacost(card: MtgCard) {
        let totalScore = 0;

        totalScore += card.power / 2;
        console.log("power: totalScore += " + card.power / 2);
        totalScore += card.toughness / 2;
        console.log("toughness: totalScore += " + card.toughness / 2);

        card.oracle.keywords.forEach(k => { totalScore += k.score; console.log("keyword: totalScore += " + k.score); } );
        card.oracle.abilities.forEach(a => { totalScore += a.getScore(); console.log("ability: totalScore += " + a.getScore()); });

        console.log("totalScore = " + totalScore);

        // the higher the cmc, the more likely a reduction occurs. (min-cmc: 3)
        const minCmcForReduction = 3;
        const randomReduction = totalScore > minCmcForReduction ? Random.chance((totalScore - minCmcForReduction) / 10) ? 1 : 0 : 0;
        console.log("random reduction = " + randomReduction);

        const mythicReduction = card.rarity === MtgCardRarity.Mythic ? Random.chance(0.33) ? 0.5 : 0.25 : 0;
        console.log("mythic reduction = " + mythicReduction);

        card.cmc = Math.max(1, Math.min(9, Math.round(totalScore) - randomReduction - mythicReduction ));
        console.log("cmc = " + card.cmc);
    }

    private chooseArtwork(card: MtgCard) {
        const artPath = "assets/img/mtg/cards/creature/";
        const files = fs.readdirSync(artPath);
        let randomArtworkFile = Random.nextFromList(files);
        card.imageUrl = artPath + randomArtworkFile;
    }
}