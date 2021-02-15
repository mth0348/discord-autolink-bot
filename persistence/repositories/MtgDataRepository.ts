import { Random } from '../../helpers/Random';
import { StringHelper } from '../../helpers/StringHelper';
import database = require('../../src/data/mtg.json');
import { Keyword } from '../entities/mtg/Keyword';

export class MtgDataRepository {

    public getTypes() : string[] {
        return database.types;
    }

    public getPermanentTypes() : string[] {
        return database.permanentTypes;
    }

    public getSubtypes() : string[] {
        return database.subtypes;
    }

    public getKeywords() : Keyword[] {
        return database.keywords.map(k => new Keyword(k));
    }

    public getCreatureName(isLegendary: boolean) : string {
        const name = database.creatureNames.names[Random.next(0, database.creatureNames.names.length - 1)] + ", ";
        const adjective = database.creatureNames.adjectives[Random.next(0, database.creatureNames.adjectives.length - 1)] + " ";
        const noun = database.creatureNames.nouns[Random.next(0, database.creatureNames.nouns.length - 1)]

        if (isLegendary) {
            if (Random.chance(0.3)) {
                return StringHelper.toCamelCase(name + "the " + adjective);
            }
            return StringHelper.toCamelCase(name + adjective + noun);
        } else {
            return StringHelper.toCamelCase(adjective + noun);
        }
    }

    public getPlaneswalkerName() {
        const name = database.planeswalkerNames.names[Random.next(0, database.planeswalkerNames.names.length - 1)] + ", ";
        const secondName = database.planeswalkerNames.names[Random.next(0, database.planeswalkerNames.names.length - 1)] + " ";
        const adjective = database.creatureNames.adjectives[Random.next(0, database.creatureNames.adjectives.length - 1)] + " ";
        const noun = database.creatureNames.nouns[Random.next(0, database.creatureNames.nouns.length - 1)]

        if (Random.chance(0.3)) {
            return StringHelper.toCamelCase(name + "the " + adjective);
        }
        if (Random.chance(0.3)) {
            return StringHelper.toCamelCase(name + secondName);
        }
        return StringHelper.toCamelCase(name + adjective + noun);
    }

    public getInstantSorceryName() {
        const adjective = database.spellNames.adjectives[Random.next(0, database.spellNames.adjectives.length - 1)] + " ";
        const noun = database.spellNames.nouns[Random.next(0, database.spellNames.nouns.length - 1)];

        return StringHelper.toCamelCase(adjective + noun);
    }

    public getEnchantmentName() {
        const adjective = database.spellNames.adjectives[Random.next(0, database.spellNames.adjectives.length - 1)] + " ";
        const noun = database.enchantmentNames.nouns[Random.next(0, database.enchantmentNames.nouns.length - 1)];

        return StringHelper.toCamelCase(adjective + noun);
    }
}