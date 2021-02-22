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
import { MtgAuraAbility } from '../../../dtos/mtg/abilities/MtgAuraAbility';
import { MtgKeyword } from '../../../persistence/entities/mtg/MtgKeyword';
import { MtgCardType } from '../../../dtos/mtg/MtgCardType';

export class MtgArtifactGenerator extends MtgBaseGenerator {

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

        card.color = "c";

        const isEquipment = Random.chance(0.33) || card.type === MtgCardType.Equipment;
        card.name = card.name || this.mtgDataRepository.getArtifactName(card.isLegendary, isEquipment);

        card.type = MtgCardType.Artifact;

        this.chooseSubtypes(card, isEquipment);
        this.chooseAbilities(card, isEquipment);
        this.chooseArtwork(card, isEquipment ? "equipment" : "artifact");
        this.resolveSyntax(card);

        // remove equip cost from formula.
        if (isEquipment) card.oracle.keywords[0].score = 0;

        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper.getManacost(card.cmc, card.color);

        return card;
    }

    private chooseSubtypes(card: MtgCard, isEquipment: boolean) {
        if (isEquipment) {
            card.subtype = "Equipment";
        }
    }

    private chooseAbilities(card: MtgCard, isEquipment: boolean) {

        const abilityCount = Random.complex([
            { value: 1, chance: 0.50 },
            { value: 2, chance: 0.50 + (card.rarityScore <= 2 ? -1.0 : 0.0) }
        ], 1);

        if (isEquipment) {

            this.mtgAbilityService.generateEquipmentAbility(card, -99, +99);
            const a1 = card.oracle.abilities[0] as MtgAuraAbility;

            card.oracle.keywords.push(new MtgKeyword({
                name: "Equip",
                score: a1.getScore(),
                colorIdentity: a1.effect.colorIdentity,
                nameExtension: "",
                hasCost: true,
                isTop: false
            }));

            a1.effect.text = "Equipped " + a1.effect.auraType + " " + a1.effect.text;

            if (abilityCount === 2) {
                this.mtgAbilityService.generateEquipmentAbility(card, -99, +99, a1.effect);
                const a2 = card.oracle.abilities[1] as MtgAuraAbility;

                a1.combine(a2);
                card.oracle.abilities = [a1];
            }

        } else {

            for (let i = 0; i < abilityCount; i++) {
                const abilityType = Random.complex([
                    { value: MtgAbilityType.Activated, chance: 0.60 },
                    { value: MtgAbilityType.Triggered, chance: 0.20 },
                    { value: MtgAbilityType.Static, chance: 0.20 }
                ], 0);

                this.generateArtifactAbility(card, abilityType);
            }
        }

        card.oracle.abilities.sort((a, b) => { return a.type - b.type; });
    }

    private generateArtifactAbility(card: MtgCard, abilityType: MtgAbilityType): boolean {

        switch (abilityType) {
            case MtgAbilityType.Activated:
                return this.mtgAbilityService.generateActivatedAbility(card, 0, +99, true, true /* enforce tap symbol */);

            case MtgAbilityType.Triggered:
                return this.mtgAbilityService.generateTriggeredAbility(card, 0, +99);

            case MtgAbilityType.Static:
                return this.mtgAbilityService.generateStaticAbility(card, 0, +99);
        }
    }

    private chooseFlavorText(card: MtgCard) {
        if (Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            const maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            const smallEnoughFlavorText = this.mtgDataRepository.getArtifactFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                const flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine)
                flavorTextLines.forEach(f => card.wrappedOracleLines.push("FT_" + f));
            }
        }
    }
}