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

export class MtgCommandParser extends BaseCommandParser {

    public static AVAILABLE_TYPES = ["creature", "land", "instant", "sorcery", "planeswalker", "enchantment", "artifact"];
    public static AVAILABLE_RARITIES = ["common", "uncommon", "rare", "mythic"];
    public static AVAILABLE_COLORS = ["W", "U", "B", "R", "G"];

    private mtgCardService: MtgCardService;

    private paramConfigs: ParameterServiceConfig[];

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, ConfigProvider.current().channelPermissions.mtg, ConfigProvider.current().rolePermissions.mtg);

        this.mtgCardService = new MtgCardService();

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

        // construct default card.
        const cardType = this.parameterService.tryGetParameterValue("type", parameters) ?? Random.nextFromList(MtgCommandParser.AVAILABLE_TYPES);
        const cardRarity = this.parameterService.tryGetParameterValue("rarity", parameters) ?? Random.nextFromList(MtgCommandParser.AVAILABLE_RARITIES);
        const cardColor = this.parameterService.tryGetParameterValue("color", parameters) ?? Random.nextFromList(MtgCommandParser.AVAILABLE_COLORS);


        // start card generation.
        const card = this.mtgCardService.generateCard(EnumHelper.toMtgCardType(cardType), EnumHelper.toMtgCardRarity(cardRarity), cardColor);
        console.log(card);

        // render card.
        const mtgCardRenderer = new MtgCardRenderer(card);
        const renderedCard = await mtgCardRenderer.renderCard();

        message.channel.send('', renderedCard);
    }

    private initializeCardRendererData() {
        Canvas.registerFont('assets/fonts/MPLANTIN.ttf', { family: "mplantin" });
        Canvas.registerFont('assets/fonts/MPLANTIN-BOLD.ttf', { family: "mplantinbold" });
        Canvas.registerFont('assets/fonts/MatrixBold.ttf', { family: "matrixbold" });

        Resources.MtgImageUrls.forEach(url => {
            ImageProvider.registerImageUrl(url.path);
        });
    }
}