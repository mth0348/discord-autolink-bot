class CsgoHelpResponse {
    constructor(supportedMaps) {
        this.helpName = "Supported maps:";
        this.helpName2 = "Commands:";
        this.helpName3 = 'Map is mandatory:';
        this.helpName4 = 'You can add the type as well';
        this.helpName5 = "Then you may add the side as well, like 'c' or 'ct':";
        this.helpName6 = 'Example';
        this.helpValue = supportedMaps;
        this.helpValue2 = "Use commands starting with '!nades' to get more infos about grenade throws on that map. Start with the map, like so:";
        this.helpValue3 = "!nades {map}";
        this.helpValue4 = "!nades {map} [type]";
        this.helpValue5 = "!nades {map} [type] [side]";
        this.helpValue6 = "!nades mirage smoke t window";
    }

    isHelp() {
        return true;
    }

    getTitle() {
        return `Nade your way to the top!`;
    }

    getColor() {
        return '#ff9900';
    }

    getDescription() {
        return `This bot will help you become a master of grenades in CS GO. Just enter search terms like the map, grenade type and more to find detailed clips of how to throw a grenade for that exact spot.`;
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