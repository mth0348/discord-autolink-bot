import { MtgCard } from "../../dtos/mtg/MtgCard";
import { MtgDataRepository } from "../../persistence/repositories/MtgDataRepository";
import { MtgCardRarity } from '../../dtos/mtg/MtgCardRarity';
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MtgCreatureGenerator } from './generators/MtgCreatureGenerator';
import { MtgAbilityService } from './MtgAbilityService';

export class MtgCardService {

    private mtgDataRepository: MtgDataRepository
    private mtgCreatureGenerator: MtgCreatureGenerator;
    private mtgAbilityService: MtgAbilityService;

    constructor() {
        this.mtgDataRepository = new MtgDataRepository();
        this.mtgAbilityService = new MtgAbilityService(this.mtgDataRepository);
        this.mtgCreatureGenerator = new MtgCreatureGenerator(this.mtgDataRepository, this.mtgAbilityService);
    }

    public generateCard(cardType: MtgCardType, cardRarity: MtgCardRarity, color: string): MtgCard {

        let card = new MtgCard();
        card.type = cardType;
        card.rarity = cardRarity;
        card.color = color;

        // TODO Remove:
        cardType = MtgCardType.Creature;

        switch (cardType) {
            case MtgCardType.Creature:
                card = this.mtgCreatureGenerator.generate(card);
                break;
            // case MtgCardType.Instant:
            //     break;
            // case MtgCardType.Sorcery:
            //     break;
            // case MtgCardType.Enchantment:
            //     break;
            // case MtgCardType.Planeswalker:
            //     break;
            // case MtgCardType.Land:
            //     break;
        }

        // TODO remove:
        card.manacost = "X1XWXW";

        return card;
    }
}