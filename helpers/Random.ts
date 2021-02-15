export class Random {

    static next(minInclusive: number, maxInclusive: number) : number {
        return minInclusive + Math.floor(Math.random() * ((maxInclusive - minInclusive) + 1));
    }

    static chance(number: number) : boolean {
        return Random.next(1, 100) >= number * 100;
    }

    static flipCoin() : boolean {
        return Random.next(0, 1) === 1;
    }

    static nextFromList(list: any[]): any {
        return list[Random.next(0, list.length - 1)];
    }

}