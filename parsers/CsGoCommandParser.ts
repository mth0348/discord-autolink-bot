import { Message, MessageEmbed, PartialMessage } from 'discord.js';
import { DiscordService } from '../services/DiscordService';
import { Logger } from '../helpers/Logger';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { ParameterService } from '../services/ParameterService';
import { CsGoMap } from '../dtos/csgo/CsGoMap';
import { CsGoSide } from '../dtos/csgo/CsGoSide';

export class CsGoCommandParser extends BaseCommandParser {

    public name: string = "CS GO Parser";

    protected prefixes: string[] = ["nades", "cs", "csgo"];

    public static AVAILABLE_TYPES = ["smoke", "s", "flash", "f", "m", "molo", "moli", "moly", "molotov", "molotof"];
    public static AVAILABLE_MAPS = Object.keys(CsGoMap);
    public static AVAILABLE_SIDES = Object.keys(CsGoSide);

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, undefined, undefined /* means no permission checks */);

        console.log("|| - registered CS GO parser.  ||");
    }

    public async executeAsync(message: Message | PartialMessage): Promise<void> {

        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/banner.png",
                name: "banner.png"
            }]
        });

        // extract parameters.
        const parameters = this.parameterService.extractParameters(message.content, []);

        // decide if user asked for help.
        if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
            this.showHelp(message);
            return;
        }

        this.discordService.sendMessage(message, "This bot is still under construction...");
    }

    private showHelp(message: Message | PartialMessage) {
        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/csgo/banner.png",
                name: "banner.png"
            }]
        });

        embed.setTitle("CSGO Nades Bot Overview")
            .setDescription("Here is how the parameter system works for this module:")
            .addField(`Click-through`, "Emoji click support through the whole process. No more copying commands.")
            .addField(`Filters`, "The parameter system has been reworked in hope to ease the usage of this module:\r\n" +
                "Just type your query after !nades and the bot will try and match as many results as possible. For example:\r\n" +
                "`!nades mirage ct abs`\r\n`!nades inferno pit flash`\r\n")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, embed);
    }
}