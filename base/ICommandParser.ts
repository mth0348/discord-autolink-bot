import { Message, PartialMessage } from 'discord.js';

export interface ICommandParser {

    isAllowedCommand(message: Message | PartialMessage) : boolean;

    execute(message: Message | PartialMessage) : void;
}