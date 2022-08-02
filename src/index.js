const { Api } = require('telegram')
const { initTelegramClient } = require('./telegramClient')

initTelegramClient().then((client) => {
    client.addEventHandler((update) => {
        if (update instanceof Api.UpdateUserTyping || update instanceof Api.UpdateChatUserTyping) {
            console.log(update)
        }
    })
})
