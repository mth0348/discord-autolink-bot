import { Message, MessageEmbed, PartialMessage, VoiceConnection, MessageReaction } from 'discord.js';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { DiscordService } from '../services/DiscordService';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { Logger } from '../helpers/Logger';
import { ParameterService } from '../services/ParameterService';
import { Queue } from '../dtos/Queue';
import { MusicTrack } from '../dtos/music/MusicTrack';
import { LogType } from '../dtos/LogType';

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

export class MusicCommandParser extends BaseCommandParser {

    public name: string = "Music Parser";

    protected prefixes: string[] = ["music", "play", "queue", "skip", "stop", "clear", "search", "query", "find", "remove", "delete", "replay", "restart"];

    private globalQueue: Queue<MusicTrack>;
    private voiceConnection: VoiceConnection;
    private icons: string[] = ["1️⃣", "2️⃣", "3️⃣"];
    private isPlaying: boolean;
    private timeout: NodeJS.Timeout;

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, ConfigProvider.current().channelPermissions.music, ConfigProvider.current().rolePermissions.music);

        this.globalQueue = new Queue<MusicTrack>();

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

        let invalidCommand = false;
        const songName = parameters.map(p => p.name).join(" ");

        if (message.content.startsWith(`${ConfigProvider.current().prefix}play`)) {
            await this.queueSong(message, songName);
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}search`)
            || message.content.startsWith(`${ConfigProvider.current().prefix}find`)
            || message.content.startsWith(`${ConfigProvider.current().prefix}query`)) {
            await this.searchSong(message, songName);
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}skip`)) {
            await this.skipSong(message);
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}remove`)
            || message.content.startsWith(`${ConfigProvider.current().prefix}delete`)) {
            await this.removeSong(message, parseInt(parameters[0].value));
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}stop`)) {
            await this.stopPlaying(message);
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}clear`)) {
            await this.clearQueue(message);
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}queue`)) {
            await this.getQueue(message);
            return;
        } else if (message.content.startsWith(`${ConfigProvider.current().prefix}restart`)
            || message.content.startsWith(`${ConfigProvider.current().prefix}replay`)) {
            await this.replaySong(message);
            return;
        } else {
            invalidCommand = true;
        }

        if (!invalidCommand) {
            // delete input message if possible.
            if (message.channel.type !== "dm") {
                message.delete({});
            }
        }
    }

    private async queueSong(message: Message | PartialMessage, songName: string) {
        if (!(await this.ensureVoicePermissions(message))) return;

        const songSearchResult = await ytsr(songName, { limit: 1, pages: 1 });
        const numberOfResults = songSearchResult.items.length;

        if (numberOfResults > 0) {
            let bestMatch = songSearchResult.items[0] as MusicTrack;
            if (bestMatch.type === "playlist" && bestMatch.firstVideo) {
                this.discordService.sendMessage(message, `This is a playlist. I can only queue the first song...`);
                bestMatch = bestMatch.firstVideo as MusicTrack;
            }

            this.queueMusicTrack(message, bestMatch);
            Logger.log(`Added '${bestMatch.title}' to music queue.`);
            this.discordService.sendMessage(message, `Added '${bestMatch.title}' to music queue.`);
        } else {
            this.discordService.sendMessage(message, "I found no songs for your input.");
        }
    }

    private async searchSong(message: Message | PartialMessage, songName: string) {
        if (!(await this.ensureVoicePermissions(message))) return;

        const songSearchResult = await ytsr(songName, { limit: 3, pages: 1 });
        const numberOfSuggestions = Math.min(3, songSearchResult.items.length);

        if (numberOfSuggestions > 0) {
            const voteCallbacks: ((reaction: MessageReaction) => void)[] = [];

            let msg = `I found several results. Best matches are:`;
            for (let i = 0; i < numberOfSuggestions; i++) {
                const song = songSearchResult.items[i] as MusicTrack;
                msg += `\r\n ${this.icons[i]} ${song.title}`;
                voteCallbacks.push((raction) => {
                    this.queueMusicTrack(message, song);
                    Logger.log(`Added '${song.title}' to music queue.`);
                    this.discordService.sendMessage(message, `Added '${song.title}' to music queue.`);
                });
            }
            msg += "\r\nWhich one should I play?";

            this.discordService.sendMessageWithVotes(message, msg, this.icons.slice(0, numberOfSuggestions), voteCallbacks);

        } else {
            this.discordService.sendMessage(message, "I found no songs for your input.");
        }

        Logger.log(`Searched for '${songName}' with ${numberOfSuggestions} (${songSearchResult.items.length}) results.`);
    }

    private async skipSong(message: Message | PartialMessage) {
        if (!(await this.ensureVoicePermissions(message))) return;

        this.voiceConnection.dispatcher.end();
    }

    private async removeSong(message: Message | PartialMessage, index: number) {
        if (!(await this.ensureVoicePermissions(message))) return;
        if (isNaN(index) || index <= 0) return;

        if (this.globalQueue.getQueue().length >= index) {
            const removedSong = this.globalQueue.removeAt(index);

            Logger.log(`Removed queue item at index ${index} with name '${removedSong.title}'.`);
            this.discordService.sendMessage(message, `Removed '${removedSong.title}' at position ${index} for you.`);
        }
    }

    private async replaySong(message: Message | PartialMessage) {
        if (!(await this.ensureVoicePermissions(message))) return;

        const currentSong = this.globalQueue.peek();
        this.globalQueue.addSecondFromTop(currentSong);

        this.voiceConnection.dispatcher.end();

        Logger.log(`Restarted the current song with name '${currentSong.title}'.`);
    }

    private async stopPlaying(message: Message | PartialMessage) {
        if (!(await this.ensureVoicePermissions(message))) return;

        message.client.user.setActivity();

        this.discordService.sendMessage(message, `Stopped playing and cleared the queue for you.`);
        this.globalQueue.clear();
        this.voiceConnection.dispatcher.end();

        Logger.log(`Stopped playing and cleared queue.`);
    }

    private async clearQueue(message: Message | PartialMessage) {
        if (!(await this.ensureVoicePermissions(message))) return;

        const top = this.globalQueue.peek();
        this.globalQueue.clear();
        this.globalQueue.add(top);

        Logger.log(`Cleared queue.`);
        this.discordService.sendMessage(message, `Cleared the queue for you.`);
    }

    private async getQueue(message: Message | PartialMessage) {
        const queue = this.globalQueue.getQueue();

        if (queue.length === 0) {
            this.discordService.sendMessage(message, `The queue is empty.`);
            return;
        }

        const currentlyPlaying = `🎵 \> **${queue[0].title}**`;
        const restOfQueue = queue.length > 1 ? queue.slice(1).map((song, index) => `\r\n${index + 1} > ${song.title}`) : "";

        const embed = new MessageEmbed();
        embed.setTitle("Current queue:")
            .setDescription(currentlyPlaying + restOfQueue);
        this.discordService.sendMessageEmbed(message, "", embed);
    }

    private async ensureVoicePermissions(message: Message | PartialMessage) {
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

        return true;
    }

    private async joinVoiceChannel(message: Message | PartialMessage) {
        const voiceChannel = message.member.voice.channel;
        this.voiceConnection = await voiceChannel.join();
    }

    private async playNextSong(message: Message | PartialMessage) {
        if (!(await this.ensureVoicePermissions(message))) return;
        await this.joinVoiceChannel(message);

        const song = this.globalQueue.peek();

        message.client.user.setActivity({ type: "LISTENING", name: song.title });

        const embed = new MessageEmbed()
            .setTitle(song.title)
            .setDescription(`Now playing - requested by ${message.guild.member(message.author).displayName}`)
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setURL(song.url)
            .setThumbnail(song.bestThumbnail.url)
            .setTimestamp();
        this.discordService.sendMessageEmbed(message, "", embed);

        const dispatcher = this.voiceConnection
            .play(await ytdl(song.url, {
                type: 'opus',
                filter: 'audioonly',
                quality: 'highestaudio'
            }))
            .on("finish", () => {
                this.globalQueue.shift();

                if (!this.globalQueue.isEmpty()) {
                    this.playNextSong(message);
                } else {
                    this.isPlaying = false;
                    message.client.user.setActivity();

                    Logger.log("Disconnect timer started for idle in voice channel (2min).")
                    this.timeout = setTimeout(() => this.leaveIfIdle(this.isPlaying, this.voiceConnection), 5 * 60 * 1000);
                }
            })
            .on("error", error => Logger.log(error.message, LogType.Warning, error));

        dispatcher.setVolumeLogarithmic(0.25);

        this.isPlaying = true;

        
        if (this.timeout) {
            Logger.log("Cleared timeout for voice channel disconnect.")
            clearTimeout(this.timeout);
        }
    }

    private async queueMusicTrack(message: Message | PartialMessage, song: MusicTrack): Promise<void> {
        if (this.globalQueue.isEmpty() && !this.isPlaying) {
            this.globalQueue.add(song);
            this.playNextSong(message);
        } else {
            this.globalQueue.add(song);
        }
    }

    private showHelp(message: Message | PartialMessage): void {
        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/music/banner.png",
                name: "banner.png"
            }]
        });

        embed.setTitle("Music Bot Overview")
            .setDescription("The music bot replaces the Groovy bot. Use the following commands:")
            .addField(`!play <song name>`, "Queue a song by best matching title.")
            .addField(`!search <search query>`, "Search for a bunch of songs and pick one to queue.")
            .addField(`!queue`, "Get the current queue.")
            .addField(`!skip`, "Skip the current song\r\n.")
            .addField(`Others`, "!stop - Stop playing and clear queue.\r\n"
                + "!restart - Restart the current song.\r\n"
                + "!clear - Clear the queue but play the current song to end.")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, "", embed);
    }

    private leaveIfIdle(isPlaying: boolean, voiceConnection: VoiceConnection): void {
        if (!isPlaying && voiceConnection) {
            voiceConnection.channel.leave();
        }
    }
}

