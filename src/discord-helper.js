const Discord = require('discord.js');

class DiscordHelper {
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
}

module.exports = DiscordHelper;

