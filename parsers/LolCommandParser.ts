import { Message, MessageEmbed, PartialMessage } from 'discord.js';
import { DiscordService } from '../services/DiscordService';
import { Logger } from '../helpers/Logger';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { ParameterService } from '../services/ParameterService';
import { ConfigProvider } from '../helpers/ConfigProvider';

export class LolCommandParser extends BaseCommandParser {

    public name: string = "Leage Of Legends Parser";

    protected prefixes: string[] = ["lol", "league", "leagueoflegends", "role", "roles"];

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, ConfigProvider.current().channelPermissions.lol, ConfigProvider.current().rolePermissions.lol);

        console.log("|| - registered LoL parser.    ||");
    }

    public async executeAsync(message: Message | PartialMessage): Promise<void> {

        // extract parameters.
        const parameters = this.parameterService.extractParameters(message.content, []);

        // decide if user asked for help.
        if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
            this.showHelp(message);
            return;
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            this.discordService.sendMessage(message, "You need to be in a voice channel for that!");
            return;
        }

        let roles = [
            "🌳 Jungle",
            "⚔️ Top",
            "🧙 Mid",
            "🏹 ADC",
            "🛡️ Support",
        ]

        let members = parameters.length > 0
            ? parameters.map(p => p.name)
            : message.member.voice.channel.members.map(m => m.nickname ?? m.displayName);

        let assignments = "";
        members.forEach(member => {
            const roleIndex = Math.floor(Math.random() * roles.length);
            assignments += member + ": " + roles[roleIndex] + "\r\n";
            roles.splice(roleIndex, 1);
        });
        this.discordService.sendMessage(message, assignments);
    }

    private showHelp(message: Message | PartialMessage) {
        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/lol/banner.png",
                name: "banner.png"
            }]
        });

        embed.setTitle("LoL Roles Bot Overview")
            .setDescription("This bot assigns random roles to all players in the voice channel.")
            .addField(`Commands`, "Just type `!lol` or `!league` to match players with roles based on their preferences. To change your preference, use `!role` or `!roles`.")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, "", embed);
    }
}