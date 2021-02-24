import { AwaitReactionsOptions, CollectorFilter, Message, MessageAttachment, MessageEmbed, PartialMessage, TextChannel } from 'discord.js';
import { StringHelper } from '../helpers/StringHelper';
import { DrunkenBot } from '../base/DrunkenBot';
import { Logger } from '../helpers/Logger';
import { LogType } from '../dtos/LogType';

export class DiscordService {
    private defaultAwaitReactionFilter: CollectorFilter;
    private defaultAwaitReactionOptions: AwaitReactionsOptions;

    constructor() {
        this.defaultAwaitReactionFilter = (reaction, user) => { return user.id !== reaction.message.author.id; };
        this.defaultAwaitReactionOptions = { max: 1, time: 30000 };
    }

    sendMessage(message: Message | PartialMessage, text: string, attachment: MessageAttachment = undefined) {
        message.channel.send(text, attachment);
    }

    sendMessageEmbed(message: Message | PartialMessage, text: string, embed: MessageEmbed) {
        message.channel.send(text, embed);
    }

    sendMessageWithReactions(message: Message | PartialMessage, text: string, attachment: MessageAttachment) {
        const self = this;

        message.channel.send(text, attachment)
            .then(function (embed) {
                embed.react("👍🏻");
                embed.react("📢");
                embed.awaitReactions(self.defaultAwaitReactionFilter, self.defaultAwaitReactionOptions)
                    .then(collected => {
                        const reaction = collected.first();
                        if (reaction === undefined) return;
                        switch (reaction.emoji.name) {
                            case "👍🏻":
                                // do nothing. appreciate the vote.
                                return;
                            case "📢":
                                let username = reaction.users.cache.find(e => e.username !== reaction.message.author.username).username;
                                DrunkenBot.reportMessage(message, username, 'User report');
                                return;
                        }
                    }).catch(e => DrunkenBot.reportMessage(message, 'DrunkenBot Workflow', e));
            });
    }

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
        Logger.log(`No permission for channel '${(message.channel as TextChannel).name}'.`, LogType.Warning);
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
        Logger.log(`No permission for user '${message.member.displayName}' for roles '${allowedRoles}'.`, LogType.Warning);
        return false;
    }
}