import { DiscordService } from './../services/DiscordService';
import { Message, PartialMessage } from 'discord.js';
import { ICommandParser } from './ICommandParser';
import { MtgCardService } from '../services/mtg/MtgCardService';

import config = require('../config.json');

export class BaseCommandParser implements ICommandParser {
    
    private mtgService: MtgCardService;

    constructor (
        private discordService: DiscordService,
        private allowedChannels: string[],
        private allowedRoles: string[]
        ) {
        this.mtgService = new MtgCardService();
    }

    public isAllowedCommand(message : Message | PartialMessage): boolean {
        let isCommand = this.discordService.checkIsCommand(message, `${config.prefix}mtg`);
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