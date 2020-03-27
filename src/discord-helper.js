const Discord = require('discord.js');

class DiscordHelper {
    richEmbedMessage(message, response) {
        const embed = new Discord.MessageEmbed()
            .setColor(response.getColor())
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

    embedMessage(message, response) {
        const embed = new Discord.MessageEmbed()
            .setColor(response.getColor())
            .setTitle(response.getTitle())
            .setDescription(response.getDescription())

        message.channel.send(embed);
    }

    checkIsCommand(message, command) {
        return message.content.startsWith(command);
    }
    
    checkChannelPermissions(message, allowedChannels) {
        for (let i = 0; i < allowedChannels.length; i++) {
            const allowedChannel = allowedChannels[i];
            if (message.channel.name.toLowerCase() === allowedChannel.toLowerCase()) {
                return true;
            }
        }
        console.log(`No permission for channel '${message.channel.name}'.`);
        return false;
    }

    checkRolePermissions(message, allowedRoles) {
        let memberRoles = message.member.roles.cache;
        for (let i = 0; i < allowedRoles.length; i++) {
            const allowedRole = allowedRoles[i];

            for (let j = 0; j < memberRoles.size; j++) {
                const memberRole = memberRoles.toJSON()[j];
                if (allowedRole.toLowerCase() === memberRole.name.toLowerCase()) {
                    return true;
                }
            }
        }
        console.log(`No permission for user '${message.member.displayName}' for roles '${allowedRoles}'.`);
        return false;
    }
}

class SimpleResponse {
    constructor(title, description, color) {
        this.description = description;
        this.title = title;
        this.color = color;
    }

    getColor() {
        return this.color;
    }

    getTitle() {
        return this.title;
    }

    getDescription() {
        return this.description;
    }
}

module.exports = { DiscordHelper, SimpleResponse };

