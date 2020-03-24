class CsgoHelpResponse {
    constructor() {
        this.helpName = "Commands:";
        this.helpValue =  "Use commands starting with \"!nades\" to get more infos about grenade throws on that map. You can ";
        this.helpName2 = 'Map is mandatory:';
        this.helpName3 = 'You can add the type as well';
        this.helpName4 = 'The side as well:';
        this.helpName5 = 'Example';
        this.helpValue2 = "\"!nades {map}\"";
        this.helpValue3 = "\"!nades {map} [type]\"";
        this.helpValue4 = "\"!nades {map} [type] [side]\"";
        this.helpValue5 = "\"!nades mirage smoke ct\"";
    }

    isHelp() { 
        return true;
    }

    getTitle() {
        return `Learn smoke, molotov and flash nades!`;
    }

    getDescription() {
        return `This bot will help you become a master of grenades in CS GO. Because you suck, flashing your own team mates. :frowning2:`;
    }

    getThumbnailUrl() {
        return undefined;
    }

    getAuthor() {
        return 'CS GO Nades';
    }

    getIcon() {
        return 'https://www.freeiconspng.com/uploads/csgo-icon-12.png';
    }

    getFooter() {
        return `created by DrunKenBot`;
    }
}

module.exports = CsgoHelpResponse;