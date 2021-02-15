import { Client, Message, PartialMessage } from "discord.js";
import { MtgCommandParser } from "../parsers/MtgCommandParser";
import { DiscordService } from "../services/DiscordService";
import { ICommandParser } from "./ICommandParser";
import { ParameterService } from '../services/ParameterService';
import { ImageProvider } from '../persistence/repositories/ImageProvider';

export class DrunkenBot {

    private discordService: DiscordService;
    private parameterService: ParameterService;
    private client: Client;

    private registeredParsers : ICommandParser[];

    constructor(token: string) {
        this.client = new Client();
        this.client.login(token);

        this.discordService = new DiscordService();
        this.parameterService = new ParameterService();
        this.registeredParsers = [];

        console.log("Registering command parsers...");
        this.registerCommandParsers();

        console.log("Loading image cache...");
        ImageProvider.loadImageDatabase();

        console.log("BOT READY!");
    }

    public startListening() : void {
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
            if (message.author.username === "Telerik") // TODO REMOVE CHECK.
                await parser.executeAsync(message);
        }
        catch (e) {
            console.warn(e);
            message.channel.send("Oops, something went wrong, sorry. Please try again...");
        }
    }

    private registerCommandParsers() : void {
        this.registeredParsers.push(new MtgCommandParser(this.discordService, this.parameterService));
        // this.registeredParsers.push(new MtgCommandParser()); // csgoNadeParser
        // this.registeredParsers.push(new MtgCommandParser()); // generalParser
        // this.registeredParsers.push(new MtgCommandParser()); // minigameParser
        // this.registeredParsers.push(new MtgCommandParser()); // dndParser
        // this.registeredParsers.push(new MtgCommandParser()); // huntParser
    }
}