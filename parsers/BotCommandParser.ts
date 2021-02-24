import { Message, MessageEmbed, PartialMessage } from 'discord.js';
import { DiscordService } from '../services/DiscordService';
import { Logger } from '../helpers/Logger';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { ParameterService } from '../services/ParameterService';

export class BotCommandParser extends BaseCommandParser {

    public name: string = "Bot Parser";

    protected prefixes: string[] = ["help", "bot"];

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, undefined, undefined /* means no permission checks */);

        console.log("|| - registered Bot parser.    ||");
    }

    public async executeAsync(message: Message | PartialMessage): Promise<void> {

        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/banner.png",
                name: "banner.png"
            }]
        });

        embed.setTitle("Bot Overview")
            .setDescription("This is the new DrunKen Discord Bot! Here are the registered modules:")
            .addField(`MtG Card Generator`, "Outputs randomly generated Magic The Gathering cards.\r\nCommands: `!mtg`, `!magic` or `!card`. Add `help` for more details.")
            .addField(`CS GO Nades`, "Shows clips of how to precisely throw grenades in CS GO.\r\nCommands: `!nades`, `!cs` or `!csgo`. Add `help` for more details.")
            .addField(`(Coming soon)`, "More modules...")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, "", embed);
    }
}