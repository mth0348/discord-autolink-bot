const { SimpleResponse } = require('../discord-helper.js');

String.prototype.toCamelCase = function () {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
};

class RpgResponse {
    constructor() {
        this.title = "";
        this.text = "";
        this.thumbnail = "";
        this.options = [];
        this.type = "story";
    }

    isHelp() {
        return false;
    }

    getColor() {
        return this.type === 'combat' ? '#ff2222' :
            this.type === 'story' ? '#dddddd' :
                '#dddddd';
    }

    getTitle() {
        return this.title != undefined ? this.title : "";
    }

    getDescription() {
        if (this.jobIcons) {
            return `${this.text.toCamelCase()}\n\n🏹 : Huntsman\n🗡️ : Warrior\n⚒️ : Blacksmith`;
        }

        let t = `${this.text.toCamelCase()}\n\n`;
        if (this.options !== undefined && this.options != null) {
            for (var i = 0; i < this.options.length; i++) {
                t += `{${i+1}} : ${this.options[i].text.toCamelCase()}\n`;
            }
        }
        return this.parseEmojis(t);
    }

    getThumbnailUrl() {
        return this.thumbnail;
    }

    getAuthor() {
        return 'Text Adventure: Chapter ' + (this.act !== undefined ? Math.max(1, this.act) : 1);
    }

    getIcon() {
        return 'https://image.flaticon.com/icons/png/512/2835/2835832.png';
    }

    getFooter() {
        return `created by DrunKenBot`;
    }

    toSimpleResponse() {
        return new SimpleResponse(this.getTitle(), this.getDescription(), this.getColor());
    }

    parseEmojis(t) {
        t = t.replace("{1}", "1️⃣");
        t = t.replace("{2}", "2️⃣");
        t = t.replace("{3}", "3️⃣");
        t = t.replace("{4}", "4️⃣");
        t = t.replace("{f}", "⚔️");
        return t;
    }
}

module.exports = RpgResponse;