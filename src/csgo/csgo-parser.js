const CsgoResponse = require('./csgo-response.js');
const CsgoHelpResponse = require('./csgo-response-help.js');
const csgoList = require('./../data/csgo.json');
const Fuse = require('fuse.js');

class CsgoNadeParser {
    constructor() {
    }

    parseMessage(message) {
        let options = { keys: [{ name: 'map', weight: 0.99 }] };
        let fuse = new Fuse(csgoList, options);

        if (message.content.length <= 7) {
            return this.getHelpResponse();
        }

        let searchTerm = message.content.substring(7);
        let searchResult = fuse.search(searchTerm);

        if (searchResult.length === 1 || true) {
            let first = searchResult[0].item;
            return new CsgoResponse(first.description, first.map, first.side, first.type, first.location, first.source);
        }

        console.log(searchResult);
        console.log(searchResult[0].item);
    }

    getHelpResponse() {
        return new CsgoHelpResponse();
    }
}

module.exports = CsgoNadeParser;

// // stores the favorite author in a constant variable
// function parse(message): {
//     message.react('👍').then(() => message.react('👎'));

//     const filter = (reaction, user) => {
//         return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
//     };

//     message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
//         .then(collected => {
//             const reaction = collected.first();

//             if (reaction.emoji.name === '👍') {
//                 message.reply('you reacted with a thumbs up.');
//             } else {
//                 message.reply('you reacted with a thumbs down.');
//             }
//         })
//         .catch(collected => {
//             message.reply('you reacted with neither a thumbs up, nor a thumbs down.');
//         });
// }
 
// // exports the variables and functions above so that other modules can use them
// module.exports.parse = parse;
// module.exports.favoriteBook = favoriteBook;
// module.exports.getBookRecommendations = getBookRecommendations;