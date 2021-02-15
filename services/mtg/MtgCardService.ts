import { MtgCard } from "../../dtos/mtg/MtgCard";
import { Parameter } from "../../dtos/Parameter";
import { MtgDataRepository } from "../../persistence/repositories/MtgDataRepository";
import { MtgCardRarity } from '../../dtos/mtg/MtgCardRarity';
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { Random } from '../../helpers/Random';

import fs = require("fs");

export class MtgCardService {

    private mtgDataRepository: MtgDataRepository

    constructor() {
        this.mtgDataRepository = new MtgDataRepository();
    }

    public generateCard(cardType: MtgCardType, cardRarity: MtgCardRarity, color: string): MtgCard {

        const card = new MtgCard();
        card.type = cardType;
        card.rarity = cardRarity;
        card.color = card.color;

        switch (cardType) {
            case MtgCardType.Creature:
                break;
            case MtgCardType.Instant:
                break;
            case MtgCardType.Sorcery:
                break;
            case MtgCardType.Enchantment:
                break;
            case MtgCardType.Planeswalker:
                break;
            case MtgCardType.Land:
                break;
        }

        // TODO move.
        const artPath = "assets/img/mtg/cards/creature/";
        const files = fs.readdirSync(artPath);
        let randomArtworkFile = Random.nextFromList(files);
        card.imageUrl = artPath + randomArtworkFile;

        return card;
    }
}