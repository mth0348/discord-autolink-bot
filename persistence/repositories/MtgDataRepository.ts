import { Random } from '../../helpers/Random';
import { StringHelper } from '../../helpers/StringHelper';
import { MtgKeyword } from '../entities/mtg/MtgKeyword';
import { MtgPermanentCondition } from '../entities/mtg/MtgPermanentCondition';
import { MtgPermanentEvent } from '../entities/mtg/MtgPermanentEvent';
import { MtgPermanentStatics } from '../entities/mtg/MtgPermanentStatics';
import { MtgPermanentActivatedCost } from '../entities/mtg/MtgPermanentActivatedCost';
import { MtgInstantSorceryEvent } from '../entities/mtg/MtgInstantSorceryEvent';

import database = require('../../src/data/mtg.json');

export class MtgDataRepository {

    public getTypes(): string[] {
        return database.types;
    }

    public getPermanentTypes(): string[] {
        return database.permanentTypes;
    }

    public getSubtypes(count: number): string[] {
        if (count <= 0) return [];

        const list = database.subtypes;
        let result: string[] = [Random.nextFromList(list)];
        for (let i = 1; i < count - 1; i++) {
            const second = Random.nextFromList(list.filter(f => result.every(r => f !== r)));
            result.push(second);
        }
        return result;
    }

    public getArtifactCreatureSubtype(): string {
        return Random.nextFromList(database.subtypesArtifactCreatures);
    }

    public getKeywordsByColorAndType(colors: string[], type: string, count: number, simpleOnly: boolean = false): MtgKeyword[] {
        if (count <= 0) return [];

        const list = database.keywords
            .filter(k => k.types.some(t => t === type.toLowerCase()))
            .filter(k => colors.some(c => k.colorIdentity.indexOf(c.toLowerCase()) >= 0))
            .filter(k => !simpleOnly || (!k.hasCost && k.nameExtension.length === 0))
            .map(k => new MtgKeyword(k));

        if (list.length <= 0)
            return [];

        let result: MtgKeyword[] = [Random.nextFromList(list)];
        for (let i = 1; i < count - 1; i++) {
            const reducedList = list.filter(f => result.every(r => f !== r));
            if (reducedList.length > 0) {
                const second = Random.nextFromList(reducedList);
                result.push(second);
            }
        }
        return result;
    }

    public getPermanentConditions(): MtgPermanentCondition[] {
        return database.permanentConditions.map(x => new MtgPermanentCondition(x));
    }

    public getPermanentEvents(): MtgPermanentEvent[] {
        return database.permanentEvents.map(x => new MtgPermanentEvent(x));
    }

    public getPermanentStatics(): MtgPermanentStatics[] {
        return database.permanentStatics.map(x => new MtgPermanentStatics(x));
    }

    public getPermanentActivatedCosts(): MtgPermanentActivatedCost[] {
        return database.permanentActivatedCosts.map(x => new MtgPermanentActivatedCost(x));
    }

    public getInstantSorceryEvents(): MtgInstantSorceryEvent[] {
        return database.instantSorceryEvents.map(x => new MtgInstantSorceryEvent(x));
    }

    public getCreatureName(isLegendary: boolean): string {
        const name = Random.nextFromList(database.creatureTexts.names) + ", ";
        const adjective = Random.nextFromList(database.creatureTexts.adjectives) + " ";
        const noun = Random.nextFromList(database.creatureTexts.nouns);

        if (isLegendary) {
            if (Random.chance(0.3)) {
                return StringHelper.toCamelCase(name + "the " + adjective);
            }
            return StringHelper.toCamelCase(name + adjective + noun);
        } else {
            return StringHelper.toCamelCase(adjective + noun);
        }
    }

    public getLandName(isLegendary: boolean): string {
        const name = Random.nextFromList(database.landTexts.names) + ", ";
        const adjective = Random.nextFromList(database.landTexts.adjectives) + " ";
        const noun = Random.nextFromList(database.landTexts.nouns);
        const descriptor = Random.nextFromList(database.landTexts.descriptors);

        if (isLegendary) {
            return StringHelper.toCamelCase(name + adjective + descriptor);
        }

        if (Random.chance(0.5)) {
            /* "mountains of wisdom" */
            return StringHelper.capitalizeFirstChar(descriptor) + " of " + StringHelper.capitalizeFirstChar(noun);
        }

        /* "misty mountains" */
        return StringHelper.toCamelCase(adjective + descriptor);
    }

    public getCreatureFlavorText(maxCharacterLength: number): string {
        // sort descending by text length.
        return database.creatureTexts.flavors.sort((a, b) => b.length - a.length).find(f => f.length < maxCharacterLength);
    }

    public getLandFlavorText(maxCharacterLength: number): string {
        // sort descending by text length.
        return database.landTexts.flavors.sort((a, b) => b.length - a.length).find(f => f.length < maxCharacterLength);
    }

    public getSpellFlavorText(maxCharacterLength: number): string {
        // sort descending by text length.
        return database.spellTexts.flavors.sort((a, b) => b.length - a.length).find(f => f.length < maxCharacterLength);
    }

    public getPlaneswalkerName() {
        const name = Random.nextFromList(database.planeswalkerTexts.names) + ", ";
        const secondName = Random.nextFromList(database.planeswalkerTexts.names) + " ";
        const adjective = Random.nextFromList(database.creatureTexts.adjectives) + " ";
        const noun = Random.nextFromList(database.creatureTexts.nouns);

        if (Random.chance(0.3)) {
            return StringHelper.toCamelCase(name + "the " + adjective);
        }
        if (Random.chance(0.3)) {
            return StringHelper.toCamelCase(name + secondName);
        }
        return StringHelper.toCamelCase(name + adjective + noun);
    }

    public getInstantSorceryName() {
        const adjective = Random.nextFromList(database.spellTexts.adjectives) + " ";
        const noun = Random.nextFromList(database.spellTexts.nouns);

        return StringHelper.toCamelCase(adjective + noun);
    }

    public getEnchantmentName() {
        const adjective = Random.nextFromList(database.spellTexts.adjectives) + " ";
        const noun = Random.nextFromList(database.enchantmentTexts.nouns);

        return StringHelper.toCamelCase(adjective + noun);
    }
}