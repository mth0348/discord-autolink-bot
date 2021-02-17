import { Message, PartialMessage, TextChannel } from 'discord.js';
import { StringHelper } from '../helpers/StringHelper';

export class DiscordService {

    checkIsCommand(message: Message | PartialMessage, command: string): boolean {
        return StringHelper.startsWith(message.content.toLowerCase(), command.toLowerCase());
    }

    checkIsRegexCommand(message: Message | PartialMessage, command: string) {
        const regex = RegExp(command);
        return regex.test(message.content);
    }

    checkChannelPermissions(message: Message | PartialMessage, allowedChannels: string[]) {
        for (let i = 0; i < allowedChannels.length; i++) {
            const allowedChannel = allowedChannels[i];
            if (message.channel.type === "dm" || message.channel.name.toLowerCase() === allowedChannel.toLowerCase()) {
                return true;
            }
        }
        // console.log(`No permission for channel '${message.channel.name}'.`);
        return false;
    }

    checkRolePermissions(message: Message | PartialMessage, allowedRoles: string[]) {
        // allow webhook bots / hard-exclude T-Bot.
        if (message.author.discriminator === "0000" || message.author.id === "706950877696622635")
            return true;

        let memberRoles = message.member.roles.cache;
        for (let i = 0; i < allowedRoles.length; i++) {
            const allowedRole = allowedRoles[i];

            if (memberRoles.some(m => allowedRole.toLowerCase() === m.name.toLowerCase())) {
                return true;
            }
        }
        console.log(`No permission for user '${message.member.displayName}' for roles '${allowedRoles}'.`);
        return false;
    }
}