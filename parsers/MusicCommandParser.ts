import { Message, MessageEmbed, PartialMessage, VoiceConnection } from 'discord.js';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { DiscordService } from '../services/DiscordService';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { Random } from '../helpers/Random';
import { EnumHelper } from '../helpers/EnumHelper';
import { Resources } from '../helpers/Constants';
import { StringHelper } from '../helpers/StringHelper';
import { Logger } from '../helpers/Logger';
import { ParameterService } from '../services/ParameterService';
import { Queue } from '../dtos/Queue';
import { MusicTrack } from '../dtos/music/MusicTrack';
import { LogType } from '../dtos/LogType';

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

export class MusicCommandParser extends BaseCommandParser {

    public name: string = "Music Parser";

    protected prefixes: string[] = ["music", "play", "skip", "stop", "audio"];

    private globalQueue: Queue<any>;
    private voiceConnection: VoiceConnection;

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, ConfigProvider.current().channelPermissions.music, ConfigProvider.current().rolePermissions.music);

        this.globalQueue = new Queue<any>();

        console.log("|| - registered Music parser.  ||");
    }

    public async executeAsync(message: Message | PartialMessage): Promise<void> {

        Logger.log(`${message.author.username} requested a song with: ` + message.content);

        // extract parameters.
        const parameters = this.parameterService.extractParameters(message.content, []);

        // decide if user asked for help.
        if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
            this.showHelp(message);
            return;
        }

        const songName = parameters.map(p => p.name).join(" ");

        if (message.content.startsWith(`${ConfigProvider.current().prefix}play`)) {
            await this.queueSong(message, songName);
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}skip`)) {
            await this.skipSong(message);
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}stop`)) {
            await this.stopPlaying(message);
            return;
        }

        this.discordService.sendMessage(message, "hello");
    }

    private async queueSong(message: Message | PartialMessage, songName: string) {
        if (!this.tryJoinVoiceChannel(message)) return;

        try {
            const songSearchResult = await ytsr(songName, { limits: 1, pages: 1 });
            const bestMatch = songSearchResult.items[0] as MusicTrack;

            if (this.globalQueue.isEmpty()) {
                this.playSong(message, bestMatch);
                this.discordService.sendMessage(message, `Start playing: **${bestMatch.title}**`);
            } else {
                this.globalQueue.add(bestMatch);
                this.discordService.sendMessage(message, `Added to queue: **${bestMatch.title}**`);
            }

            Logger.log(`Added '${bestMatch.title}' to music queue.`);
        }
        catch (e) {
            console.log(e);
        }
    }

    private async playSong(message: Message | PartialMessage, song: MusicTrack) {
        const dispatcher = this.voiceConnection
            .play(ytdl(song.url))
            .on("finish", () => {
                const nextSong = this.globalQueue.next();
                if (nextSong) {
                    this.playSong(message, nextSong);
                }
            })
            .on("error", error => Logger.log(error.message, LogType.Warning, error));

        dispatcher.setVolumeLogarithmic(1);
    }

    private async skipSong(message: Message | PartialMessage) {
        if (!this.tryJoinVoiceChannel(message)) return;

        if (this.globalQueue.isEmpty()){
            this.discordService.sendMessage(message, `There is no song left in the queue.`);
        } else {
            this.voiceConnection.dispatcher.end();
        }
    } 

    private async stopPlaying(message: Message | PartialMessage) {
        if (!this.tryJoinVoiceChannel(message)) return;

        this.discordService.sendMessage(message, `I cleared the queue.`);
        this.voiceConnection.dispatcher.end();
    } 

    private async tryJoinVoiceChannel(message: Message | PartialMessage) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            this.discordService.sendMessage(message, "You need to be in a voice channel to play music!");
            return false;
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            this.discordService.sendMessage(message, "I need the permissions to join and speak in your voice channel!");
            return false;
        }

        this.voiceConnection = await voiceChannel.join();
        return true;
    }

    private showHelp(message: Message | PartialMessage) {
        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/music/banner.png",
                name: "banner.png"
            }]
        });

        embed.setTitle("Music Bot Overview")
            .setDescription("The music bot replaces the Groovy bot.")
            // .addField(`Rendering System`, "Yes, that's right. The bot generates and renders the cards at runtime to a 2D image canvas. Artworks are chosen randomly amongst those that fit the card's type best.")
            // .addField(`New Algorithm`, "The way cards are generated has changed. Now, the color is chosen first, the rest comes after. This means better alignment of abilities with colors, plus better balancing of manacosts.")
            // .addField(`More Content`, "There are over 5000 lines of config file for the generator to draw names, abilities and keywords from. Also, there are over 1000 card artworks to choose from, all hand-picked by Mats.")
            // .addField(`Card Types`, "The bot can generate almost all types of cards. Supported are *creatures*, *artifacts*, *artifact creatures*, *instants*, *sorceries*, *lands*, *enchantments*, *planeswalkers*, and subtypes like *auras* and *equipments*.")
            // .addField(`Filters`, "A new parameter system has taken the place of the old one, allowing for more control in generating cards. Use parameters like this:\r\n" +
            //     "`type:<type>` (short `t`), like 't:creature'\r\n`color:<color>` (short `c`), like 'c:ubr' or 'color:c'\r\n`rarity:<rarity>` (short `r`), like 'r:ymthic'.\r\n`name:<text>` (short `n`) to put a name yourself (use '_' for spaces).\r\n")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, "", embed);
    }
}