import { MtgDataRepository } from '../../../domain/repositories/MtgDataRepository';
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
import { MtgKeyword } from '../../../domain/models/mtg/MtgKeyword';
import { MtgCardType } from '../../../dtos/mtg/MtgCardType';

export class MtgEnchantmentGenerator extends MtgBaseGenerator {

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
        card.name = card.name || this.mtgDataRepository.getEnchantmentName();

        const isAura = Random.chance(0.3) || card.type === MtgCardType.Aura;
        card.type = MtgCardType.Enchantment; /* aura is also an enchantment */

        this.chooseSubtypes(card, isAura);
        this.chooseAbilities(card, isAura);
        this.chooseArtwork(card, isAura ? "aura" : "enchantment");
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper.getManacost(card.cmc, card.color);

        return card;
    }

    private chooseSubtypes(card: MtgCard, isAura: boolean) {
        if (isAura) {
            card.subtype = "Aura";
        }
    }

    private chooseAbilities(card: MtgCard, isAura: boolean) {

        const abilityCount = Random.complex([
            { value: 1, chance: 0.50 },
            { value: 2, chance: 0.50 + (card.rarityScore <= 2 ? -1.0 : 0.0) }
        ], 1);

        if (isAura) {

            this.mtgAbilityService.generateAuraAbility(card, -99, +99);
            const a1 = card.oracle.abilities[0] as MtgAuraAbility;

            card.oracle.keywords.push(new MtgKeyword({
                name: "Enchant " + a1.effect.auraType + (a1.effect.isForOpponent ? " an opponent controls" : ""),
                score: 0,
                colorIdentity: a1.effect.colorIdentity,
                nameExtension: "",
                hasCost: false,
                isTop: true
            }));

            a1.effect.text = "Enchanted " + a1.effect.auraType + " " + a1.effect.text;

            if (abilityCount === 2) {
                this.mtgAbilityService.generateAuraAbility(card, -99, +99, a1.effect);
                const a2 = card.oracle.abilities[1] as MtgAuraAbility;

                a1.combine(a2);
                card.oracle.abilities = [a1];
            }

        } else {

            for (let i = 0; i < abilityCount; i++) {
                const abilityType = Random.complex([
                    { value: MtgAbilityType.Activated, chance: 0.25 },
                    { value: MtgAbilityType.Triggered, chance: 0.25 },
                    { value: MtgAbilityType.Static, chance: 0.50 }
                ], 0);

                this.generateEnchantmentAbility(card, abilityType);
            }
        }

        card.oracle.abilities.sort((a, b) => { return a.type - b.type; });
    }

    private generateEnchantmentAbility(card: MtgCard, abilityType: MtgAbilityType): boolean {

        switch (abilityType) {
            case MtgAbilityType.Activated:
                return this.mtgAbilityService.generateActivatedAbility(card, 0, +99, false /* no tap symbol */);

            case MtgAbilityType.Triggered:
                return this.mtgAbilityService.generateTriggeredAbility(card, 0, +99);

            case MtgAbilityType.Static:
                return this.mtgAbilityService.generateStaticAbility(card, 0, +99);
        }
    }

    private chooseFlavorText(card: MtgCard) {
        if (Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            const maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            const smallEnoughFlavorText = this.mtgDataRepository.getSpellFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                const flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine)
                flavorTextLines.forEach(f => card.wrappedOracleLines.push("FT_" + f));
            }
        }
    }
}