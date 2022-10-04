const notificationManager = require('./NotificationManager')
const { Api } = require('telegram')

class TelegramClientCommands {
    constructor(client, telegramClientUserId) {
        this.client = client
        this.telegramClientUserId = telegramClientUserId
    }

    processAction(action) {
        if (!(action instanceof Api.UpdateNewMessage)) return

        this.resolveCommand(action)
    }

    /**
     * Resolves commands that sends in Saved Messages
     * @param action Action from event listener
     */
    resolveCommand(action) {
        try {
            if (!action?.message?.message || action?.message?.peerId?.userId?.value !== this.telegramClientUserId) {
                return
            }

            const actionMessage = action.message.message
            switch (actionMessage) {
                case '/appstatus': {
                    this.sendStatusCommandProcessing()
                    break
                }
            }
        } catch (err) {
            notificationManager.log(
                'ERROR',
                'Client command processing error',
                `ACTION: ${JSON.stringify(action, null, 4)}\nERROR: ${JSON.stringify(err.message || err, null, 4)}`,
                0,
            )
        }
    }

    async sendStatusCommandProcessing() {
        await this.client.sendMessage('me', { message: 'Telegram client is alive!' })
    }
}

module.exports = {
    TelegramClientCommands,
}
