import { MtgAbility } from "./abilities/MtgAbility";
import { MtgKeyword } from "../../domain/models/mtg/MtgKeyword";

export class MtgOracleText {
    public keywords: MtgKeyword[] = [];

    public abilities: MtgAbility[] = [];

}