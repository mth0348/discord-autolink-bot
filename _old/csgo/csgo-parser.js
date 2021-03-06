const Fuse = require('fuse.js');

const { DiscordHelper, SimpleResponse } = require('./../discord-helper.js');

const CsgoResponse = require('./csgo-response.js');
const CsgoHelpResponse = require('./csgo-response-help.js');
const csgoList = require('./../data/csgo.json');
const config = require('./../../config.json');

class CsgoNadeParser {
    constructor(client) {
        this.mapOptions = { keys: ['map'], threshold: 0.4 };
        this.typeOptions = { keys: ['type'], threshold: 0.4 };
        this.sideOptions = { keys: ['side'], threshold: 0 };
        this.locationOptions = { keys: ['location'], threshold: 0.4, includeScore: true, distance: 25, minMatchCharLength: 0 };

        this.discordHelper = new DiscordHelper();
        this.allowedChannels = config.channelPermissions.csgo;

        this.failCount = 0;
        this.defaultAwaitReactionFilter = (reaction, user) => { return user.id !== reaction.message.author.id; };
        this.defaultAwaitReactionOptions = { max: 1, time: 20000 };
    }

    isCommandAllowed(message) {
        let isCommand = this.discordHelper.checkIsCommand(message, `${config.prefix}nades`);
        if (isCommand) {
            let isAllowedInChannel = this.discordHelper.checkChannelPermissions(message, config.channelPermissions.csgo);
            let isAllowedRole = this.discordHelper.checkRolePermissions(message, config.rolePermissions.csgo);
            return isAllowedInChannel && isAllowedRole;
        }
        return false;
    }

    startWorkflow(message) {
        if (message.content.length <= 7) {
            this.failCount = 0;
            let supportedMaps = this.evaluateSupportedMaps();
            this.discordHelper.richEmbedMessage(message, this.getHelpResponse(supportedMaps));
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
                message.channel.send(`There are ${results.length} clips for '${searchTerms[0]}'. Click the appropriate grenade emoji.`).then(m => {
                    if (this.isPresent(results, r => r.type, 'smoke')) m.react(this.smoke_emoji.id);
                    if (this.isPresent(results, r => r.type, 'molotov')) m.react(this.molotov_emoji.id);
                    if (this.isPresent(results, r => r.type, 'flash')) m.react(this.flash_emoji.id);

                    m.awaitReactions(this.defaultAwaitReactionFilter, this.defaultAwaitReactionOptions)
                        .then(collected => {
                            const reaction = collected.first();
                            if (reaction === undefined) return;
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
                        }).catch(this.errorHandler);
                }).catch(this.errorHandler);
            }

            if (searchTerms.length === 2) {
                message.channel.send(`There are ${results.length} clips for '${searchTerms[0]} ${searchTerms[1]}'. Click the appropriate side emoji.`).then(m => {
                    if (this.isPresent(results, r => r.side, 't')) m.react(this.t_emoji.id);
                    if (this.isPresent(results, r => r.side, 'ct')) m.react(this.ct_emoji.id);

                    m.awaitReactions(this.defaultAwaitReactionFilter, this.defaultAwaitReactionOptions)
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
                        }).catch(this.errorHandler);
                }).catch(this.errorHandler);
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
                }).catch(this.errorHandler);
            }
        }

        return null;
    }

    populateResultWithSearch(results, searchTerms, index, searchOptions, includeRest) {
        if (searchTerms.length > index && results.length > 1) {
            let searchTerm = '';
            if (includeRest) {
                for (var i = index; i < searchTerms.length; i++) {
                    searchTerm += ` ${searchTerms[i]}`;
                }
            } else {
                searchTerm = searchTerms[index];
            }
            let fuse = new Fuse(results, searchOptions);
            let searchResults = fuse.search(searchTerm);

            // return almost perfect match.
            if (searchResults.length > 0 && searchResults[0].score < 0.05) {
                return [searchResults[0].item];
            }
            // return almost perfect matches if their score is very similar.
            if (searchResults.length === 2 && (searchResults[1].score - searchResults[0].score) < 0.05) {
                this.twoMatches = true;
                return [searchResults[0].item, searchResults[1].item];
            }

            // this removes the unnecessary .item property nesting.
            let newResults = [];
            searchResults.forEach(e => {
                newResults.push(e.item);
            });
            results = newResults;
        }
        return results;
    }

    createItem(data) {
        return new CsgoResponse(data.description, data.map, data.side, data.type, data.location, data.source);
    }

    getHelpResponse(supportedMaps) {
        return new CsgoHelpResponse(supportedMaps);
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

    errorHandler(e) {
        console.warn(e);
    }

    evaluateSupportedMaps() {
        let mapsString = '';
        csgoList.forEach(element => {
            if (mapsString.toLowerCase().indexOf(element.map.toLowerCase()) < 0) {
                mapsString += `${element.map.toCamelCase()}, `;
            }
        });
        return mapsString.substring(0, mapsString.length-2);
    }
}

module.exports = CsgoNadeParser;