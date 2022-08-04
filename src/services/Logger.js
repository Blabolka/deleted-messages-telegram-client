const { WebClient } = require('@slack/web-api')

class Logger {
    constructor(slackLoggerProps, consoleLoggerProps) {
        this.slackLoggerProps = slackLoggerProps
        this.consoleLoggerProps = consoleLoggerProps
        this.slackLogger = new WebClient(slackLoggerProps.slackAccessToken)
    }

    log(level, title, message, spentTimeInSeconds) {
        if (this.consoleLoggerProps.consoleLoggerEnabled) {
            const logMessage = Logger.getLogMessage(level, title, message, spentTimeInSeconds, {
                levelPrefixStyle: 'simple',
            })
            Logger.logToConsole(logMessage)
        }
        if (this.slackLoggerProps.slackLoggerEnabled) {
            const logMessage = Logger.getLogMessage(level, title, message, spentTimeInSeconds, {
                levelPrefixStyle: 'markdown',
            })
            this.logToSlack(logMessage)
        }
    }

    static logToConsole(logMessage) {
        console.log(logMessage)
    }

    logToSlack(logMessage) {
        // because of max message length is 30000 characters
        for (let i = 0; i < Math.ceil(logMessage.length / 30000); i++) {
            this.slackLogger.chat
                .postMessage({
                    channel: this.slackLoggerProps.slackChannelId,
                    text: logMessage.substring(i * 30000, (i + 1) * 30000),
                    mrkdwn: true,
                })
                .then()
        }
    }

    static getLogMessage(level, title, message, spentTimeInSeconds, messageParams) {
        const logLevelPrefix =
            messageParams.levelPrefixStyle === 'markdown' ? `*[${level.toUpperCase()}]*` : `[${level.toUpperCase()}]`
        const logCompleteTitle = `${logLevelPrefix} ${title} (${spentTimeInSeconds} s)`
        return `${logCompleteTitle}\n${message}`
    }
}

const slackLoggerProps = {
    slackLoggerEnabled: process.env.SLACK_LOGGER_ENABLED === 'true' || false,
    slackAccessToken: process.env.SLACK_LOGGER_ACCESS_TOKEN || '',
    slackChannelId: process.env.SLACK_LOGGER_CHANNEL_ID || '',
}
const consoleLoggerProps = {
    consoleLoggerEnabled: process.env.CONSOLE_LOGGER_ENABLED === 'true' || false,
}

const logger = new Logger(slackLoggerProps, consoleLoggerProps)

module.exports = logger
