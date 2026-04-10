import { APIEmbedField, AttachmentBuilder, EmbedBuilder, EmbedFooterOptions, Message, PartialMessage } from "discord.js";
import { DiscordService } from "../services/DiscordService";
import { Logger } from "../helpers/Logger";
import { BaseCommandParser } from "../base/BaseCommandParser";
import { ParameterService } from "../services/ParameterService";

export class BotCommandParser extends BaseCommandParser {
  public name: string = "Bot Parser";

  protected prefixes: string[] = ["help", "bot", "status"];

  constructor(discordService: DiscordService, parameterService: ParameterService) {
    super(discordService, parameterService, undefined, undefined /* means no permission checks */);

    console.log("|| - registered Bot parser.    ||");
  }

  public async executeAsync(message: Message | PartialMessage): Promise<void> {
    // extract parameters.
    const parameters = this.parameterService.extractParameters(message.content, []);

    // decide if user asked for status.
    if (this.parameterService.tryGetParameterValue("status", parameters) === "status" || message.content.substr(1).startsWith("status")) {
      this.discordService.sendMessage(message, "Bot is running! ✅");
      return;
    }

    Logger.log(`${message.author.username} requested help: ` + message.content);

    const embed = new EmbedBuilder();
    const file = new AttachmentBuilder("../assets/discordjs.png");

    embed
      .setTitle("Bot Overview")
      .setDescription("This is the new DrunKen Discord Bot! Here are the registered modules:")
      .addFields({
        name: `MtG Card Generator`,
        value: "Outputs randomly generated Magic The Gathering cards.\r\nCommands: `!mtg`, `!magic` or `!card`. Add `help` for more details.",
      } as APIEmbedField)
      .setTimestamp()
      .setFooter({
        text: "DrunKen Discord Bot",
        iconURL: "https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128",
      } as EmbedFooterOptions)
      .setImage("attachment://banner.png");

    this.discordService.sendMessageEmbed(message, { embeds: [embed], files: [file] });
  }
}
