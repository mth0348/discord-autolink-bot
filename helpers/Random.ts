export class Random {

    public static next(minInclusive: number, maxInclusive: number) : number {
        return minInclusive + Math.floor(Math.random() * ((maxInclusive - minInclusive) + 1));
    }

    public static chance(number: number) : boolean {
        return Random.next(1, 100) >= number * 100;
    }

    public static flipCoin() : boolean {
        return Random.next(0, 1) === 1;
    }

    public static nextFromList(list: any[]): any {
        return list[Random.next(0, list.length - 1)];
    }

    // Use: Random.complex([ { value: "XX", chance: 0.2 }, { value: "YY", chance: 0.8 } ])
    // Does not need to add up to 1.0. Can return null.
    public static complex(chances: any[], fallback: any): any {
        let found = false;
        let foundValue = fallback;

        chances.forEach(chanceSet => {
            if (!found && Random.chance(chanceSet.chance)) {
                found = true;
                foundValue = chanceSet.value;
            }
        });
        return foundValue;
    }

}