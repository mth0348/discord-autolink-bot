const Discord = require('discord.js');

const CsgoNadeParser = require('./csgo/csgo-parser.js')
const GeneralParser = require('./general/general-parser.js')
const config = require('./../config.json');

class DrunkenBot {
    constructor() {
        this.client = new Discord.Client();

        this.client.login(config.token);
        console.log('DrunKenBot started.');
        
        this.csgoNadeParser = new CsgoNadeParser(this.client);
        console.log('Listening for csgo nades commands...');

        this.generalParser = new GeneralParser(this.client);
        console.log('Listening for general commands...');

        this.registerCommandParsers();
    }

    registerCommandParsers() {
        this.client.on('message', message => {
            if (this.csgoNadeParser.isCommandAllowed(message)) {
                this.csgoNadeParser.startWorkflow(message);
            }

            if (this.generalParser.isCommandAllowed(message)) {
                this.generalParser.startWorkflow(message);
            }
        });
    }
}

module.exports = DrunkenBot;