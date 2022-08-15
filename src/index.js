const { initTelegramClient } = require('./telegramClient')
const { initUserTypingActionCron } = require('./crons/userTypingActionCron')
const userTypingActionManager = require('./services/UserTypingActionManager')
const { TelegramClientCommands } = require('./services/TelegramClientCommands')
const { UserChatMessagesBackupManager } = require('./services/UserChatMessagesBackupManager')

// For JSON.stringify correct working
BigInt.prototype.toJSON = function () {
    return this.toString()
}

initTelegramClient().then(async (client) => {
    const telegramClientUser = await client.getMe()
    const { value: telegramClientUserId } = telegramClientUser.id

    console.log('Setup message backups channel')
    const chatMessagesBackupManager = new UserChatMessagesBackupManager(client)
    await chatMessagesBackupManager.setupBackupChannel()

    initUserTypingActionCron(client)

    console.log('Telegram client is running!')
    client.addEventHandler((action) => {
        userTypingActionManager.addAction(action)
        chatMessagesBackupManager.backupMessageToChannel(action)
        new TelegramClientCommands(client, telegramClientUserId).resolveCommand(action)
    })
})
