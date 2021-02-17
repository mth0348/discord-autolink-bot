import { Message, PartialMessage } from 'discord.js';

export interface ICommandParser {

    name: string;

    isAllowedCommand(message: Message | PartialMessage) : boolean;

    executeAsync(message: Message | PartialMessage) : Promise<void>;
}