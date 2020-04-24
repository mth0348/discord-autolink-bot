const Discord = require('discord.js');

const CsgoNadeParser = require('./csgo/csgo-parser.js')
const GeneralParser = require('./general/general-parser.js')
const MtgParser = require('./mtg/mtg-parser.js')
const config = require('./../config.json');

class DrunkenBot {
    constructor(token) {
        this.client = new Discord.Client();

        this.client.login(token);
        console.log('DrunKenBot started.');

        this.csgoNadeParser = new CsgoNadeParser(this.client);
        console.log('Listening for csgo nades commands...');

        this.generalParser = new GeneralParser(this.client);
        console.log('Listening for general commands...');

        this.mtgParser = new MtgParser(this.client);
        console.log('Listening for mtg commands...');

        this.registerCommandParsers();
    }

    registerCommandParsers() {
        this.client.on('message', message => {
            try {
                if (this.csgoNadeParser.isCommandAllowed(message)) {
                    this.csgoNadeParser.startWorkflow(message);
                }
    
                if (this.generalParser.isCommandAllowed(message)) {
                    this.generalParser.startWorkflow(message);
                }
    
                if (this.mtgParser.isCommandAllowed(message)) {
                    this.mtgParser.startWorkflow(message);
                }
            }
            catch (e) {
                console.warn(e);
                message.channel.send("Oops, something went wrong, sorry. Please try again...")
            }
            
        });
    }
}

module.exports = DrunkenBot;