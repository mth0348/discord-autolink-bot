import { Message, PartialMessage } from 'discord.js';
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

import Canvas = require("canvas");
import { MtgCardRarity } from '../dtos/mtg/MtgCardRarity';
import { MtgCardType } from '../dtos/mtg/MtgCardType';
import { MtgOracleTextWrapperService } from '../services/mtg/MtgOracleTextWrapperService';
import { MtgDataRepository } from '../persistence/repositories/MtgDataRepository';
import { MtgSyntaxResolver } from '../services/mtg/MtgSyntaxResolver';
import { MtgAbilityService } from '../services/mtg/MtgAbilityService';

export class MtgCommandParser extends BaseCommandParser {

    public static AVAILABLE_TYPES = ["creature", "land", "instant", "sorcery", "planeswalker", "enchantment", "artifact"];
    public static AVAILABLE_RARITIES = ["common", "uncommon", "rare", "mythic"];
    public static AVAILABLE_COLORS = ["W", "U", "B", "R", "G", "WU", "WB", "WR", "WG", "UB", "UR", "UG", "BR", "BG", "RG" ];

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
        this.mtgSyntaxResolver = new MtgSyntaxResolver(this.mtgDataRepository);
        this.mtgOracleTextWrapperService = new MtgOracleTextWrapperService();
        this.mtgCardService = new MtgCardService(this.mtgDataRepository, this.mtgAbilityService, this.mtgSyntaxResolver, this.mtgOracleTextWrapperService);

        this.paramConfigs = [
            new ParameterServiceConfig("type", "t", MtgCommandParser.AVAILABLE_TYPES),
            new ParameterServiceConfig("rarity", "r", MtgCommandParser.AVAILABLE_RARITIES),
            new ParameterServiceConfig("color", "c", MtgCommandParser.AVAILABLE_RARITIES),
        ];

        this.initializeCardRendererData();

    }

    public async executeAsync(message: Message | PartialMessage): Promise<void> {

        // extract parameters.
        const parameters = this.parameterService.extractParameters(message.content, this.paramConfigs);

        // setup global card settings.
        const cardType = this.parameterService.tryGetParameterValue("type", parameters) ?? this.getRandomType();
        const cardRarity = this.parameterService.tryGetParameterValue("rarity", parameters) ?? this.getRandomRarity();
        const cardColor = this.parameterService.tryGetParameterValue("color", parameters) ?? this.getRandomColor();

        // start card generation.
        const card = this.mtgCardService.generateCard(EnumHelper.toMtgCardType(cardType), EnumHelper.toMtgCardRarity(cardRarity), cardColor);
        console.log(card);

        // render card.
        const mtgCardRenderer = new MtgCardRenderer(card, this.mtgOracleTextWrapperService, this.mtgDataRepository);
        const renderedCard = await mtgCardRenderer.renderCard();

        message.channel.send('', renderedCard);
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
        return Random.nextFromList(Object.keys(MtgCardType));
    }

    private getRandomRarity(): string {
        return Random.nextFromList(Object.keys(MtgCardRarity));
    }

    private getRandomColor(): string {
        return Random.nextFromList(MtgCommandParser.AVAILABLE_COLORS);
    }
}