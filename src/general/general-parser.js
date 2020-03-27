class GeneralParser {
    constructor(client) {
        this.allowedChannels = [ 'bot-playground' ];
    }

    isCommand(prefix, message) {
        let isCommand = message.content.startsWith(`${prefix}deleteall`);
        if (isCommand) {
            for (let i = 0; i < this.allowedChannels.length; i++) {
                const allowedChannel = this.allowedChannels[i];
                if (message.channel.name.toLowerCase() === allowedChannel.toLowerCase()) {
                    return true;
                }
            }
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
                fetched = await message.channel.messages.fetch({limit: 99});
                message.channel.bulkDelete(fetched);
            } while(fetched.size >= 2);
        }
        clear();
        this.deleteConfirm = undefined;
    }
}

module.exports = GeneralParser;