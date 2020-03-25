const Discord = require('discord.js');

const config = require('./../config.json');
const CsgoNadeParser = require('./csgo/csgo-parser.js')

class DrunkenBot {
    constructor(token) {
        this.client = new Discord.Client();

        this.client.login(config.token);
        console.log('AutoLinkBot initialized.');
        
        this.registerCallbacks();
    }

    registerCallbacks() {
        this.client.on('message', message => {
            if (message.content.startsWith(`${config.prefix}nades`)) {
                let csgoNadeParser = new CsgoNadeParser(this.client);
                csgoNadeParser.startWorkflow(message);
            }
        });
    }
}

module.exports = DrunkenBot;