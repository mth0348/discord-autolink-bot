const Discord = require('discord.js');

class DiscordHelper {

    //region MESSAGE AND EMBED SUPPORT
    richEmbedMessage(message, response, followup) {
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
            if (response.helpName) embed.addField(response.helpName, response.helpValue);
            if (response.helpName2) embed.addField(response.helpName2, response.helpValue2);
            if (response.helpName3) embed.addField(response.helpName3, response.helpValue3);
            if (response.helpName4) embed.addField(response.helpName4, response.helpValue4);
            if (response.helpName5) embed.addField(response.helpName5, response.helpValue5);
            if (response.helpName6) embed.addField(response.helpName6, response.helpValue6);
        }

        if (followup != undefined) {
            message.channel.send(embed).then(e => {if (followup != undefined) followup(e); });
        }
    }

    embedMessage(message, response, followup) {
        const embed = new Discord.MessageEmbed()
            .setColor(response.getColor())
            .setTitle(response.getTitle())
            .setDescription(response.getDescription())
            
        if (response.footer)
            embed.setFooter(response.footer);

        if (followup != undefined) {
            message.channel.send(embed).then(e => {if (followup != undefined) followup(e); });
        }

        message.channel.send(embed);
    }
    //endregion

    //region PERMISSION HANDLING
    checkIsCommand(message, command) {
        return message.content.toLowerCase().startsWith(command.toLowerCase());
    }

    checkIsRegexCommand(message, command) {
        const regex = RegExp(command);
        return regex.test(message.content);
    }

    checkChannelPermissions(message, allowedChannels) {
        for (let i = 0; i < allowedChannels.length; i++) {
            const allowedChannel = allowedChannels[i];
            if (message.channel.type === "dm" || message.channel.name.toLowerCase() === allowedChannel.toLowerCase()) {
                return true;
            }
        }
        console.log(`No permission for channel '${message.channel.name}'.`);
        return false;
    }

    checkRolePermissions(message, allowedRoles) {
        // allow webhook bots / hard-exclude T-Bot.
        if (message.author.disriminator === "0000" || message.author.id === "706950877696622635")
            return true;

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
    //endregion
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

