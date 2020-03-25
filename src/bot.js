const Discord = require('discord.js');

const config = require('./../config.json');
const CsgoNadeParser = require('./csgo/csgo-parser.js')

class DrunkenBot {
    constructor(token) {
        this.client = new Discord.Client();

        this.client.login(config.token);
        console.log('AutoLinkBot initialized.');
        
        this.createParsers();
        this.registerCallbacks();
    }

    createParsers() {
        this.csgoNadeParser = new CsgoNadeParser(this.client);
    }

    registerCallbacks() {
        this.client.on('message', message => {
            if (message.content.startsWith(`${config.prefix}nades`)) {
                this.csgoNadeParser.startWorkflow(message);
            }
        });
    }
}

module.exports = DrunkenBot;