import { Client, Message, PartialMessage } from "discord.js";
import { MtgCommandParser } from "../parsers/MtgCommandParser";
import { DiscordService } from "../services/DiscordService";
import { ICommandParser } from "./ICommandParser";
import { ParameterService } from '../services/ParameterService';

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

        this.registerCommandParsers();
    }

    public startListening() : void {
        this.client.on('message', async message => {

            this.registeredParsers.forEach(parser => {
                if (parser.isAllowedCommand(message)) {
                    this.startWorkflow(parser, message);
                }
            });

        });
    }

    private startWorkflow(parser: ICommandParser, message: Message | PartialMessage) {
        try {
            parser.execute(message);
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