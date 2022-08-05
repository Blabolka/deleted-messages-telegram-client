const cron = require('node-cron')
const logger = require('../services/Logger')
const { createUserTypingMessageText } = require('../utils/userActionTyping')
const userTypingActionManager = require('../services/UserTypingActionManager')
const { getChatHistoryMessagesSafe, getUserSafe, getUserCommonChatsSafe } = require('../api/safeApiCalls')

const TIME_TO_FIRE_AFTER_USER_TYPING_ACTION = 1 // 3 minutes
// const TIME_TO_FIRE_AFTER_USER_TYPING_ACTION = 60 * 1000 * 3 // 3 minutes

const initUserTypingActionCron = (client) => {
    cron.schedule('* * * * *', async () => {
        const userActions = userTypingActionManager.getUsersAfterTimeAfterTyping(TIME_TO_FIRE_AFTER_USER_TYPING_ACTION)
        if (userActions.length) {
            const requestPromises = userActions.map(async (singleUserAction) => {
                try {
                    const processTime = new Date()

                    const chatMessages = await getChatHistoryMessagesSafe(client, singleUserAction.userId)
                    const lastMessage = chatMessages.find((message) => {
                        return message.peerId.userId.value === singleUserAction.userId
                    })

                    // add 60 seconds to last message date because of user can missclick
                    // also event may trigger after message sending
                    const technicalActionDateDelay = 60 * 1000
                    const isLastUserMessageTimeBeforeLastTypingAction = lastMessage
                        ? lastMessage.date * 1000 + technicalActionDateDelay <
                          new Date(singleUserAction.actionDate).getTime()
                        : true

                    if (isLastUserMessageTimeBeforeLastTypingAction) {
                        const fullUserTypingInfo = await getUserSafe(client, singleUserAction.userId)
                        const commonChats = await getUserCommonChatsSafe(client, singleUserAction.userId)

                        const message = createUserTypingMessageText(
                            fullUserTypingInfo || { firstName: 'UNKNOWN USER' },
                            commonChats,
                            singleUserAction,
                        )
                        logger.log('INFO', 'User typing cron', message, new Date() - processTime.getTime())

                        if (process.env.SAVED_MESSAGES_LOGGER_ENABLED === 'true') {
                            await client.sendMessage('me', { message })
                        }
                    }
                } catch (err) {
                    logger.log(
                        'ERROR',
                        'User typing cron error',
                        `DATA: ${JSON.stringify(singleUserAction, null, 4)}\nERROR: ${JSON.stringify(
                            err.message || err,
                            null,
                            4,
                        )}`,
                        0,
                    )
                } finally {
                    userTypingActionManager.deleteAction(singleUserAction.userId)
                }
            })

            await requestPromises
        }
    })
}

module.exports = {
    initUserTypingActionCron,
}
