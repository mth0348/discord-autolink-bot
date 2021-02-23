import { MtgCardRarity } from '../dtos/mtg/MtgCardRarity';
import { MtgCardType } from '../dtos/mtg/MtgCardType';
import { StringHelper } from './StringHelper';

export class EnumHelper {

    public static toString(enumValue: MtgCardRarity): string {
        return enumValue.toString();
    }

    public static toMtgCardRarity(enumString: string): MtgCardRarity {
        return MtgCardRarity[StringHelper.toCamelCase(enumString) as keyof typeof MtgCardRarity];
    }

    public static toMtgCardType(enumString: string): MtgCardType {
        return MtgCardType[StringHelper.toCamelCase(enumString) as keyof typeof MtgCardType];
    }

}