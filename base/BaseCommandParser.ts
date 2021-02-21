import { DiscordService } from './../services/DiscordService';
import { Message, PartialMessage } from 'discord.js';
import { ICommandParser } from './ICommandParser';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { ParameterService } from '../services/ParameterService';

export class BaseCommandParser implements ICommandParser {

    public name: string;

    protected prefixes: string[];

    constructor(
        protected discordService: DiscordService,
        protected parameterService: ParameterService,
        private allowedChannels: string[] | undefined,
        private allowedRoles: string[] | undefined
    ) {
    }

    public isAllowedCommand(message: Message | PartialMessage): boolean {
        if (this.allowedChannels === undefined || this.allowedRoles === undefined) 
            return true;

        let isCommand = this.prefixes.some(prefix => this.discordService.checkIsCommand(message, `${ConfigProvider.current().prefix}${prefix}`));
        if (isCommand) {
            let isAllowedInChannel = this.discordService.checkChannelPermissions(message, this.allowedChannels);
            let isAllowedRole = this.discordService.checkRolePermissions(message, this.allowedRoles);
            return isAllowedInChannel && isAllowedRole;
        }
        return false;
    }

    async executeAsync(message: Message | PartialMessage): Promise<void> {

    }
}