const { Api } = require('telegram')
const { initTelegramClient } = require('./telegramClient')
const { initUserTypingActionCron } = require('./crons/userTypingActionCron')
const userTypingActionManager = require('./services/UserTypingActionManager')

// For JSON.stringify correct working
BigInt.prototype.toJSON = function () {
    return this.toString()
}

initTelegramClient().then((client) => {
    initUserTypingActionCron(client)
    client.addEventHandler((action) => {
        if (action instanceof Api.UpdateUserTyping) {
            userTypingActionManager.addAction(action)
        }
    })
})
