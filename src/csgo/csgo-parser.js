const Discord = require('discord.js');
const Fuse = require('fuse.js');

const CsgoResponse = require('./csgo-response.js');
const CsgoHelpResponse = require('./csgo-response-help.js');
const csgoList = require('./../data/csgo.json');

class CsgoNadeParser {
    constructor(client) {
        this.mapOptions = { keys: ['map'] };
        this.typeOptions = { keys: ['item.type'] };
        this.sideOptions = { keys: ['item.side'] };
        this.locationOptions = { keys: ['item.location'] };
    }

    startWorkflow(message) {
        if (message.content.length <= 7) {
            return this.getHelpResponse();
        }

        this.smoke_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_smoke');
        this.molotov_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_molotov_ct');
        this.flash_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_flash');

        let searchTerms = message.content.substring(7).split(" ");
        let results = csgoList;
        results = this.populateResultWithSearch(results, searchTerms, 0, this.mapOptions);
        results = this.populateResultWithSearch(results, searchTerms, 1, this.typeOptions);
        results = this.populateResultWithSearch(results, searchTerms, 2, this.sideOptions);
        results = this.populateResultWithSearch(results, searchTerms, 3, this.locationOptions);
        
        console.log(results.length);
        if (results === null || results.length === 0) {
            message.reply("Sorry, doesn't look like anything to me.");
        }
        else if (results.length === 1) {
            let first = results[0].item;
            this.embedResponse(message, this.createItem(first));
        }
        else {
            if (searchTerms.length === 1) {
                message.channel.send(`There are ${results.length} clips for that. For which grenade type do you want to search? Click the appropriate emoji.`).then(m => {
                    m.react(this.smoke_emoji.id);
                    m.react(this.molotov_emoji.id);
                    m.react(this.flash_emoji.id);

                    const filter = (reaction, user) => { return user.id !== m.author.id; };
                    m.awaitReactions(filter, { max: 1, time: 20000, errors: ['time']} )
                    .then(collected => {
                        const reaction = collected.first();
                        switch (reaction.emoji.id) {
                            case this.smoke_emoji.id: 
                                message.content += ' smoke';
                                return this.startWorkflow(message);
                            case this.molotov_emoji.id: 
                                message.content += ' molotov';
                                return this.startWorkflow(message);
                            case this.flash_emoji.id: 
                                message.content += ' flash';
                                return this.startWorkflow(message);
                        }
                    }).catch((e) => { console.log(e); });
                }).catch((e) => { console.log(e); });
            }
        }

        return null;
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
            embed.addField(response.helpName2, response.helpValue2);
            embed.addField(response.helpName3, response.helpValue3);
            embed.addField(response.helpName4, response.helpValue4);
            embed.addField(response.helpName5, response.helpValue5);
        }

        message.channel.send(embed);
    }

    populateResultWithSearch(results, searchTerms, index, searchOptions) {
        if (searchTerms.length > index && results.length > 1) {
            let searchTerm = searchTerms[index];
            let fuse = new Fuse(results, searchOptions);
            results = fuse.search(searchTerm);
        }
        return results;
    }

    createItem(data) {
        if (data.item)
            data = data.item;
        return new CsgoResponse(data.description, data.map, data.side, data.type, data.location, data.source);
    }

    getHelpResponse() {
        return new CsgoHelpResponse();
    }
}

module.exports = CsgoNadeParser;