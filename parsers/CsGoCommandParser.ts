import { AwaitReactionsOptions, CollectorFilter, GuildEmoji, Message, MessageEmbed, PartialMessage } from 'discord.js';
import { DiscordService } from '../services/DiscordService';
import { Logger } from '../helpers/Logger';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { ParameterService } from '../services/ParameterService';
import { CsGoMap } from '../dtos/csgo/CsGoMap';
import { CsGoSide } from '../dtos/csgo/CsGoSide';
import { CsGoNadesService } from '../services/csgo/CsGoNadesService';
import { CsGoDataRepository } from '../persistence/repositories/CsGoDataRepository';
import { CsGoVideo } from '../persistence/entities/csgo/CsGoVideo';
import { CsGoNadeType } from '../dtos/csgo/CsGoNadeType';
import { StringHelper } from '../helpers/StringHelper';
import { DrunkenBot } from '../base/DrunkenBot';

export class CsGoCommandParser extends BaseCommandParser {

    public name: string = "CS GO Parser";

    protected prefixes: string[] = ["nades", "cs", "csgo", "nade"];

    public static AVAILABLE_TYPES = ["smoke", "s", "flash", "f", "m", "molo", "moli", "molli", "molly", "moly", "molotov", "molotof"];
    public static AVAILABLE_MAPS = Object.keys(CsGoMap);
    public static AVAILABLE_SIDES = Object.keys(CsGoSide);

    private csGoDataRepository: CsGoDataRepository;
    private csGoNadesService: CsGoNadesService;

    private emoji_smoke: GuildEmoji;
    private emoji_molotov: GuildEmoji;
    private emoji_flash: GuildEmoji;
    private emoji_ct: GuildEmoji;
    private emoji_t: GuildEmoji;
    private emoji_numbers: string[] = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

    private defaultAwaitReactionFilter: CollectorFilter;
    private defaultAwaitReactionOptions: AwaitReactionsOptions;

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, undefined, undefined /* means no permission checks */);

        this.defaultAwaitReactionFilter = (reaction, user) => { return user.id !== reaction.message.author.id; };
        this.defaultAwaitReactionOptions = { max: 1, time: 30000 };

        this.csGoDataRepository = new CsGoDataRepository();
        this.csGoNadesService = new CsGoNadesService(this.csGoDataRepository);

        console.log("|| - registered CS GO parser.  ||");
    }

    public async executeAsync(message: Message | PartialMessage): Promise<void> {

        this.updateEmojiCache(message);

        // extract parameters.
        const parameters = this.parameterService.extractParameters(message.content, []);

        // decide if user asked for help.
        if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
            this.showHelp(message);
            return;
        }

        // early exit if no params are found.
        if (message.content.indexOf(" ") < 0) {
            message.reply("No parameters found. Please try again.");
            return;
        }

        const queryString = message.content.split(" ").slice(1).join(" ");

        const results = this.csGoNadesService.getForQuery(queryString);
        this.printOutRecords(message, results);
    }

    private printOutRecords(message: Message | PartialMessage, records: CsGoVideo[]) {
        if (records.length > 9) {

            let reply = "There are still over 10 search results, try adding more information to your query. Found results:\r\n";
            records.slice(0, Math.min(12, records.length)).forEach(r => reply += `${this.toSuggestionRow(r)}\r\n`);
            message.reply(reply + "...");

        } else if (records.length <= 0) {

            message.reply("Sorry, I didn't find anything for your query, try adding more information");

        } else if (records.length === 1) {

            this.sendResult(message, records[0]);

        } else {

            const embed = new MessageEmbed()
                .setTitle("CSGO Nades Bot Result")
                .setDescription("The following clips have been found:\r\n")
                .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128');

            records.forEach((r, i) => {
                const row = this.toResultRow(r, i);
                embed.addField(row, r.description.length > 0 ? r.description : "-")
            });

            const self = this;

            message.reply("", embed).then(function (embed) {
                records.forEach((r, i) => embed.react(self.emoji_numbers[i]));
                embed.awaitReactions(self.defaultAwaitReactionFilter, self.defaultAwaitReactionOptions)
                    .then(collected => {
                        const reaction = collected.first();
                        if (reaction === undefined) return;
                        switch (reaction.emoji.name) {
                            case "1️⃣":
                                self.sendResult(message, records[0]);
                                return;
                            case "2️⃣":
                                self.sendResult(message, records[1]);
                                return;
                            case "3️⃣":
                                self.sendResult(message, records[2]);
                                return;
                            case "4️⃣":
                                self.sendResult(message, records[3]);
                                return;
                            case "5️⃣":
                                self.sendResult(message, records[4]);
                                return;
                            case "6️⃣":
                                self.sendResult(message, records[5]);
                                return;
                            case "7️⃣":
                                self.sendResult(message, records[6]);
                                return;
                            case "8️⃣":
                                self.sendResult(message, records[7]);
                                return;
                            case "9️⃣":
                                self.sendResult(message, records[8]);
                                return;
                            case "📢":
                                let username = reaction.users.cache.find(e => e.username !== reaction.message.author.username).username;
                                DrunkenBot.reportMessage(message, username, 'User report');
                                return;
                        }
                    }).catch(e => DrunkenBot.reportMessage(message, 'DrunkenBot Workflow', e));
            });
        }
    }

    private sendResult(message: Message | PartialMessage, video: CsGoVideo) {
        message.reply(video.source);
    }

    private toSuggestionRow(video: CsGoVideo): string {
        const side = video.side === CsGoSide.CT ? this.emoji_ct : this.emoji_t;
        const type = video.type === CsGoNadeType.Smoke ? this.emoji_smoke : CsGoNadeType.Molotov ? this.emoji_molotov : this.emoji_flash;
        const map = StringHelper.capitalizeFirstChar(video.map);
        const location = video.location;

        return `${map} - ${side.toString()} - ${type.toString()} - ${location}`;
    }

    private toResultRow(video: CsGoVideo, index: number): string {
        const side = video.side === CsGoSide.CT ? this.emoji_ct : this.emoji_t;
        const type = video.type === CsGoNadeType.Smoke ? this.emoji_smoke : CsGoNadeType.Molotov ? this.emoji_molotov : this.emoji_flash;
        const map = StringHelper.capitalizeFirstChar(video.map);
        const location = video.location;

        return `${this.emoji_numbers[index]}: ${map} - ${side.toString()} - ${type.toString()} - ${location}`;
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
            .addField(`Filters`, "The parameter system has been reworked in hope to ease the usage of this module. " +
                "Just type your query after !nades and the bot will try and match as many results as possible. The param order doesn't matter anymore:\r\n" +
                "`!nades mirage smoke t con`\r\n`!nades t smoke long mid`\r\n`!nades moly t`")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, "", embed);
    }

    private updateEmojiCache(message: Message | PartialMessage) {
        this.emoji_smoke = message.guild.emojis.cache.find(e => e.name === 'csgo_smoke');
        this.emoji_molotov = message.guild.emojis.cache.find(e => e.name === 'csgo_molotov_ct');
        this.emoji_flash = message.guild.emojis.cache.find(e => e.name === 'csgo_flash');
        this.emoji_ct = message.guild.emojis.cache.find(e => e.name === 'csgo_ct');
        this.emoji_t = message.guild.emojis.cache.find(e => e.name === 'csgo_t');
    }
}