const Fuse = require('fuse.js');

const { DiscordHelper, SimpleResponse } = require('./../discord-helper.js');

const CsgoResponse = require('./csgo-response.js');
const CsgoHelpResponse = require('./csgo-response-help.js');
const csgoList = require('./../data/csgo.json');
const config = require('./../../config.json');

class CsgoNadeParser {
    constructor(client) {
        this.mapOptions = { keys: ['map'], threshold: 0.4 };
        this.typeOptions = { keys: ['type'] };
        this.sideOptions = { keys: ['side'], threshold: 0 };
        this.locationOptions = { keys: ['location'], threshold: 0.25, includeScore: true, distance: 30, minMatchCharLength: 0 };

        this.discordHelper = new DiscordHelper();
        this.failCount = 0;

        this.allowedChannels = config.channelPermissions.csgo;
    }

    isCommand(message) {
        let isCommand = message.content.startsWith(`${config.prefix}nades`);
        if (isCommand) {
            for (let i = 0; i < this.allowedChannels.length; i++) {
                const allowedChannel = this.allowedChannels[i];
                if (message.channel.name.toLowerCase() === allowedChannel.toLowerCase()) {
                    return true;
                }
            }
        }
        return isCommand;
    }

    startWorkflow(message) {
        if (message.content.length <= 7) {
            this.failCount = 0;
            this.discordHelper.richEmbedMessage(message, this.getHelpResponse());
            return;
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
        
        console.log(`Search for '${message.content.substring(7)}', ${results.length} results found.`);

        if (results === null || results.length === 0) {
            this.failCount++;
            if (this.checkFailedEastereggMessage(message)) {
                return;
            }
            message.reply("Sorry, doesn't look like anything to me. Enter '!nades' for help.");
        }
        else if (results.length === 1) {
            this.failCount = 0;
            let first = results[0];
            message.channel.send(first.source);

            console.log("Returned one single match.")
        }
        else if (results.length === 2 && this.twoMatches) {
            this.failCount = 0;
            this.twoMatches = false;
            let first = results[0];
            let second = results[1];
            message.channel.send(`${first.source}\n${second.source}.`)

            console.log("Returned with two matches.")
        }
        else {
            this.failCount = 0;
            if (searchTerms.length === 1) {
                message.channel.send(`There are ${results.length} clips for that. For which grenade type do you want to search? Click the appropriate emoji.`).then(m => {
                    if (this.isPresent(results, r => r.type, 'smoke')) m.react(this.smoke_emoji.id);
                    if (this.isPresent(results, r => r.type, 'molotov')) m.react(this.molotov_emoji.id);
                    if (this.isPresent(results, r => r.type, 'flash')) m.react(this.flash_emoji.id);

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
                    }).catch((e) => { console.warn(e); });
                }).catch((e) => { console.warn(e); });
            }

            if (searchTerms.length === 2) {
                message.channel.send(`There are ${results.length} clips for that. For which side do you want to search? Click the appropriate emoji.`).then(m => {
                    if (this.isPresent(results, r => r.side, 't')) m.react(this.t_emoji.id);
                    if (this.isPresent(results, r => r.side, 'ct')) m.react(this.ct_emoji.id);

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
                    }).catch((e) => { console.warn(e); });
                }).catch((e) => { console.warn(e); });
            }

            if (searchTerms.length >= 3) {
                message.channel.send(`There are ${results.length} clips for that. Enter one of the following:.`).then(m => {
                    let responseText = "Options:\n";
                    for (let i = 0; i < results.length; i++) {
                        const r = results[i];
                        responseText += `!nades ${r.map} ${r.type} ${r.side} ${r.location}\n`
                    }
                    message.channel.send(responseText);
                    return;
                }).catch((e) => { console.warn(e); });
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
            if (searchResults.length > 0 && searchResults[0].score < 0.05) {
                return [ searchResults[0].item ];
            }
            if (searchResults.length === 2 && (searchResults[1].score - searchResults[0].score) < 0.1) {
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

    checkFailedEastereggMessage(message) {
        if (this.failCount >= 3) {
            this.failCount = 0;
            this.discordHelper.embedMessage(message, new SimpleResponse(`It's not so hard!`, `I've noticed you are having trouble entering a valid command for '!nades'...\nTry only '!nades' and I will list you all possible commands. :chicken:`, '#22ff22'));
            return true;
        }

        return false;
    }

    isPresent(list, propertySelector, propertyValue) {
        for (var i = 0; i < list.length; i++) {
            if (propertySelector(list[i]).toLowerCase() === propertyValue.toLowerCase()) 
                return true;
        }
        return false;
    }
}

module.exports = CsgoNadeParser;