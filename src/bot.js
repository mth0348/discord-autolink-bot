const { prefix } = require('./../config.json');
const Discord = require('discord.js');
const CsgoNadeParser = require('./csgo/csgo-parser.js')

class DrunkenBot {
    constructor(token) {
        this.token = token;
        this.client = new Discord.Client();

        this.client.login(token);
        console.log('AutoLinkBot initialized.');
        
        this.createParsers();
        this.registerCallbacks();
    }

    createParsers() {
        this.csgoNadeParser = new CsgoNadeParser(this.client);
    }

    registerCallbacks() {
        this.client.on('message', message => {
            if (message.content.startsWith(`${prefix}nades`)) {
                let response = this.csgoNadeParser.parseMessage(message);
                this.embedResponse(message, response);
            }
        });
    }

    embedResponse(message, response) {
        const embed = new Discord.MessageEmbed()
            .setColor('#ff9900')
            .setTitle(response.getTitle())
            .setAuthor(response.getAuthor(), response.getIcon())
            .setDescription(response.getDescription())
            .setThumbnail(response.getThumbnailUrl())
            .setImage(response.source)
            .setTimestamp()
            .setFooter(response.getFooter(), 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128');

        if (response.isHelp()) {
            embed.addField(response.helpName, response.helpValue);
            embed.addField('Map is mandatory:', response.helpValue2);
            embed.addField('You can add the type as well', response.helpValue3);
            embed.addField('The side as well:', response.helpValue3);
            embed.addField('Example', response.helpValue4);
        }

        message.channel.send(embed);
    }
}

module.exports = DrunkenBot;