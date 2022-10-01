const { initTelegramClient } = require('./telegramClient')
const { initUserTypingActionCron } = require('./crons/userTypingActionCron')
const { UserTypingActionManager } = require('./services/UserTypingActionManager')
const { UserDeleteMessageNotificationManager } = require('./services/UserDeleteMessageNotificationManager')
const { TelegramClientCommands } = require('./services/TelegramClientCommands')
const { UserChatMessagesBackupManager } = require('./services/UserChatMessagesBackupManager')

// For JSON.stringify correct working
BigInt.prototype.toJSON = function () {
    return this.toString()
}

initTelegramClient().then(async (client) => {
    const telegramClientUser = await client.getMe()
    const { value: telegramClientUserId } = telegramClientUser.id

    console.log('Setup telegram client commands manager')
    const telegramClientCommands = new TelegramClientCommands(client, telegramClientUserId)

    console.log('Setup user typing actions manager')
    const userTypingActionManager = new UserTypingActionManager()
    initUserTypingActionCron(client, userTypingActionManager)

    console.log('Setup deleted messages notification manager')
    const userDeleteMessageNotificationManager = new UserDeleteMessageNotificationManager(
        client,
        telegramClientUserId,
        1000,
    )

    console.log('Setup message backups channel')
    const chatMessagesBackupManager = new UserChatMessagesBackupManager(
        client,
        telegramClientUserId,
        userDeleteMessageNotificationManager,
    )
    await chatMessagesBackupManager.setupBackupChannel()

    console.log('Telegram client is running!')
    client.addEventHandler((action) => {
        telegramClientCommands.processAction(action)
        userTypingActionManager.processAction(action)
        chatMessagesBackupManager.processAction(action)
        userDeleteMessageNotificationManager.processAction(action)
    })
})
