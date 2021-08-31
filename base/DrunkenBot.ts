import { Client, Message, PartialMessage, TextChannel } from 'discord.js';
import { MtgCommandParser } from "../parsers/MtgCommandParser";
import { DiscordService } from "../services/DiscordService";
import { ICommandParser } from "./ICommandParser";
import { ParameterService } from '../services/ParameterService';
import { ImageProvider } from '../domain/repositories/ImageProvider';
import { Logger } from '../helpers/Logger';
import { BotCommandParser } from '../parsers/BotCommandParser';
import { CsGoCommandParser } from '../parsers/CsGoCommandParser';
import { DndCommandParser } from '../parsers/DndCommandParser';
import { MusicCommandParser } from '../parsers/MusicCommandParser';

export class DrunkenBot {

    private discordService: DiscordService;
    private parameterService: ParameterService;
    private client: Client;

    private registeredParsers: ICommandParser[];

    constructor(token: string) {
        this.client = new Client();
        this.client.login(token);

        this.discordService = new DiscordService();
        this.parameterService = new ParameterService();
        this.registeredParsers = [];

        console.log("||=============================||");
        console.log("||    DRUNKEN DISCORD BOT      ||");
        console.log("||          by Mats            ||");
        console.log("||=============================||");
        console.log("");
        console.log("||=== Parsers =================||");
        this.registerCommandParsers();

        ImageProvider.loadImageDatabase();

        console.log("||=============================||");
        console.log("BOT READY!");
        console.log("");
    }

    public startListening(): void {
        this.client.on('message', message => {
            this.registeredParsers.forEach(async parser => {
                if (parser.isAllowedCommand(message)) {
                    await this.startWorkflow(parser, message);
                }
            });
        });
    }

    private async startWorkflow(parser: ICommandParser, message: Message | PartialMessage) {
        Logger.clearStack();

        try {
            await parser.executeAsync(message);
        }
        catch (e) {
            message.channel.send("Oops, something went wrong, sorry. The error has been reported automatically. Please try again...");
            DrunkenBot.reportMessage(message, parser.name, e);
        }
    }

    public static reportMessage(message: Message | PartialMessage, reporter: string, e: any) {
        message.client.user.setActivity();
        
        let msg = "";

        msg += `Error reported by "${reporter}":\r\n`;
        msg += `Exception: ${e}\r\n`;
        msg += `LogStack:\r\n`;
        msg += `==========================================\r\n`;

        const logStack = Logger.getStack();
        logStack.forEach(log => {
            msg += `${log}\r\n`;
        });

        msg += `==========================================`;

        console.warn(msg);

        let reportChannel = message.client.channels.cache.map(c => c as TextChannel).find(c => c.name.endsWith("bot-reports"));
        if (reportChannel) {
            reportChannel.send(msg).then(m => m.suppressEmbeds(true));
        }
    }

    private registerCommandParsers(): void {
        this.registeredParsers.push(new BotCommandParser(this.discordService, this.parameterService));
        this.registeredParsers.push(new MtgCommandParser(this.discordService, this.parameterService));
        this.registeredParsers.push(new CsGoCommandParser(this.discordService, this.parameterService));
        this.registeredParsers.push(new DndCommandParser(this.discordService, this.parameterService));
        this.registeredParsers.push(new MusicCommandParser(this.discordService, this.parameterService));
        // this.registeredParsers.push(new MtgCommandParser()); // generalParser
        // this.registeredParsers.push(new MtgCommandParser()); // minigameParser
        // this.registeredParsers.push(new MtgCommandParser()); // dndParser
        // this.registeredParsers.push(new MtgCommandParser()); // huntParser
    }
}