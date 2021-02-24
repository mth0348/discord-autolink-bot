import { CsGoVideo } from '../entities/csgo/CsGoVideo';

import database = require('../../assets/data/csgo.json');

export class CsGoDataRepository {

    public getAll(): CsGoVideo[] {
        return database.map(x => new CsGoVideo(x));
    }

}