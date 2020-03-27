const { DiscordHelper } = require('./../discord-helper.js');

const config = require('./../../config.json');

class GeneralParser {
    constructor(client) {
        this.client = client;
        this.discordHelper = new DiscordHelper();
    }

    isCommandAllowed(message) {
        let isCommand = this.discordHelper.checkIsCommand(message, `${config.prefix}deleteall`);
        if (isCommand) {
            let isAllowedInChannel = this.discordHelper.checkChannelPermissions(message, config.channelPermissions.general);
            let isAllowedRole = this.discordHelper.checkRolePermissions(message, config.rolePermissions.general);
            return isAllowedInChannel && isAllowedRole;
        }
        return false;
    }

    startWorkflow(message) {
        if (!this.deleteConfirm) {
            this.deleteConfirm = 1;
            console.log(`User '${message.member.displayName}' attempts to delete all messages...`);
            return;
        }
        console.log(`User '${message.member.displayName}' deleted all messages!`);

        async function clear() {
            message.delete();
            let fetched;
            do {
                fetched = await message.channel.messages.fetch({ limit: 99 });
                message.channel.bulkDelete(fetched);
            } while (fetched.size >= 2);
        }
        clear();
        this.deleteConfirm = undefined;
    }
}

module.exports = GeneralParser;