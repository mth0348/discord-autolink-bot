import { CsGoVideo } from '../models/csgo/CsGoVideo';

import database = require('../../assets/database/csgo.json');

export class CsGoDataRepository {

    public getAll(): CsGoVideo[] {
        return database.map(x => new CsGoVideo(x));
    }

}