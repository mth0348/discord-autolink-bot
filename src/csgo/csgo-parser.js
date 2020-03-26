const Fuse = require('fuse.js');

const { DiscordHelper } = require('./../discord-helper.js');

const CsgoResponse = require('./csgo-response.js');
const CsgoHelpResponse = require('./csgo-response-help.js');
const csgoList = require('./../data/csgo.json');

class CsgoNadeParser {
    constructor(client) {
        this.mapOptions = { keys: ['map'], threshold: 0.4 };
        this.typeOptions = { keys: ['type'] };
        this.sideOptions = { keys: ['side'], threshold: 0 };
        this.locationOptions = { keys: ['location'], threshold: 0.4, includeScore: true, distance: 10 };

        this.discordHelper = new DiscordHelper();
    }

    startWorkflow(message) {
        if (message.content.length <= 7) {
            this.discordHelper.richEmbedMessage(message, this.getHelpResponse());
            return null;
        }

        this.smoke_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_smoke');
        this.molotov_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_molotov_ct');
        this.flash_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_flash');
        this.ct_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_ct');
        this.t_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_t');

        let searchTerms = message.content.substring(7).split(" ");
        let results = csgoList;
        results = this.populateResultWithSearch(results, searchTerms, 0, this.mapOptions);
        results = this.populateResultWithSearch(results, searchTerms, 1, this.typeOptions);
        results = this.populateResultWithSearch(results, searchTerms, 2, this.sideOptions);
        results = this.populateResultWithSearch(results, searchTerms, 3, this.locationOptions, true, message);
        
        console.log(results.length);
        if (results === null || results.length === 0) {
            message.reply("Sorry, doesn't look like anything to me. Enter '!nades' for help.");
        }
        else if (results.length === 1) {
            let first = results[0];
            message.channel.send(first.source);
        }
        else if (results.length === 2 && this.twoMatches) {
            this.twoMatches = false;
            let first = results[0];
            let second = results[1];
            message.channel.send(`${first.source}\n${second.source}.`)
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

            if (searchTerms.length === 2) {
                message.channel.send(`There are ${results.length} clips for that. For which side do you want to search? Click the appropriate emoji.`).then(m => {
                    m.react(this.t_emoji.id);
                    m.react(this.ct_emoji.id);

                    const filter = (reaction, user) => { return user.id !== m.author.id; };
                    m.awaitReactions(filter, { max: 1, time: 20000, errors: ['time']} )
                    .then(collected => {
                        const reaction = collected.first();
                        switch (reaction.emoji.id) {
                            case this.t_emoji.id: 
                                message.content += ' t';
                                return this.startWorkflow(message);
                            case this.ct_emoji.id: 
                                message.content += ' ct';
                                return this.startWorkflow(message);
                        }
                    }).catch((e) => { console.log(e); });
                }).catch((e) => { console.log(e); });
            }

            if (searchTerms.length >= 3) {
                message.channel.send(`There are ${results.length} clips for that. Enter one of the following:.`).then(m => {
                    let responseText = "Options:\n";
                    for (let i = 0; i < results.length; i++) {
                        const r = results[i];
                        responseText += `!nades ${r.map} ${r.type} ${r.side} ${r.location}\n`
                    }
                    message.channel.send(responseText);
                    return null;
                }).catch((e) => { console.log(e); });
            }
        }

        return null;
    }

    populateResultWithSearch(results, searchTerms, index, searchOptions, includeRest) {
        if (searchTerms.length > index && results.length > 1) {
            let searchTerm = '';
            if (includeRest){
                for (var i = index; i < searchTerms.length; i++) {
                    searchTerm += ` ${searchTerms[i]}`;
                }
            }else {
                searchTerm = searchTerms[index];
            }
            let fuse = new Fuse(results, searchOptions);
            let searchResults = fuse.search(searchTerm);

            /* immediately return almost perfect match/es */
            if (searchResults.length > 0 && searchResults[0].score < 0.1) {
                return [ searchResults[0].item ];
            }
            if (searchResults.length > 1 && (searchResults[1].score - searchResults[0].score) < 0.1) {
                this.twoMatches = true;
                return [ searchResults[0].item, searchResults[1].item ];
            }

            let newResults = [];
            searchResults.forEach(e => {
                newResults.push(e.item); /* this removes the unnecessary .item property nesting */
            });
            results = newResults;
        }
        return results;
    }

    createItem(data) {
        return new CsgoResponse(data.description, data.map, data.side, data.type, data.location, data.source);
    }

    getHelpResponse() {
        return new CsgoHelpResponse();
    }
}

module.exports = CsgoNadeParser;