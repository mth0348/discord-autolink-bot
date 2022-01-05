import { Message, MessageEmbed, MessageReaction, PartialMessage } from 'discord.js';
import { DiscordService } from '../services/DiscordService';
import { Logger } from '../helpers/Logger';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { ParameterService } from '../services/ParameterService';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { DatabaseProvider } from '../helpers/DatabaseProvider';
import { LolRolePreference } from '../domain/models/lol/LolRolePreference';

export class LolCommandParser extends BaseCommandParser {

    public name: string = "Leage Of Legends Parser";

    protected prefixes: string[] = ["lol", "league", "leagueoflegends", "role", "roles"];

    private LOL_ROLES = ["Top", "Mid", "ADC", "Support", "Jungle"];
    private LOL_ROLE_ICONS = ["⚔️", "🧙", "🏹", "🛡️", "🌳"];

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

        var data = DatabaseProvider.get(DatabaseProvider.LEAGUE_OF_LEGENDS) as LolRolePreference[];

        // print out a player list.
        if (this.parameterService.tryGetParameterValue("players", parameters) === "players"
            || this.parameterService.tryGetParameterValue("roles", parameters) === "roles") {
            this.showPlayers(message, data);
            return;
        }

        // set your preference dialog.
        if (message.content.toLowerCase().startsWith("!role")) {
            this.showRolePreferenceDialog(message, data);
            return;
        }

        // data[0].primaryRole = new Date().toTimeString();
        // DatabaseProvider.save(DatabaseProvider.LEAGUE_OF_LEGENDS, data);



        // const voiceChannel = message.member.voice.channel;
        // if (!voiceChannel) {
        //     this.discordService.sendMessage(message, "You need to be in a voice channel for that!");
        //     return;
        // }

        // let members = parameters.length > 0
        //     ? parameters.map(p => p.name)
        //     : message.member.voice.channel.members.map(m => m.nickname ?? m.displayName);

        // let assignments = "";
        // members.forEach(member => {
        //     const roleIndex = Math.floor(Math.random() * roles.length);
        //     assignments += member + ": " + roles[roleIndex] + "\r\n";
        //     roles.splice(roleIndex, 1);
        // });
        // this.discordService.sendMessage(message, assignments);
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

        let msg = "";

        if (data.length === 0) {
            msg += "There are no player preferences registered yet."
        } else {
            data.forEach(rolePreference => {
                const primaryRoleIndex = this.LOL_ROLES.findIndex(r => r.toLowerCase() === rolePreference.primaryRole.toLowerCase());
                const secondaryRoleIndex = this.LOL_ROLES.findIndex(r => r.toLowerCase() === rolePreference.secondaryRole.toLowerCase());
                msg += message.guild.members.cache.get(rolePreference.playerId).displayName + ` prefers ${this.LOL_ROLE_ICONS[primaryRoleIndex]} (1) and ${this.LOL_ROLE_ICONS[secondaryRoleIndex]} (2)`
            });
        }

        const embed = new MessageEmbed();
        embed.setTitle("Registered LoL Role Preferences")
            .setDescription(msg)
            .addField("Legend", this.getIconLegendString());

        this.discordService.sendMessageEmbed(message, "", embed);
    }

    private showRolePreferenceDialog(message: Message | PartialMessage, data: LolRolePreference[]): void {
        Logger.log(`${message.author.username} requested to change his/her role preference.`);

        let primaryMsg = new MessageEmbed();
        primaryMsg.setTitle("Primary Role")
            .setDescription("Choose your primary role preference:")
            .addField("Legend", this.getIconLegendString());
        let secondaryMsg = new MessageEmbed();
        secondaryMsg.setTitle("Secondary Role")
            .setDescription("Choose your secondary role preference:")
            .addField("Legend", this.getIconLegendString());

        let primaryRole = -1;
        let secondaryRole = -1;

        // send primary role question.
        this.discordService.sendMessageEmbedWithVotes(message, "", primaryMsg, this.LOL_ROLE_ICONS, this.LOL_ROLE_ICONS.map((icon, index) => {
            return (reaction: MessageReaction) => {
                primaryRole = index;

                // send secondary role question.
                this.discordService.sendMessageEmbedWithVotes(message, "", secondaryMsg, this.LOL_ROLE_ICONS, this.LOL_ROLE_ICONS.map((icon, index) => {
                    return (reaction: MessageReaction) => {
                        secondaryRole = index;

                        let existingIndex = data.findIndex(p => p.playerId === message.author.id);
                        if (existingIndex < 0) {
                            existingIndex = data.length;
                            const newPreference = new LolRolePreference();
                            data.push(newPreference);
                        }

                        data[existingIndex].playerId = message.author.id;
                        data[existingIndex].primaryRole = this.LOL_ROLES[primaryRole];
                        data[existingIndex].secondaryRole = this.LOL_ROLES[secondaryRole];

                        DatabaseProvider.save(DatabaseProvider.LEAGUE_OF_LEGENDS, data);

                        this.discordService.sendMessage(message, `You have successfully registered your role preferences as ${this.LOL_ROLE_ICONS[primaryRole]} (1) and ${this.LOL_ROLE_ICONS[secondaryRole]} (2).`);
                    };
                }));
            };
        }));
    }

    private getIconLegendString(): string {
        return this.LOL_ROLES.map((role, i) => " " + this.LOL_ROLE_ICONS[i] + " = " + role).join(", ");
    }
}