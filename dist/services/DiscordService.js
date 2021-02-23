"use strict";
exports.__esModule = true;
exports.DiscordService = void 0;
var StringHelper_1 = require("../helpers/StringHelper");
var DrunkenBot_1 = require("../base/DrunkenBot");
var Logger_1 = require("../helpers/Logger");
var LogType_1 = require("../dtos/LogType");
var DiscordService = (function () {
    function DiscordService() {
        this.defaultAwaitReactionFilter = function (reaction, user) { return user.id !== reaction.message.author.id; };
        this.defaultAwaitReactionOptions = { max: 1, time: 30000 };
    }
    DiscordService.prototype.sendMessage = function (message, text, attachment) {
        if (attachment === void 0) { attachment = undefined; }
        message.channel.send(text, attachment);
    };
    DiscordService.prototype.sendMessageEmbed = function (message, embed) {
        message.channel.send(embed);
    };
    DiscordService.prototype.sendMessageWithReactions = function (message, text, attachment) {
        var self = this;
        message.channel.send(text, attachment)
            .then(function (embed) {
            embed.react("👍🏻");
            embed.react("📢");
            embed.awaitReactions(self.defaultAwaitReactionFilter, self.defaultAwaitReactionOptions)
                .then(function (collected) {
                var reaction = collected.first();
                if (reaction === undefined)
                    return;
                switch (reaction.emoji.name) {
                    case "👍🏻":
                        return;
                    case "📢":
                        var username = reaction.users.cache.find(function (e) { return e.username !== reaction.message.author.username; }).username;
                        DrunkenBot_1.DrunkenBot.reportMessage(message, username, 'User report');
                        return;
                }
            })["catch"](function (e) { return DrunkenBot_1.DrunkenBot.reportMessage(message, 'DrunkenBot Workflow', e); });
        });
    };
    DiscordService.prototype.checkIsCommand = function (message, command) {
        return StringHelper_1.StringHelper.startsWith(message.content.toLowerCase(), command.toLowerCase());
    };
    DiscordService.prototype.checkIsRegexCommand = function (message, command) {
        var regex = RegExp(command);
        return regex.test(message.content);
    };
    DiscordService.prototype.checkChannelPermissions = function (message, allowedChannels) {
        for (var i = 0; i < allowedChannels.length; i++) {
            var allowedChannel = allowedChannels[i];
            if (message.channel.type === "dm" || message.channel.name.toLowerCase() === allowedChannel.toLowerCase()) {
                return true;
            }
        }
        Logger_1.Logger.log("No permission for channel '" + message.channel.name + "'.", LogType_1.LogType.Warning);
        return false;
    };
    DiscordService.prototype.checkRolePermissions = function (message, allowedRoles) {
        if (message.author.discriminator === "0000" || message.author.id === "706950877696622635")
            return true;
        var memberRoles = message.member.roles.cache;
        var _loop_1 = function (i) {
            var allowedRole = allowedRoles[i];
            if (memberRoles.some(function (m) { return allowedRole.toLowerCase() === m.name.toLowerCase(); })) {
                return { value: true };
            }
        };
        for (var i = 0; i < allowedRoles.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        Logger_1.Logger.log("No permission for user '" + message.member.displayName + "' for roles '" + allowedRoles + "'.", LogType_1.LogType.Warning);
        return false;
    };
    return DiscordService;
}());
exports.DiscordService = DiscordService;
//# sourceMappingURL=DiscordService.js.map