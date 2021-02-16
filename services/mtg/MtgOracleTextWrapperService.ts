import { MtgOracleText } from '../../dtos/mtg/MtgOracleText';
import { MtgOracleTextWrapPreset } from '../../dtos/mtg/MtgOracleTextWrapPreset';

export class MtgOracleTextWrapperService {

    public static PRESET_LARGE: MtgOracleTextWrapPreset = { fontSize: 28, maxCharactersPerLine: 41, maxLines: 7, lineDifInPixel: 4, };
    public static PRESET_MEDIUM: MtgOracleTextWrapPreset = { fontSize: 26, maxCharactersPerLine: 45, maxLines: 7, lineDifInPixel: 5 };
    public static PRESET_SMALL: MtgOracleTextWrapPreset = { fontSize: 23, maxCharactersPerLine: 50, maxLines: 8, lineDifInPixel: 4 };
    public static PRESET_TINY: MtgOracleTextWrapPreset = { fontSize: 22, maxCharactersPerLine: 52, maxLines: 99, lineDifInPixel: 4 };

    private presets: MtgOracleTextWrapPreset[] = [
        /* order is important */
        MtgOracleTextWrapperService.PRESET_LARGE,
        MtgOracleTextWrapperService.PRESET_MEDIUM,
        MtgOracleTextWrapperService.PRESET_SMALL,
        MtgOracleTextWrapperService.PRESET_TINY,
    ];

    public calculateTextWrapPreset(oracle: MtgOracleText): MtgOracleTextWrapPreset {

        let okPreset: MtgOracleTextWrapPreset = null;

        this.presets.forEach(preset => {
            const wrappedOracle = this.wordWrapAllOracleText(oracle, preset);
            if (okPreset == null && wrappedOracle.length <= preset.maxLines) {
                okPreset = preset;
            }
        });

        return okPreset;
    }

    public wordWrapAllOracleText(oracle: MtgOracleText, preset: MtgOracleTextWrapPreset): any {
        const lines: string[] = [];

        // only keywords WITHOUT cost.
        if (oracle.keywords.length > 0) {
            // separate with and without name extension as well.
            let keywordTexts = oracle.keywords.filter(k => !k.hasCost && k.nameExtension.length > 0).map(k => k.parsedText);
            keywordTexts.forEach(line => { lines.push(line.trim()); lines.push(""); });

            let keywordText = oracle.keywords.filter(k => !k.hasCost && k.nameExtension.length === 0).map(k => k.parsedText).join(", ");
            let keywordLines = this.wordWrapText(keywordText, preset.maxCharactersPerLine);
            keywordLines.forEach(line => lines.push(line.trim()));
            lines.push("");
        }

        if (oracle.abilities.length > 0) {
            const abilityText = oracle.abilities[0].parsedText;
            const ability1Lines = this.wordWrapText(abilityText, preset.maxCharactersPerLine);
            ability1Lines.forEach(line => lines.push(line.trim()));
            lines.push("");

            if (oracle.abilities.length > 1) {
                for (let i = 1; i < oracle.abilities.length; i++) {
                    const ability2Text = oracle.abilities[i].parsedText;
                    const ability2Lines = this.wordWrapText(ability2Text, preset.maxCharactersPerLine);
                    ability2Lines.forEach(line => lines.push(line.trim()));
                    lines.push("");
                }
            }
        }

        // only keywords WITH cost.
        if (oracle.keywords.length > 0) {
            const keywordsWithCost = oracle.keywords.filter(k => k.hasCost).map(k => k.parsedText);
            // only ever print 1.
            if (keywordsWithCost.length === 1) {
                lines.push(keywordsWithCost[0]);
            }
        }

        // remove last line if empty.
        if (lines.length > 0 && lines[lines.length - 1] === "") 
            lines.splice(lines.length - 1, 1);

        return lines;
    }

    public wordWrapText(text: string, maxCharactersPerLine: number): string[] {
        const lines: string[] = [];

        if (text !== undefined && text.length > 0) {
            let remainingWords = text.split(" ");
            while (remainingWords.length > 0) {
                let nextWordLength = 0;
                let line = "";
                do {
                    line += remainingWords[0] + " ";
                    remainingWords.splice(0, 1);
                    nextWordLength = line.length + (remainingWords.length > 0 ? remainingWords[0].length : 0);
                } while (nextWordLength < maxCharactersPerLine && remainingWords.length > 0);
                lines.push(line);
            }
        }

        return lines;
    }

}