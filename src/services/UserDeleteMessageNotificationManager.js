const { Api } = require('telegram')
const notificationManager = require('../services/NotificationManager')
const { getChannelSafe, getUserSafe, getChatSafe } = require('../api/safeApiCalls')
const { createChannelDeleteMessageText, createUserDeleteMessageText } = require('../utils/userFormatUtils')

class UserDeleteMessageNotificationManager {
    constructor(client, telegramClientUserId, temporaryDataStorageMaxLength) {
        this.client = client
        this.telegramClientUserId = telegramClientUserId

        // Data for deleted message detailed info
        // Increase value if you want to store more data (make sure you have enough RAM)
        this.TEMPORARY_DATA_STORAGE_MAX_LENGTH = temporaryDataStorageMaxLength
        this.backedUpMessagesTemporaryData = []
    }

    async processAction(action) {
        if (action instanceof Api.UpdateDeleteMessages || action instanceof Api.UpdateDeleteChannelMessages) {
            this.notifyUserAboutDeletedMessages(action)
        }
    }

    addBackedUpMessageTemporaryData(dataItem) {
        if (dataItem.fromPeerId === this.telegramClientUserId) return

        this.backedUpMessagesTemporaryData.push(dataItem)

        if (this.backedUpMessagesTemporaryData.length > this.TEMPORARY_DATA_STORAGE_MAX_LENGTH) {
            const lengthDifference = this.backedUpMessagesTemporaryData.length - this.TEMPORARY_DATA_STORAGE_MAX_LENGTH
            this.backedUpMessagesTemporaryData.splice(
                this.backedUpMessagesTemporaryData.length - lengthDifference,
                lengthDifference,
            )
        }
    }

    async notifyUserAboutDeletedMessages(action) {
        let processTime = new Date()
        let deletedMessageNotificationText
        if (action instanceof Api.UpdateDeleteChannelMessages) {
            const { value: deleteMessagesChannelId } = action.channelId
            const { messages: deletedMessagesIds } = action
            const detailedDeletedMessageData = this.backedUpMessagesTemporaryData.find((dataItem) => {
                return (
                    dataItem.fromPeerId === deleteMessagesChannelId &&
                    deletedMessagesIds.some((deletedMessageId) => dataItem.messageId === deletedMessageId)
                )
            })

            if (detailedDeletedMessageData) {
                const channelData = await getChannelSafe(this.client, detailedDeletedMessageData.fromPeerId)
                deletedMessageNotificationText = createChannelDeleteMessageText(
                    channelData,
                    detailedDeletedMessageData.sentAt,
                    deletedMessagesIds,
                )
            }
        } else {
            const { messages: deletedMessagesIds } = action
            const detailedDeletedMessageData = this.backedUpMessagesTemporaryData.find((dataItem) => {
                return deletedMessagesIds.some((deletedMessageId) => dataItem.messageId === deletedMessageId)
            })

            if (detailedDeletedMessageData) {
                const userData = await getUserSafe(this.client, detailedDeletedMessageData.fromPeerId)
                const chatData = await getChatSafe(this.client, detailedDeletedMessageData.chatId)
                deletedMessageNotificationText = createUserDeleteMessageText(
                    userData,
                    chatData,
                    detailedDeletedMessageData.sentAt,
                    deletedMessagesIds,
                )
            }
        }

        if (deletedMessageNotificationText) {
            notificationManager.log(
                'INFO',
                'Deleted messages handler',
                deletedMessageNotificationText,
                new Date() - processTime.getTime(),
            )
        }
    }
}

module.exports = {
    UserDeleteMessageNotificationManager,
}
