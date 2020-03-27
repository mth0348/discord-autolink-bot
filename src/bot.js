const Discord = require('discord.js');

const CsgoNadeParser = require('./csgo/csgo-parser.js')
const GeneralParser = require('./general/general-parser.js')
const config = require('./../config.json');

class DrunkenBot {
    constructor() {
        this.client = new Discord.Client();

        this.client.login(config.token);
        console.log('AutoLinkBot initialized.');
        
        this.registerCallbacks();
        this.registerParsers();
    }

    registerParsers() {
        this.csgoNadeParser = new CsgoNadeParser(this.client);
        this.generalParser = new GeneralParser(this.client);
    }

    registerCallbacks() {
        this.client.on('message', message => {
            if (this.csgoNadeParser.isCommand(message)) {
                this.csgoNadeParser.startWorkflow(message);
            }

            if (this.generalParser.isCommand(message)) {
                this.generalParser.startWorkflow(message);
            }
        });
    }
}

module.exports = DrunkenBot;