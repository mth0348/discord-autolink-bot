class MtgHelpResponse {
    constructor(supportedCardTypes) {
        this.helpName = "Supported card types:";
        this.helpName2 = "Commands:";
        this.helpName3 = 'Examples';
        this.helpValue = supportedCardTypes;
        this.helpValue2 = "Use the following command structure. The card type is optional:\n"
                        + "!mtg [cardtype]";
        this.helpValue3 = "!mtg\n"
                        + "!mtg creature\n"
                        + "!mtg instant\n"
                        + "!mtg sorcery\n";
    }

    isHelp() {
        return true;
    }

    getTitle() {
        return `Random Magic Card Generator`;
    }

    getColor() {
        return '#b64818';
    }

    getDescription() {
        return `Generate a random magic card by entering "!mtg". Please give the card a thumbs up if you like it and a thumbs down if the ruling doesn't work out or is completely busted.`;
    }

    getThumbnailUrl() {
        return undefined;
    }

    getAuthor() {
        return 'MtG Random Card';
    }

    getIcon() {
        return 'https://deckmaster.info/images/sets/DPA_C.png';
    }

    getFooter() {
        return `created by DrunKenBot - v1.0`;
    }
}

module.exports = MtgHelpResponse;