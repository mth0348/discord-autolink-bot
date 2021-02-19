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
import { MtgActivatedAbility } from '../../../dtos/mtg/abilities/MtgActivatedAbility';
import { MtgPermanentActivatedCost } from '../../../persistence/entities/mtg/MtgPermanentActivatedCost';
import { MtgPermanentEvent } from '../../../persistence/entities/mtg/MtgPermanentEvent';
import { MtgActivatedPwAbility } from '../../../dtos/mtg/abilities/MtgActivatedPwAbility';

export class MtgPlaneswalkerGenerator extends MtgBaseGenerator {

    constructor(
        mtgDataRepository: MtgDataRepository,
        mtgAbilityService: MtgAbilityService,
        mtgSyntaxResolver: MtgSyntaxResolver,
        mtgOracleTextWrapperService: MtgOracleTextWrapperService) {
        super(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService);
    }

    public generate(card: MtgCard): MtgCard {

        card.isLegendary = true;
        card.supertype = "Legendary";
        card.name = card.name || this.mtgDataRepository.getPlaneswalkerName();
        card.rarity = Random.chance(0.5) ? MtgCardRarity.Rare : MtgCardRarity.Mythic;

        this.chooseSubtypes(card);
        this.chooseAbilities(card);
        this.chooseArtwork(card, 'planeswalker');
        // this.chooseStartingLoyalty(card);
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        card.color = MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper.getManacost(card.cmc, card.color);

        return card;
    }

    protected wrapTextForRenderer(card: MtgCard) {
        const preset = this.mtgOracleTextWrapperService.calculatePlaneswalkerTextWrapPreset(card.oracle);
        const wrappedTextLines = this.mtgOracleTextWrapperService.wordWrapAllPlaneswalkerOracleText(card.oracle, preset.maxCharactersPerLine - 4);
        card.wrappedOracleLines = wrappedTextLines;
        card.rendererPreset = MtgOracleTextWrapperService.PRESET_TINY;
    }

    private chooseSubtypes(card: MtgCard) {
        // first word of name.
        card.subtype = card.name.split(",")[0].split(" ")[0];
    }

    private chooseAbilities(card: MtgCard) {

        card.oracle.abilities.push(new MtgActivatedPwAbility(new MtgPermanentActivatedCost({
            text: "+4",
            score: 4,
            colorIdentity: "r"
        }), new MtgPermanentEvent({
            text: "Add XbXr",
            score: 0,
            colorIdentity: "r"
        })));

        card.oracle.abilities.push(new MtgActivatedPwAbility(new MtgPermanentActivatedCost({
            text: "-1",
            score: -1,
            colorIdentity: "b"
        }), new MtgPermanentEvent({
            text: "Destroy target creature, then exile a card from your hand",
            score: 0,
            colorIdentity: "b"
        })));

        card.oracle.abilities.push(new MtgActivatedPwAbility(new MtgPermanentActivatedCost({
            text: "-8",
            score: -8,
            colorIdentity: "b"
        }), new MtgPermanentEvent({
            text: "Each opponent sacrifices a create, discards a card, then (self) deals (number2) damage to each opponent",
            score: 0,
            colorIdentity: "b"
        })));
    }
}