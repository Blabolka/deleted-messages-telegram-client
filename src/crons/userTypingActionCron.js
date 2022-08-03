const cron = require('node-cron')
const { Api } = require('telegram')
const { createUserTypingMessageText } = require('../utils/userActionTyping')
const userTypingActionManager = require('../services/UserTypingActionManager')

const TIME_TO_FIRE_AFTER_USER_TYPING_ACTION = 60 * 1000 * 5 // 5 minutes

const initUserTypingActionCron = (client) => {
    // Every minute
    cron.schedule('* * * * *', async () => {
        const userActions = userTypingActionManager.getUsersAfterTimeAfterTyping(TIME_TO_FIRE_AFTER_USER_TYPING_ACTION)
        if (userActions.length) {
            const requestPromises = userActions.map(async (singleUserAction) => {
                const chatHistory = await client.invoke(
                    new Api.messages.GetHistory({
                        peer: singleUserAction.userId,
                    }),
                )

                const lastUserMessage = chatHistory.messages.find((message) => {
                    return message.peerId.userId.value === singleUserAction.userId
                })

                // add 15 seconds to last message date because of user can missclick
                // also event may trigger after message sending
                const technicalActionDateDelay = 15 * 1000
                const isLastUserMessageTimeBeforeLastTypingAction = lastUserMessage
                    ? new Date(lastUserMessage.date).getTime() + technicalActionDateDelay <
                      new Date(singleUserAction.actionDate).getTime()
                    : true

                if (isLastUserMessageTimeBeforeLastTypingAction) {
                    const fullUserTypingInfo = await client.invoke(
                        new Api.users.GetUsers({
                            id: [singleUserAction.userId],
                        }),
                    )

                    const userCommonChats = await client.invoke(
                        new Api.messages.GetCommonChats({
                            userId: singleUserAction.userId,
                        }),
                    )

                    const message = createUserTypingMessageText(
                        fullUserTypingInfo[0],
                        userCommonChats.chats,
                        singleUserAction,
                    )
                    client.invoke(
                        new Api.messages.SendMessage({
                            peer: 'me',
                            message: message,
                        }),
                    )
                }

                userTypingActionManager.deleteAction(singleUserAction.userId)
            })

            await requestPromises
        }
    })
}

module.exports = {
    initUserTypingActionCron,
}
