import { Client, Message, PartialMessage, TextChannel } from 'discord.js';
import { MtgCommandParser } from "../parsers/MtgCommandParser";
import { DiscordService } from "../services/DiscordService";
import { ICommandParser } from "./ICommandParser";
import { ParameterService } from '../services/ParameterService';
import { ImageProvider } from '../persistence/repositories/ImageProvider';
import { Logger } from '../helpers/Logger';
import { BotCommandParser } from '../parsers/BotCommandParser';

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
        try {
            Logger.clearStack();

            // TODO REMOVE CHECK.
            if (message.author.username === "Telerik" && (message.channel as TextChannel).name.toLowerCase() === "dev-playground") {
                await parser.executeAsync(message);
            }
        }
        catch (e) {
            message.channel.send("Oops, something went wrong, sorry. The error has been reported automatically. Please try again...");
            DrunkenBot.reportMessage(message, parser.name, e);
        }
    }

    public static reportMessage(message: Message | PartialMessage, reporter: string, e: any) {
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

        let reportChannel = message.client.channels.cache.map(c => c as TextChannel).find(c => c.name === "bot-reports");
        reportChannel.send(msg);
    }

    private registerCommandParsers(): void {
        this.registeredParsers.push(new BotCommandParser(this.discordService, this.parameterService));
        this.registeredParsers.push(new MtgCommandParser(this.discordService, this.parameterService));
        // this.registeredParsers.push(new MtgCommandParser()); // csgoNadeParser
        // this.registeredParsers.push(new MtgCommandParser()); // generalParser
        // this.registeredParsers.push(new MtgCommandParser()); // minigameParser
        // this.registeredParsers.push(new MtgCommandParser()); // dndParser
        // this.registeredParsers.push(new MtgCommandParser()); // huntParser
    }
}