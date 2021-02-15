import { DiscordService } from './../services/DiscordService';
import { Message, PartialMessage } from 'discord.js';
import { ICommandParser } from './ICommandParser';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { ParameterService } from '../services/ParameterService';

export class BaseCommandParser implements ICommandParser {
    
    constructor (
        protected discordService: DiscordService,
        protected parameterService: ParameterService,
        private allowedChannels: string[],
        private allowedRoles: string[]
        ) {
    }

    public isAllowedCommand(message : Message | PartialMessage): boolean {
        let isCommand = this.discordService.checkIsCommand(message, `${ConfigProvider.current().prefix}mtg`);
        if (isCommand) {
            let isAllowedInChannel = this.discordService.checkChannelPermissions(message, this.allowedChannels);
            let isAllowedRole = this.discordService.checkRolePermissions(message, this.allowedRoles);
            return isAllowedInChannel && isAllowedRole;
        }
        return false;
    }

    execute(message: Message | PartialMessage): void {
        
    }
}