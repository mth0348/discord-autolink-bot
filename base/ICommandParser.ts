import { Message, PartialMessage } from 'discord.js';

export interface ICommandParser {

    isAllowedCommand(message: Message | PartialMessage) : boolean;

    executeAsync(message: Message | PartialMessage) : Promise<void>;
}