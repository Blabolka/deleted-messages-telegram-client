const { Api } = require('telegram')
const { initTelegramClient } = require('./telegramClient')
const { initUserTypingActionCron } = require('./crons/userTypingActionCron')
const userTypingActionManager = require('./services/UserTypingActionManager')

initTelegramClient().then(async (client) => {
    initUserTypingActionCron(client)
    client.addEventHandler((action) => {
        if (action instanceof Api.UpdateUserTyping) {
            userTypingActionManager.addAction(action)
        }
    })
})
