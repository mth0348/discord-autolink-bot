import { CsGoVideo } from '../entities/csgo/CsGoVideo';

import database = require('../../src/data/mtg.json');

export class CsGoDataRepository {

    public getPermanentConditions(): CsGoVideo[] {
        return database.permanentConditions.map(x => new CsGoVideo(x));
    }

}