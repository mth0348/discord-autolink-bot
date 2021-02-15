import { MtgCard } from "../../dtos/mtg/MtgCard";
import { MtgDataRepository } from "../../persistence/repositories/MtgDataRepository";
import { MtgCardRarity } from '../../dtos/mtg/MtgCardRarity';
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MtgCreatureGenerator } from './generators/MtgCreatureGenerator';
import { MtgAbilityService } from './MtgAbilityService';
import { MtgSyntaxResolver } from './MtgSyntaxResolver';

export class MtgCardService {

    private mtgCreatureGenerator: MtgCreatureGenerator;

    constructor(private mtgDataRepository: MtgDataRepository) {
        const mtgAbilityService = new MtgAbilityService(mtgDataRepository);
        const mtgSyntaxResolver = new MtgSyntaxResolver(mtgDataRepository);
        this.mtgCreatureGenerator = new MtgCreatureGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver);
    }

    public generateCard(cardType: MtgCardType, cardRarity: MtgCardRarity, color: string): MtgCard {

        let card = new MtgCard();
        card.type = cardType;
        card.rarity = cardRarity;
        card.rarityScore = [ MtgCardRarity.Common, MtgCardRarity.Uncommon, MtgCardRarity.Rare, MtgCardRarity.Mythic ].indexOf(cardRarity) + 1;
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

        return card;
    }
}