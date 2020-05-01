class RpgHelpResonse {
    constructor(supportedCardTypes) {
        this.helpName = "Controls";
        this.helpValue = "There will always be a description and some options to choose from. Click on the corresponding emoji to answer the prompt. You have 3 minutes for each action and can only answer once!\n\nEmojis will look like this: 1️⃣, 2️⃣, 3️⃣, 4️⃣."
    }

    isHelp() {
        return true;
    }

    getTitle() {
        return `Tutorial`;
    }

    getColor() {
        return '#b64818';
    }

    getDescription() {
        return `Are you ready to jump into perilous adventures, challenge daring foes and gruesome monsters, and uncover mysteries? Good, get started by typing " !play " and the game will begin shortly after.`;
    }

    getThumbnailUrl() {
        return undefined;
    }

    getAuthor() {
        return 'Text Adventure Game';
    }

    getIcon() {
        return 'https://image.flaticon.com/icons/png/512/2835/2835832.png';
    }

    getThumbnailUrl() {
        return 'https://image.flaticon.com/icons/png/512/2835/2835832.png';
    }

    getFooter() {
        return `created by DrunKenBot - v1.0 beta`;
    }
}

module.exports = RpgHelpResonse;