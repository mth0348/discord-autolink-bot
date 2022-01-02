import { AwaitReactionsOptions, CollectorFilter, GuildEmoji, Message, MessageEmbed, PartialMessage } from 'discord.js';
import { DiscordService } from '../services/DiscordService';
import { Logger } from '../helpers/Logger';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { ParameterService } from '../services/ParameterService';
import { CsGoMap } from '../dtos/csgo/CsGoMap';
import { CsGoSide } from '../dtos/csgo/CsGoSide';
import { CsGoNadesService } from '../services/csgo/CsGoNadesService';
import { CsGoDataRepository } from '../domain/repositories/CsGoDataRepository';
import { CsGoVideo } from '../domain/models/csgo/CsGoVideo';
import { CsGoNadeType } from '../dtos/csgo/CsGoNadeType';
import { StringHelper } from '../helpers/StringHelper';
import { DrunkenBot } from '../base/DrunkenBot';

export class LolCommandParser extends BaseCommandParser {

    public name: string = "Leage Of Legends Parser";

    protected prefixes: string[] = ["lol", "league", "leagueoflegends", "roles"];

    private defaultAwaitReactionFilter: CollectorFilter;
    private defaultAwaitReactionOptions: AwaitReactionsOptions;

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, undefined, undefined /* means no permission checks */);

        this.defaultAwaitReactionFilter = (reaction, user) => { return user.id !== reaction.message.author.id; };
        this.defaultAwaitReactionOptions = { max: 1, time: 30000 };

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

        let members = parameters.length > 0 ? parameters.map(p => p.name) : message.member.voice.channel.members;

        let assignments = "";
        members.forEach(member => {
            const roleIndex = Math.floor(Math.random() * roles.length);
            assignments += (member.nickname ?? member.displayName) + ": " + roles[roleIndex] + "\r\n";
            roles.splice(roleIndex, 1);
        });
        this.discordService.sendMessage(message, assignments);
    }

    private showHelp(message: Message | PartialMessage) {
        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/csgo/banner.png",
                name: "banner.png"
            }]
        });

        embed.setTitle("LoL Roles Bot Overview")
            .setDescription("This bot assigns random roles to all players in the voice channel.")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, "", embed);
    }
}