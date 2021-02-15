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

        return card;
    }

    private chooseKeywords(card: MtgCard) {
        const keywordCount = Random.complex([
            { value: 0, chance: 0.47 },
            { value: 1, chance: 0.25 },
            { value: 2, chance: 0.25 },
            { value: 3, chance: 0.03 }
        ], 0);

        const keywords = this.mtgDataRepository.getKeywordsByColor(card.color.toLowerCase().split(''), keywordCount);
        card.oracle.keywords = keywords;
    }

    private chooseAbilities(card: MtgCard) {
        const abilityCount = Random.complex([
            { value: 0, chance: 0.00 }, // TODO
            { value: 1, chance: 0.50 },
            { value: 2, chance: 0.25 }
        ], 0);

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

    private chooseArtwork(card: MtgCard) {
        const artPath = "assets/img/mtg/cards/creature/";
        const files = fs.readdirSync(artPath);
        let randomArtworkFile = Random.nextFromList(files);
        card.imageUrl = artPath + randomArtworkFile;
    }
}