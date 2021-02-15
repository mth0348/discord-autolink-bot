import { MtgDataRepository } from "../../persistence/repositories/MtgDataRepository";

export class MtgCardService {

    private mtgDataRepository: MtgDataRepository

    constructor () {
        this.mtgDataRepository = new MtgDataRepository();
    }
}