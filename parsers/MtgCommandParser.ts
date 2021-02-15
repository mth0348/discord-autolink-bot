import { Message, PartialMessage } from 'discord.js';
import { BaseCommandParser } from './../base/BaseCommandParser';

export class MtgCommandParser extends BaseCommandParser {

    public configId: string = "mtg";

    public execute(message: Message | PartialMessage) : void {
        
    }
}