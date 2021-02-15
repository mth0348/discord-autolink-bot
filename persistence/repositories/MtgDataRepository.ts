import { Random } from '../../helpers/Random';
import { StringHelper } from '../../helpers/StringHelper';
import { MtgKeyword } from '../entities/mtg/MtgKeyword';
import { MtgPermanentCondition } from '../entities/mtg/MtgPermanentCondition';

import database = require('../../src/data/mtg.json');
import { MtgPermanentEvent } from '../entities/mtg/MtgPermanentEvent';
import { MtgPermanentStatics } from '../entities/mtg/MtgPermanentStatics';
import { MtgPermanentActivatedCost } from '../entities/mtg/MtgPermanentActivatedCost';
import { MtgInstantSorceryEvent } from '../entities/mtg/MtgInstantSorceryEvent';

export class MtgDataRepository {

    public getTypes(): string[] {
        return database.types;
    }

    public getPermanentTypes(): string[] {
        return database.permanentTypes;
    }

    public getSubtypes(count: number): string[] {
        const list = database.subtypes;
        let result: string[] = [ Random.nextFromList(list) ];
        for (let i = 1; i < count - 1; i++) {
            const second = Random.nextFromList(list.filter(f => result.every(r => f !== r)));
            result.push(second);
        }
        return result;
    }

    public getKeywords(count: number): MtgKeyword[] {
        const list = database.keywords.map(k => new MtgKeyword(k));
        let result: MtgKeyword[] = [ Random.nextFromList(list) ];
        for (let i = 1; i < count - 1; i++) {
            const second = Random.nextFromList(list.filter(f => result.every(r => f !== r)));
            result.push(second);
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