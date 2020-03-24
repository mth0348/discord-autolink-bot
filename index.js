const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.login('NjkyMDM0MzkxNzM1NTMzNjI5.XnopaQ.Kgt-GRqF8d302x1g4YMc0GAniZw');

// register message handler.
client.on('message', onMessage);

function onMessage(message) {
	if (message.content === '!ping') {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Pong.');
	}
}