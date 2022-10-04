const config = require('../utils/config')
const { TelegramClient } = require('telegram')
const { WebClient } = require('@slack/web-api')

class NotificationManager {
    constructor(slackNotificationProps, consoleNotificationProps, savedMessagesNotificationProps) {
        this.slackNotificationProps = slackNotificationProps
        this.consoleNotificationProps = consoleNotificationProps
        this.savedMessagesNotificationProps = savedMessagesNotificationProps

        this.slackClient = new WebClient(slackNotificationProps.slackAccessToken)
        this.telegramClient = null
    }

    setTelegramClient(client) {
        this.telegramClient = client
    }

    log(level, title, message, spentTimeInSeconds) {
        if (this.consoleNotificationProps.consoleNotificationsEnabled) {
            const logMessage = NotificationManager.getLogMessage(level, title, message, spentTimeInSeconds, {
                levelPrefixStyle: 'simple',
            })
            NotificationManager.logToConsole(logMessage)
        }
        if (this.slackNotificationProps.slackNotificationsEnabled) {
            const logMessage = NotificationManager.getLogMessage(level, title, message, spentTimeInSeconds, {
                levelPrefixStyle: 'markdown',
            })
            this.logToSlack(logMessage)
        }
        if (this.savedMessagesNotificationProps.savedMessagesNotificationsEnabled) {
            const logMessage = NotificationManager.getLogMessage(level, title, message, spentTimeInSeconds, {
                levelPrefixStyle: 'simple',
            })
            this.logToSavedMessages(logMessage)
        }
    }

    static logToConsole(logMessage) {
        console.log(logMessage)
    }

    logToSlack(logMessage) {
        // because of max message length is 30000 characters
        for (let i = 0; i < Math.ceil(logMessage.length / 30000); i++) {
            this.slackClient.chat
                .postMessage({
                    channel: this.slackNotificationProps.slackChannelId,
                    text: logMessage.substring(i * 30000, (i + 1) * 30000),
                    mrkdwn: true,
                })
                .then()
        }
    }

    async logToSavedMessages(logMessage) {
        if (this.telegramClient && this.telegramClient instanceof TelegramClient) {
            try {
                await this.telegramClient.sendMessage('me', { message: logMessage })
            } catch (err) {}
        }
    }

    static getLogMessage(level, title, message, spentTimeInSeconds, messageParams) {
        const logLevelPrefix =
            messageParams.levelPrefixStyle === 'markdown' ? `*[${level.toUpperCase()}]*` : `[${level.toUpperCase()}]`
        const logCompleteTitle = `${logLevelPrefix} ${title} (${spentTimeInSeconds} s)`
        return `${logCompleteTitle}\n${message}`
    }
}

const slackNotificationProps = {
    slackNotificationsEnabled: config.notifications.slackNotifications.enabled,
    slackAccessToken: config.notifications.slackNotifications.slackAccessToken,
    slackChannelId: config.notifications.slackNotifications.slackChannelId,
}
const consoleNotificationProps = {
    consoleNotificationsEnabled: config.notifications.consoleNotifications.enabled,
}
const savedMessagesNotificationProps = {
    savedMessagesNotificationsEnabled: config.notifications.savedMessagesNotifications.enabled,
}

const notificationManager = new NotificationManager(
    slackNotificationProps,
    consoleNotificationProps,
    savedMessagesNotificationProps,
)

module.exports = notificationManager
