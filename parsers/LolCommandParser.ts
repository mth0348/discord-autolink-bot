import { Message, MessageEmbed, MessageReaction, PartialMessage } from 'discord.js';
import { DiscordService } from '../services/DiscordService';
import { Logger } from '../helpers/Logger';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { ParameterService } from '../services/ParameterService';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { DatabaseProvider } from '../helpers/DatabaseProvider';
import { LolRolePreference } from '../domain/models/lol/LolRolePreference';
import { LeageOfLegendsService } from '../services/lol/LeageOfLegendsService';

export class LolCommandParser extends BaseCommandParser {

    public name: string = "Leage Of Legends Parser";

    protected prefixes: string[] = ["lol", "league", "leagueoflegends", "role", "roles"];

    public static LOL_ROLES = ["Top", "Mid", "ADC", "Support", "Jungle"];
    public static LOL_ROLE_ICONS = ["⚔️", "🧙", "🏹", "🛡️", "🌳"];

    private leageOfLegendsService: LeageOfLegendsService;

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, ConfigProvider.current().channelPermissions.lol, ConfigProvider.current().rolePermissions.lol);

        this.leageOfLegendsService = new LeageOfLegendsService();

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

        var data = DatabaseProvider.get(DatabaseProvider.LEAGUE_OF_LEGENDS) as LolRolePreference[];

        // print out a player list.
        if (this.parameterService.tryGetParameterValue("players", parameters) === "players"
            || this.parameterService.tryGetParameterValue("roles", parameters) === "roles") {
            await this.showPlayers(message, data);
            return;
        }

        // set your preference dialog.
        if (message.content.toLowerCase().startsWith("!role")) {
            this.showRolePreferenceDialog(message, data);
            return;
        }

        const roleAssignments = this.leageOfLegendsService.determineRoles(data);

        message.guild.members.fetch().then(members => {

            let msg = "I determined the following role assignments:\r\n";
            roleAssignments.forEach(assignment => {
                const roleIndex = LolCommandParser.LOL_ROLES.findIndex(r => r === assignment.role);
                const roleIcon = LolCommandParser.LOL_ROLE_ICONS[roleIndex];
                const playerName = members.get(assignment.playerId).displayName;
                msg += `**${playerName}** plays ${roleIcon}\r\n`;
            });

            let embed = new MessageEmbed();
            embed.setTitle("LoL Role Assigments")
                .setDescription(msg)
                .addField("Legend", this.getIconLegendString());
            this.discordService.sendMessageEmbed(message, "", embed);
        });
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
            .addField(`Commands`, "Just type `!lol` or `!league` to match players with roles based on their preferences." +
                "\r\nTo change your role preferences, use `!role` or `!roles`." +
                "\r\nTo view who registered roles, use `!lol players` or `!lol roles`.")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, "", embed);
    }

    private showPlayers(message: Message | PartialMessage, data: LolRolePreference[]): void {
        Logger.log(`${message.author.username} requested a list of registered role preferences.`);

        message.guild.members.fetch().then(members => {
            let msg = "";

            if (data.length === 0) {
                msg += "There are no player preferences registered yet."
            } else {
                data.forEach(rolePreference => {
                    const primaryRoleIndex = LolCommandParser.LOL_ROLES.findIndex(r => r.toLowerCase() === rolePreference.primaryRole.toLowerCase());
                    const secondaryRoleIndex = LolCommandParser.LOL_ROLES.findIndex(r => r.toLowerCase() === rolePreference.secondaryRole.toLowerCase());
                    const memberName = members.get(rolePreference.playerId);
                    msg += `** ${memberName?.displayName ?? "<Unknown>"}** prefers ${LolCommandParser.LOL_ROLE_ICONS[primaryRoleIndex]} (1) and ${LolCommandParser.LOL_ROLE_ICONS[secondaryRoleIndex]} (2) \r\n`
                });
            }

            const embed = new MessageEmbed();
            embed.setTitle("Registered LoL Role Preferences")
                .setDescription(msg)
                .addField("Legend", this.getIconLegendString());

            this.discordService.sendMessageEmbed(message, "", embed);
        }).catch(e => console.log(e));
    }

    private showRolePreferenceDialog(message: Message | PartialMessage, data: LolRolePreference[]): void {
        Logger.log(`${message.author.username} requested to change his / her role preference.`);

        let messageEmbed = new MessageEmbed();
        messageEmbed.setTitle("Primary Role")
            .setDescription("Choose your primary role preference first, then your secondary role preference:")
            .addField("Legend", this.getIconLegendString());

        let primaryRole = -1;
        let secondaryRole = -1;

        // send primary role question.
        this.discordService.sendMessageEmbedWithVotes(message, "", messageEmbed, LolCommandParser.LOL_ROLE_ICONS, LolCommandParser.LOL_ROLE_ICONS.map((icon, index) => {
            return (reaction: MessageReaction) => {
                primaryRole = index;
                let secondaryIcon = reaction.message.reactions.cache.find(r => r.count > 1 && r.emoji.name !== LolCommandParser.LOL_ROLE_ICONS[primaryRole]).emoji.name;
                secondaryRole = LolCommandParser.LOL_ROLE_ICONS.findIndex(f => f === secondaryIcon);

                let existingIndex = data.findIndex(p => p.playerId === message.author.id);
                if (existingIndex < 0) {
                    existingIndex = data.length;
                    const newPreference = new LolRolePreference();
                    data.push(newPreference);
                }

                data[existingIndex].playerId = message.author.id;
                data[existingIndex].primaryRole = LolCommandParser.LOL_ROLES[primaryRole];
                data[existingIndex].secondaryRole = LolCommandParser.LOL_ROLES[secondaryRole];

                DatabaseProvider.save(DatabaseProvider.LEAGUE_OF_LEGENDS, data);

                this.discordService.sendMessage(message, `You have successfully registered your role preferences as ${LolCommandParser.LOL_ROLE_ICONS[primaryRole]} (1) and ${LolCommandParser.LOL_ROLE_ICONS[secondaryRole]} (2).`);
            };
        }));
    }

    private getIconLegendString(): string {
        return LolCommandParser.LOL_ROLES.map((role, i) => " " + LolCommandParser.LOL_ROLE_ICONS[i] + " = " + role).join(", ");
    }
}