import { MtgCard } from "../MtgCard";

export interface MtgParsable {

    parsedText: string;

    parserValue: number;

    getText(card: MtgCard): string;

    getContext(): string;

}
