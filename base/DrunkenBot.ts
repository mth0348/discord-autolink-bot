import { Client, ClientOptions, GatewayIntentBits, Message, PartialMessage, TextChannel } from "discord.js";
import { DiscordService } from "../services/DiscordService";
import { ICommandParser } from "./ICommandParser";
import { ParameterService } from "../services/ParameterService";
import { Logger } from "../helpers/Logger";
import { BotCommandParser } from "../parsers/BotCommandParser";

export class DrunkenBot {
  private discordService: DiscordService;
  private parameterService: ParameterService;
  private client: Client;

  private registeredParsers: ICommandParser[];

  private isDebug: boolean = false;

  constructor() {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] } as ClientOptions);
    this.client.login(process.env.DISCORD_TOKEN);

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

    console.log("||=============================||");
    console.log("BOT READY!");
    console.log("");
  }

  public startListening(): void {
    this.client.on("message", (message) => {
      this.registeredParsers.forEach(async (parser) => {
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
    } catch (e) {
      if (!this.isDebug) {
        (message.channel as TextChannel).send("Oops, something went wrong, sorry. The error has been reported automatically. Please try again...");
        DrunkenBot.reportMessage(message, parser.name, e);
      } else {
        console.error(e);
      }
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
    logStack.forEach((log) => {
      msg += `${log}\r\n`;
    });

    msg += `==========================================`;

    console.warn(msg);

    let reportChannel = message.client.channels.cache.map((c) => c as TextChannel).find((c) => c.name.endsWith("bot-reports"));
    if (reportChannel) {
      reportChannel.send(msg).then((m) => m.suppressEmbeds(true));
    }
  }

  private registerCommandParsers(): void {
    this.registeredParsers.push(new BotCommandParser(this.discordService, this.parameterService));
  }
}
