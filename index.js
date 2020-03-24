const Discord = require('discord.js');
const DrunkenBot = require('./src/bot');
const { token } = require('./config.json');

// main.

new DrunkenBot(token);

// extensions.

String.prototype.toCamelCase = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
};