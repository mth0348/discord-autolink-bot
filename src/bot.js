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

            if (message.content.startsWith(`${config.prefix}deleteall`)) {
                if (!this.deleteConfirm) {
                    this.deleteConfirm = 1;
                    console.log(`User '${message.member.nickname}' attempts to delete all messages...`);
                    return;
                }
                console.log(`User '${message.member.nickname}' deleted all messages!`);

                async function clear() {
                    message.delete();
                    let fetched;
                    do {
                        fetched = await message.channel.messages.fetch({limit: 99});
                        message.channel.bulkDelete(fetched);
                    } while(fetched.size >= 2);
                }
                clear();
                this.deleteConfirm = undefined;
            }
        });
    }
}

module.exports = DrunkenBot;