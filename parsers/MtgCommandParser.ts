import { Message, PartialMessage } from 'discord.js';
import { MtgCardService } from '../services/mtg/MtgCardService';
import { BaseCommandParser } from './../base/BaseCommandParser';
import { DiscordService } from '../services/DiscordService';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { ParameterService } from '../services/ParameterService';
import { ParameterServiceConfig } from '../dtos/ParameterServiceConfig';

export class MtgCommandParser extends BaseCommandParser {

    private mtgCardService : MtgCardService;
    paramConfigs: ParameterServiceConfig[];

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, ConfigProvider.current().channelPermissions.mtg, ConfigProvider.current().rolePermissions.mtg);

        this.mtgCardService = new MtgCardService();

        this.paramConfigs = [
            new ParameterServiceConfig("type", "t", [ "creature", "land", "instant", "sorcery", "planeswalker", "enchantment", "artifact" ]),
            new ParameterServiceConfig("rarity", "r", [ "common", "uncommon", "rare", "mythic" ]),
        ];

    }

    public execute(message: Message | PartialMessage) : void {
        
        // extract parameters.
        const parameters = this.parameterService.extractParameters(message.content, this.paramConfigs);
        
        // start card generation.
        console.log(parameters);

    }
}