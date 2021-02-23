import { Logger } from '../../helpers/Logger';
import { LogType } from "../../dtos/LogType";
import { Random } from '../../helpers/Random';
import { CsGoDataRepository } from '../../persistence/repositories/CsGoDataRepository';

const csgoList = require('./../data/csgo.json');
const Fuse = require('fuse.js');

export class MtgCardService {
    mapOptions: { keys: string[]; threshold: number; };
    typeOptions: { keys: string[]; threshold: number; };
    sideOptions: { keys: string[]; threshold: number; };
    locationOptions: { keys: string[]; threshold: number; includeScore: boolean; distance: number; minMatchCharLength: number; };


    constructor(private csGoDataRepository: CsGoDataRepository) {

        this.mapOptions = { keys: ['map'], threshold: 0.4 };
        this.typeOptions = { keys: ['type'], threshold: 0.4 };
        this.sideOptions = { keys: ['side'], threshold: 0 };
        this.locationOptions = { keys: ['location'], threshold: 0.4, includeScore: true, distance: 25, minMatchCharLength: 0 };

        // this.smoke_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_smoke');
        // this.molotov_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_molotov_ct');
        // this.flash_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_flash');
        // this.ct_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_ct');
        // this.t_emoji = message.guild.emojis.cache.find(e => e.name === 'csgo_t');
    }

    // public searchNadeVideoUrls(map: string, type: string,): string[] {

    //     let searchTerms = query.substring(7).split(" ");
    //     let results = csgoList;
    //     results = this.populateResultWithSearch(results, searchTerms, 0, this.mapOptions);
    //     results = this.populateResultWithSearch(results, searchTerms, 1, this.typeOptions);
    //     results = this.populateResultWithSearch(results, searchTerms, 2, this.sideOptions);
    //     results = this.populateResultWithSearch(results, searchTerms, 3, this.locationOptions, true);

    //     console.log(`Search for '${query.substring(7)}', ${results.length} results found.`);

    //     if (results === null || results.length === 0) {
    //         return [];
    //     }
    //     else if (results.length === 1) {
    //         return results;

    //     }
    //     else if (results.length === 2 && this.twoMatches) {
    //         let first = results[0];
    //         let second = results[1];
    //         // message.channel.send(`${first.source}\n${second.source}.`)

    //         console.log("Returned with two matches.")
    //         return results;
    //     }
    //     // else {
    //     //     if (searchTerms.length === 1) {
    //     //         message.channel.send(`There are ${results.length} clips for '${searchTerms[0]}'. Click the appropriate grenade emoji.`).then(m => {
    //     //             if (this.isPresent(results, r => r.type, 'smoke')) m.react(this.smoke_emoji.id);
    //     //             if (this.isPresent(results, r => r.type, 'molotov')) m.react(this.molotov_emoji.id);
    //     //             if (this.isPresent(results, r => r.type, 'flash')) m.react(this.flash_emoji.id);

    //     //             m.awaitReactions(this.defaultAwaitReactionFilter, this.defaultAwaitReactionOptions)
    //     //                 .then(collected => {
    //     //                     const reaction = collected.first();
    //     //                     if (reaction === undefined) return;
    //     //                     switch (reaction.emoji.id) {
    //     //                         case this.smoke_emoji.id:
    //     //                             message.content += ' smoke';
    //     //                             return this.startWorkflow(message);
    //     //                         case this.molotov_emoji.id:
    //     //                             message.content += ' molotov';
    //     //                             return this.startWorkflow(message);
    //     //                         case this.flash_emoji.id:
    //     //                             message.content += ' flash';
    //     //                             return this.startWorkflow(message);
    //     //                     }
    //     //                 }).catch(this.errorHandler);
    //     //         }).catch(this.errorHandler);
    //     //     }

    //     //     if (searchTerms.length === 2) {
    //     //         message.channel.send(`There are ${results.length} clips for '${searchTerms[0]} ${searchTerms[1]}'. Click the appropriate side emoji.`).then(m => {
    //     //             if (this.isPresent(results, r => r.side, 't')) m.react(this.t_emoji.id);
    //     //             if (this.isPresent(results, r => r.side, 'ct')) m.react(this.ct_emoji.id);

    //     //             m.awaitReactions(this.defaultAwaitReactionFilter, this.defaultAwaitReactionOptions)
    //     //                 .then(collected => {
    //     //                     const reaction = collected.first();
    //     //                     switch (reaction.emoji.id) {
    //     //                         case this.t_emoji.id:
    //     //                             message.content += ' t';
    //     //                             return this.startWorkflow(message);
    //     //                         case this.ct_emoji.id:
    //     //                             message.content += ' ct';
    //     //                             return this.startWorkflow(message);
    //     //                     }
    //     //                 }).catch(this.errorHandler);
    //     //         }).catch(this.errorHandler);
    //     //     }

    //     //     if (searchTerms.length >= 3) {
    //     //         message.channel.send(`There are ${results.length} clips for that. Enter one of the following:.`).then(m => {
    //     //             let responseText = "Options:\n";
    //     //             for (let i = 0; i < results.length; i++) {
    //     //                 const r = results[i];
    //     //                 responseText += `!nades ${r.map} ${r.type} ${r.side} ${r.location}\n`
    //     //             }
    //     //             message.channel.send(responseText);
    //     //             return;
    //     //         }).catch(this.errorHandler);
    //     //     }
    //     // }

    //     return null;
    // }

    // populateResultWithSearch(results: , searchTerms, index, searchOptions, includeRest) {
    //     if (searchTerms.length > index && results.length > 1) {
    //         let searchTerm = '';
    //         if (includeRest) {
    //             for (var i = index; i < searchTerms.length; i++) {
    //                 searchTerm += ` ${searchTerms[i]}`;
    //             }
    //         } else {
    //             searchTerm = searchTerms[index];
    //         }
    //         let fuse = new Fuse(results, searchOptions);
    //         let searchResults = fuse.search(searchTerm);

    //         // return almost perfect match.
    //         if (searchResults.length > 0 && searchResults[0].score < 0.05) {
    //             return [searchResults[0].item];
    //         }
    //         // return almost perfect matches if their score is very similar.
    //         if (searchResults.length === 2 && (searchResults[1].score - searchResults[0].score) < 0.05) {
    //             this.twoMatches = true;
    //             return [searchResults[0].item, searchResults[1].item];
    //         }

    //         // this removes the unnecessary .item property nesting.
    //         let newResults = [];
    //         searchResults.forEach(e => {
    //             newResults.push(e.item);
    //         });
    //         results = newResults;
    //     }
    //     return results;
    // }
}