import { Message, MessageEmbed, PartialMessage } from 'discord.js';
import { DiscordService } from '../services/DiscordService';
import { Logger } from '../helpers/Logger';
import { BaseCommandParser } from '../base/BaseCommandParser';
import { ParameterService } from '../services/ParameterService';
import { Random } from '../helpers/Random';

export class DndCommandParser extends BaseCommandParser {

    public name: string = "DnD Parser";

    protected prefixes: string[] = ["d", "w"];

    constructor(discordService: DiscordService, parameterService: ParameterService) {
        super(discordService, parameterService, undefined, undefined /* means no permission checks */);

        console.log("|| - registered DnD parser.    ||");
    }

    public async executeAsync(message: Message | PartialMessage): Promise<void> {

        // extract parameters.
        const parameters = this.parameterService.extractParameters(message.content, []);

        // decide if user asked for help.
        if (this.parameterService.tryGetParameterValue("help", parameters) === "help") {
            this.showHelp(message);
            return;
        }

        // first evaluate how many times it should print out a random rumber. Default is 1.
        const indexOfSpace = message.content.indexOf(` `);
        let repeatCount = parseInt(message.content.substring(indexOfSpace + 1));
        if (isNaN(repeatCount) || repeatCount === -1) {
            repeatCount = 1;
        }
        repeatCount = Math.min(10, Math.max(1, repeatCount));

        // validate and set maximum dice roll.
        let diceSize = parseInt(message.content.substring(2));
        if (isNaN(diceSize)) {
            message.channel.send(`"${message.content.substring(2)}" is not an number. Please use something like "!d6" or "!d10"...`)
            return;
        }
        diceSize = Math.min(100, Math.max(2, diceSize));


        if (diceSize < 1) {
            message.channel.send(`Your number must be higher than one. Please use something like "!d6" or "!d10"...`)
            return;
        }

        let color = '';
        let title = '';
        let resultText = '';

        for (var i = 0; i < repeatCount; i++) {

            // handle dice roll.
            const diceRoll = Random.next(1, diceSize);
            const critSuccess = diceRoll == diceSize;
            const critFailure = diceRoll == 1;

            // handle visuals.
            color = critSuccess ? '#FFFF00' : critFailure ? '#FF0000' : '#dddddd';
            const emoji = critSuccess ? '🌟' : critFailure ? '💥' : '';

            const result = `**${diceRoll}** ${emoji}`;

            // add result to display text.
            if (repeatCount > 1) {
                resultText += `${(i + 1)}) `;
            }
            resultText += `${message.author.username} rolls a ${result.trim()}`;
            if (i < repeatCount - 1) {
                resultText += '\r\n';
            }

            title = this.getLabel(diceRoll / diceSize);
        }

        if (repeatCount > 1) {
            color = '#dddddd';
            title = 'Mass roll';
        }

        Logger.log("DnD: Dice Roll:");
        Logger.log(resultText);

        // actually send message.
        const embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(resultText)
            .setFooter(`D${diceSize}`)
            .setColor(color);
        this.discordService.sendMessageEmbed(message, "", embed);

        // delete input message if possible.
        if (message.channel.type !== "dm") {
            message.delete({});
        }
    }

    private getLabel(percentage: number): string {
        if (percentage <= 0.1) {
            return 'Ridiculously terrible!';
        }
        if (percentage <= 0.2) {
            return 'Disasterous!';
        }
        if (percentage <= 0.3) {
            return 'Oof!';
        }
        if (percentage <= 0.4) {
            return 'Middling!';
        }
        if (percentage <= 0.5) {
            return 'Mediocre!';
        }
        if (percentage <= 0.6) {
            return 'Not bad!';
        }
        if (percentage <= 0.7) {
            return 'Exquisite!';
        }
        if (percentage <= 0.8) {
            return 'Exemplary!';
        }
        if (percentage <= 0.9) {
            return 'Glorious!';
        }
        return 'Godlike!';
    }

    private showHelp(message: Message | PartialMessage) {
        Logger.log(`${message.author.username} requested help: ` + message.content);

        const embed = new MessageEmbed({
            files: [{
                attachment: "assets/img/dnd/banner.png",
                name: "banner.png"
            }]
        });

        embed.setTitle("DnD Bot Overview")
            .setDescription("You can roll dices!")
            .addField(`Commands`, "Just type `d` or `w` followed by the number of eyes your die should have. Optionally, you can also add a number to indicate how many rolls you wish to make in one go:\r\n" +
                "`!d10`\r\n`!d20`\r\n`!d6 2`")
            .setTimestamp()
            .setFooter("DrunKen Discord Bot", 'https://cdn.discordapp.com/icons/606196123660714004/da16907d73858c8b226486839676e1ac.png?size=128')
            .setImage("attachment://banner.png");

        this.discordService.sendMessageEmbed(message, "", embed);
    }
}