import { Message, MessageEmbed, PartialMessage } from 'discord.js';
import { MtgCardService } from '../services/mtg/MtgCardService';
import { BaseCommandParser } from './../base/BaseCommandParser';
import { DiscordService } from '../services/DiscordService';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { ParameterService } from '../services/ParameterService';
import { ParameterServiceConfig } from '../dtos/ParameterServiceConfig';
import { Random } from '../helpers/Random';
import { EnumHelper } from '../helpers/EnumHelper';
import { MtgCardRenderer } from '../services/mtg/MtgCardRenderer';
import { ImageProvider } from '../persistence/repositories/ImageProvider';
import { Resources } from '../helpers/Constants';
import { MtgCardRarity } from '../dtos/mtg/MtgCardRarity';
import { MtgCardType } from '../dtos/mtg/MtgCardType';
import { MtgOracleTextWrapperService } from '../services/mtg/MtgOracleTextWrapperService';
import { MtgDataRepository } from '../persistence/repositories/MtgDataRepository';
import { MtgSyntaxResolver } from '../services/mtg/MtgSyntaxResolver';
import { MtgAbilityService } from '../services/mtg/MtgAbilityService';
import { StringHelper } from '../helpers/StringHelper';
import { MtgPlaneswalkerCardRenderer } from '../services/mtg/MtgPlaneswalkerCardRenderer';
import { Logger } from '../helpers/Logger';

import Canvas = require("canvas");

export class MtgCommandParser extends BaseCommandParser {

    public name: string = "MtG Parser";

    protected prefixes: string[] = [ "mtg", "magic", "card" ];

    public static AVAILABLE_TYPES = ["creature", "land", "instant", "sorcery", "planeswalker", "enchantment", "artifact", "aura", "artifactcreature","equipment"];
    public static AVAILABLE_RARITIES = ["common", "uncommon", "rare", "mythic"];

    public static COLORLESS = ["c"];
    public static BASIC_COLORS = ["w", "u", "b", "r", "g"];
    public static TWO_COLOR_PAIRS = ["wu", "wb", "wr", "wg", "ub", "ur", "ug", "br", "bg", "rg"];
    public static THREE_COLOR_PAIRS = ["wub", "wur", "wug", "wbr", "wbg", "wrg", "ubr", "ubg", "urg", "brg"];
    public static FOUR_COLOR_PAIRS = ["wubr", "wugb", "wurg", "wbrg", "ubrg"];
    public static FIVE_COLORS = ["wubrg"];

    private mtgDataRepository: MtgDataRepository;
    private mtgAbilityService: MtgAbilityService;
    private mtgSyntaxResolver: MtgSyntaxResolver;
    private mtgOracleTextWrapperService: MtgOracleTextWrapperService;
    private mtgCardService: MtgCardService;

    private paramConfigs: ParameterServiceConfig[];

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, ConfigProvider.current().channelPermissions.mtg, ConfigProvider.current().rolePermissions.mtg);

        this.mtgDataRepository = new MtgDataRepository();
        this.mtgAbilityService = new MtgAbilityService(this.mtgDataRepository);
        this.mtgSyntaxResolver = new MtgSyntaxResolver(this.mtgDataRepository, this.mtgAbilityService);
        this.mtgOracleTextWrapperService = new MtgOracleTextWrapperService();
        this.mtgCardService = new MtgCardService(this.mtgDataRepository, this.mtgAbilityService, this.mtgSyntaxResolver, this.mtgOracleTextWrapperService);

        this.paramConfigs = [
            new ParameterServiceConfig("type", "t", MtgCommandParser.AVAILABLE_TYPES),
            new ParameterServiceConfig("rarity", "r", MtgCommandParser.AVAILABLE_RARITIES),
            new ParameterServiceConfig("color", "c"),
            new ParameterServiceConfig("name", "n"),
        ];

        this.initializeCardRendererData();

        console.log("|| - registered MtG parser.    ||");
    }

    public async executeAsync(message: Message | PartialMessage): Promise<void> {

        Logger.log(`${message.author.username} requested an MtG card with: ` + message.content);

        // extract parameters.
        const parameters = this.parameterService.extractParameters(message.content, this.paramConfigs);

        // decide if user asked for help.
        if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
            this.showHelp(message);
            return;
        }

        // setup global card settings.
        const cardType = this.parameterService.tryGetParameterValue("type", parameters) ?? this.getRandomType();
        const cardRarity = this.parameterService.tryGetParameterValue("rarity", parameters) ?? this.getRandomRarity();
        const cardColor = this.parameterService.tryGetParameterValue("color", parameters) ?? this.getRandomColor(cardType);
        const cardName = this.parameterService.tryGetParameterValue("name", parameters);

        // start card generation.
        const card = this.mtgCardService.generateCard(EnumHelper.toMtgCardType(cardType), EnumHelper.toMtgCardRarity(cardRarity), this.stripInvalidColorValues(cardColor), cardName);

        // render card.
        const mtgCardRenderer = card.type === MtgCardType.Planeswalker ? new MtgPlaneswalkerCardRenderer(card) : new MtgCardRenderer(card);
        const renderedCard = await mtgCardRenderer.renderCard();

        this.discordService.sendMessageWithReactions(message, "", renderedCard);
    }

    private showHelp(message: Message | PartialMessage) {
        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/mtg/bot banner.png",
                name: "banner.png"
            }]
        });

        embed.setTitle("MtG Bot Overview")
            .setDescription("The new MtG Bot can do a lot of awesome stuff. Here are its features:")
            .addField(`Rendering System`, "Yes, that's right. The bot generates and renders the cards at runtime to a 2D image canvas. Artworks are chosen randomly amongst those that fit the card's type best.")
            .addField(`Algorithm`, "The way cards are generated has changed. Now, the color is chosen first, the rest comes after. This means better alignment of abilities with colors, plus better balancing of manacosts.")
            .addField(`Content`, "There are over 5000 lines of config file for the generator to draw names, abilities and keywords from. Also, there are over 1000 card artworks to choose from, all hand-picked by Mats.")
            .addField(`Card Types`, "The bot can generate almost all types of cards. Supported are *creatures*, *artifacts*, *artifact creatures*, *instants*, *sorceries*, *lands*, *enchantments* and *planeswalkers*.")
            .addField(`Filters`, "A new parameter system has taken the place of the old one, allowing for more control in generating cards. Use parameters like this:\r\n" +
                                 "`type:<type>` (short `t`), like 't:creature'\r\n`color:<color>` (short `c`), like 'c:ubr' or 'color:c'\r\n`rarity:<rarity>` (short `r`), like 'r:ymthic'.\r\n`name:<text>` (short `n`) to put a name yourself (use '_' for spaces).\r\n")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, embed);
    }

    private initializeCardRendererData() {
        Canvas.registerFont('assets/fonts/MPLANTIN.ttf', { family: "mplantin" });
        Canvas.registerFont('assets/fonts/MPLANTIN-BOLD.ttf', { family: "mplantinbold" });
        Canvas.registerFont('assets/fonts/MPLANTIN-ITALIC.ttf', { family: "mplantinitalic" });
        Canvas.registerFont('assets/fonts/MatrixBold.ttf', { family: "matrixbold" });

        Resources.MtgImageUrls.forEach(url => {
            ImageProvider.registerImageUrl(url.path);
        });

        ImageProvider.registerImageUrl("assets/img/mtg/expansion/common.png");
        ImageProvider.registerImageUrl("assets/img/mtg/expansion/uncommon.png");
        ImageProvider.registerImageUrl("assets/img/mtg/expansion/rare.png");
        ImageProvider.registerImageUrl("assets/img/mtg/expansion/mythic.png");
    }

    private getRandomType(): string {

        /* Aura and ArtifactCreature are not "real" types */

        const type = Random.complex([
            { value: MtgCardType.Instant,       chance: 0.14 },
            { value: MtgCardType.Sorcery,       chance: 0.14 },
            { value: MtgCardType.Creature,      chance: 0.14 },
            { value: MtgCardType.Planeswalker,  chance: 0.14 },
            { value: MtgCardType.Enchantment,   chance: 0.14 },
            { value: MtgCardType.Artifact,      chance: 0.14 },
            { value: MtgCardType.Land,          chance: 0.14 },
        ], Random.nextFromList([MtgCardType.Instant, MtgCardType.Sorcery, MtgCardType.Creature, MtgCardType.Land, MtgCardType.Planeswalker, MtgCardType.Enchantment, MtgCardType.Artifact]));

        // TODO support more types.
        // return Random.nextFromList(Object.keys(MtgCardType));

        return type;
    }

    private getRandomRarity(): string {
        return Random.nextFromList(Object.keys(MtgCardRarity));
    }

    private getRandomColor(cardType: string): string {
        const allowColorless = [MtgCardType.Creature, MtgCardType.Artifactcreature, MtgCardType.Land, MtgCardType.Artifact, MtgCardType.Planeswalker].some(c => c == cardType);

        const list = Random.complex([
            { value: MtgCommandParser.COLORLESS, chance: (allowColorless ? 0.1 : 0.0) },
            { value: MtgCommandParser.BASIC_COLORS, chance: 0.25 },
            { value: MtgCommandParser.TWO_COLOR_PAIRS, chance: 0.30 },
            { value: MtgCommandParser.THREE_COLOR_PAIRS, chance: 0.15 },
            { value: MtgCommandParser.FOUR_COLOR_PAIRS, chance: 0.1 },
            { value: MtgCommandParser.FIVE_COLORS, chance: 0.1 },
        ], MtgCommandParser.BASIC_COLORS);

        return Random.nextFromList(list);
    }

    private stripInvalidColorValues(cardColor: string): string {
        return StringHelper.removeDuplicateChars(cardColor.replace(/[^wubrgcWUBRGC]/g, ""));
    }
}