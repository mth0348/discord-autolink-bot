
String.prototype.toCamelCase = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
};

class CsgoResponse {
    constructor(description, map, side, type, location, source) {
        this.description = description;
        this.map = map;
        this.side = side;
        this.type = type;
        this.location = location;
        this.source = source;
    }

    isHelp() {
        return false;
    }

    getTitle() {
        let loc = this.location !== '' && this.location !== null ? `- ${this.location.toCamelCase()}` : '';
        return `${this.map.toCamelCase()} ${this.side.toUpperCase()} ${this.type.toCamelCase()} ${loc}`;
    }

    getDescription() {
        return this.description;
    }

    getThumbnailUrl() {
        switch (this.type) {
            case 'smoke':
                return 'https://i.imgur.com/yYZyxQw.png';
            case 'flash':
                return 'https://i.imgur.com/qywtPKj.png';
            case 'molotov':
                if (this.side.toUpperCase() === 'CT')
                    return 'https://i.imgur.com/z8Fwr3k.png';
                return 'https://i.imgur.com/W1DRfMn.png';
        }
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

module.exports = CsgoResponse;