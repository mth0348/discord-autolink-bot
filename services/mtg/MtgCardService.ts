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
import { MtgPlaneswalkerGenerator } from "./generators/MtgPlaneswalkerGenerator";
import { Logger } from '../../helpers/Logger';
import { LogType } from "../../dtos/LogType";
import { MtgEnchantmentGenerator } from './generators/MtgEnchantmentGenerator';
import { Random } from '../../helpers/Random';
import { MtgArtifactGenerator } from './generators/MtgArtifactGenerator';

export class MtgCardService {

    private mtgCreatureGenerator: MtgCreatureGenerator;
    private mtgInstantSorceryGenerator: MtgInstantSorceryGenerator;
    private mtgLandGenerator: MtgLandGenerator;
    private mtgPlaneswalkerGenerator: MtgPlaneswalkerGenerator;
    private mtgEnchantmentGenerator: MtgEnchantmentGenerator;
    private mtgArtifactGenerator: MtgArtifactGenerator;

    constructor(mtgDataRepository: MtgDataRepository,
        mtgAbilityService: MtgAbilityService,
        mtgSyntaxResolver: MtgSyntaxResolver,
        mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
        this.mtgCreatureGenerator = new MtgCreatureGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgInstantSorceryGenerator = new MtgInstantSorceryGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgLandGenerator = new MtgLandGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgPlaneswalkerGenerator = new MtgPlaneswalkerGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgEnchantmentGenerator = new MtgEnchantmentGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
        this.mtgArtifactGenerator = new MtgArtifactGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
    }

    public generateCard(cardType: MtgCardType, cardRarity: MtgCardRarity, color: string): MtgCard {

        let card = new MtgCard();
        card.type = cardType;
        card.rarity = cardRarity;
        card.rarityScore = [MtgCardRarity.Common, MtgCardRarity.Uncommon, MtgCardRarity.Rare, MtgCardRarity.Mythic].indexOf(cardRarity) + 1;
        card.color = color.toLowerCase();

        switch (cardType) {
            case MtgCardType.Creature:
            case MtgCardType.ArtifactCreature:
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
            case MtgCardType.Planeswalker:
                card = this.mtgPlaneswalkerGenerator.generate(card);
                break;
            case MtgCardType.Aura:
            case MtgCardType.Enchantment:
                card = this.mtgEnchantmentGenerator.generate(card);
                break;
            case MtgCardType.Artifact:
                const isArtifactCreature = Random.chance(0.10);
                if (isArtifactCreature) {
                    card.type = MtgCardType.ArtifactCreature;
                    card = this.mtgCreatureGenerator.generate(card);
                } else {
                    card = this.mtgArtifactGenerator.generate(card);
                }
                break;
            case MtgCardType.Equipment:
                card = this.mtgArtifactGenerator.generate(card);
                break;
            default:
                throw "Not implemented";
        }

        Logger.log(`Generated card for params "type: ${cardType}, rarity: ${cardRarity}, color: ${color}":`);
        card.toLogString().forEach(l => Logger.log(l, LogType.Verbose));
        Logger.log("Card Object: ", LogType.Verbose, card);

        return card;
    }
}