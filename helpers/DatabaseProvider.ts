import lolDatabase = require('../assets/database/league-of-legends.json');
import fs from 'fs';

export class DatabaseProvider {
    public static LEAGUE_OF_LEGENDS: string = './assets/database/league-of-legends.json';

    public static get(database: string): any {
        
        switch (database) {
            case this.LEAGUE_OF_LEGENDS:
                return lolDatabase;
            default:
                return [];
        }
    }

    public static save(database: string, data: any): void {
        fs.writeFile(database, JSON.stringify(data, null, 4), function(error) {
            if (error) {
                throw error;
            }
        });
    }
}