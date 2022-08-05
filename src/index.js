const { Api } = require('telegram')
const { initTelegramClient } = require('./telegramClient')
const { initUserTypingActionCron } = require('./crons/userTypingActionCron')
const userTypingActionManager = require('./services/UserTypingActionManager')
const { TelegramClientCommands } = require('./services/TelegramClientCommands')

// For JSON.stringify correct working
BigInt.prototype.toJSON = function () {
    return this.toString()
}

initTelegramClient().then(async (client) => {
    const telegramClientUser = await client.getMe()
    const { value: telegramClientUserId } = telegramClientUser.id

    initUserTypingActionCron(client)
    client.addEventHandler((action) => {
        if (action instanceof Api.UpdateUserTyping) {
            userTypingActionManager.addAction(action)
        } else if (action instanceof Api.UpdateNewMessage) {
            new TelegramClientCommands(client, telegramClientUserId).resolveCommand(action)
        }
    })
})
