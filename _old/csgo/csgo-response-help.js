class CsgoHelpResponse {
    constructor(supportedMaps) {
        this.helpName = "Supported maps (so far):";
        this.helpName2 = "Commands:";
        this.helpName3 = 'Examples';
        this.helpValue = supportedMaps;
        this.helpValue2 = "Use commands starting with '!nades' to get more infos about grenade throws on that map. Start with the map, like so:\n"
                        + "!nades {map} [type] [side] [location]";
        this.helpValue3 = "!nades inferno\n"
                        + "!nades mirage flash t\n"
                        + "!nades mirage smoke t window\n"
                        + "!nades mirage smoke t jungle and connector\n";
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
        return `created by DrunKenBot - v1.1`;
    }
}

module.exports = CsgoHelpResponse;