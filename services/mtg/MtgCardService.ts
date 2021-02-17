import { MtgCard } from "../../dtos/mtg/MtgCard";
import { MtgDataRepository } from "../../persistence/repositories/MtgDataRepository";
import { MtgCardRarity } from '../../dtos/mtg/MtgCardRarity';
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MtgCreatureGenerator } from './generators/MtgCreatureGenerator';
import { MtgAbilityService } from './MtgAbilityService';
import { MtgSyntaxResolver } from './MtgSyntaxResolver';
import { MtgOracleTextWrapperService } from './MtgOracleTextWrapperService';
import { MtgInstantSorceryGenerator } from './generators/MtgInstantSorceryGenerator';
import { MtgLandGenerator } from './generators/MtgLandGenerator';
import { Logger } from '../../helpers/Logger';

export class MtgCardService {

    private mtgCreatureGenerator: MtgCreatureGenerator;
    private mtgInstantSorceryGenerator: MtgInstantSorceryGenerator;
    private mtgLandGenerator: MtgLandGenerator;

    constructor(mtgDataRepository: MtgDataRepository,
        mtgAbilityService: MtgAbilityService,
        mtgSyntaxResolver: MtgSyntaxResolver,
        mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
        this.mtgCreatureGenerator = new MtgCreatureGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgInstantSorceryGenerator = new MtgInstantSorceryGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgLandGenerator = new MtgLandGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
    }

    public generateCard(cardType: MtgCardType, cardRarity: MtgCardRarity, color: string): MtgCard {

        let card = new MtgCard();
        card.type = cardType;
        card.rarity = cardRarity;
        card.rarityScore = [MtgCardRarity.Common, MtgCardRarity.Uncommon, MtgCardRarity.Rare, MtgCardRarity.Mythic].indexOf(cardRarity) + 1;
        card.color = color.toLowerCase();

        switch (cardType) {
            case MtgCardType.Creature:
                card = this.mtgCreatureGenerator.generate(card);
                break;
            case MtgCardType.Instant:
                card = this.mtgInstantSorceryGenerator.generate(card);
                break;
            case MtgCardType.Sorcery:
                card = this.mtgInstantSorceryGenerator.generate(card);
                break;
            case MtgCardType.Land:
                card = this.mtgLandGenerator.generate(card);
                break;
            default:
                throw "Not implemented";
        }

        return card;
    }
}