import { MtgAbility } from "./abilities/MtgAbility";
import { MtgKeyword } from "../../persistence/entities/mtg/MtgKeyword";

export class MtgOracleText {
    public keywords: MtgKeyword[] = [];

    public abilities: MtgAbility[] = [];

}