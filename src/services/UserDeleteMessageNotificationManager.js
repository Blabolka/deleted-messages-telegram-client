const { Api } = require('telegram')
const notificationManager = require('../services/NotificationManager')
const { convertObjectBigIntKeysToNumber } = require('../utils/bigintUtils')
const { getChannelSafe, getUserSafe, getChatSafe } = require('../api/safeApiCalls')
const {
    addNotificationData,
    deleteManyElementsByLimit,
    findManyNotificationsAndDelete,
    getNotificationsDataDocumentsCount,
} = require('../tools/database/api/deleteMessagesNoficationsData')
const { createChannelDeleteMessageText, createUserDeleteMessageText } = require('../utils/userFormatUtils')

class UserDeleteMessageNotificationManager {
    constructor(client, telegramClientUserId, options = {}) {
        this.client = client
        this.telegramClientUserId = telegramClientUserId

        // Data for deleted message detailed info
        // Increase value if you want to store more data (make sure you have enough RAM or database capacity)
        this.TEMPORARY_DATA_STORAGE_MAX_LENGTH = options.temporaryDataStorageMaxLength || 1000
        this.useMongoDatabaseAsTemporaryDataStorage = options.useMongoDatabaseAsTemporaryDataStorage || false
        this.backedUpMessagesTemporaryData = []
    }

    async processAction(action) {
        if (action instanceof Api.UpdateDeleteMessages || action instanceof Api.UpdateDeleteChannelMessages) {
            this.notifyUserAboutDeletedMessages(action)
        }
    }

    async addBackedUpMessageTemporaryData(dataItem) {
        if (dataItem.fromPeerId === this.telegramClientUserId) return

        if (this.useMongoDatabaseAsTemporaryDataStorage) {
            await addNotificationData(convertObjectBigIntKeysToNumber(dataItem))

            const notificationCollectionDocumentsCount = await getNotificationsDataDocumentsCount()

            if (notificationCollectionDocumentsCount > this.TEMPORARY_DATA_STORAGE_MAX_LENGTH) {
                const lengthDifference = notificationCollectionDocumentsCount - this.TEMPORARY_DATA_STORAGE_MAX_LENGTH
                deleteManyElementsByLimit(lengthDifference)
            }
        } else {
            this.backedUpMessagesTemporaryData.push(dataItem)

            if (this.backedUpMessagesTemporaryData.length > this.TEMPORARY_DATA_STORAGE_MAX_LENGTH) {
                const lengthDifference =
                    this.backedUpMessagesTemporaryData.length - this.TEMPORARY_DATA_STORAGE_MAX_LENGTH
                this.backedUpMessagesTemporaryData.splice(
                    this.backedUpMessagesTemporaryData.length - lengthDifference,
                    lengthDifference,
                )
            }
        }
    }

    async notifyUserAboutDeletedMessages(action) {
        let processTime = new Date()
        let deletedMessageNotificationText
        if (action instanceof Api.UpdateDeleteChannelMessages) {
            const { value: deleteMessagesChannelId } = action.channelId
            const { messages: deletedMessagesIds } = action
            let detailedDeletedMessageData
            if (this.useMongoDatabaseAsTemporaryDataStorage) {
                detailedDeletedMessageData = (
                    await findManyNotificationsAndDelete(
                        convertObjectBigIntKeysToNumber({
                            fromPeerId: deleteMessagesChannelId,
                            messages: deletedMessagesIds,
                        }),
                    )
                )[0]
            } else {
                detailedDeletedMessageData = this.backedUpMessagesTemporaryData.find((dataItem) => {
                    return (
                        dataItem.fromPeerId === deleteMessagesChannelId &&
                        deletedMessagesIds.some((deletedMessageId) => dataItem.messageId === deletedMessageId)
                    )
                })
            }

            if (detailedDeletedMessageData) {
                const channelData = await getChannelSafe(this.client, detailedDeletedMessageData.fromPeerId)
                deletedMessageNotificationText = createChannelDeleteMessageText(
                    channelData,
                    new Date(detailedDeletedMessageData.sentAt * 1000),
                    deletedMessagesIds,
                )
            }
        } else {
            const { messages: deletedMessagesIds } = action

            let detailedDeletedMessageData
            if (this.useMongoDatabaseAsTemporaryDataStorage) {
                detailedDeletedMessageData = (
                    await findManyNotificationsAndDelete(
                        convertObjectBigIntKeysToNumber({ messages: deletedMessagesIds }),
                    )
                )[0]
            } else {
                detailedDeletedMessageData = this.backedUpMessagesTemporaryData.find((dataItem) => {
                    return deletedMessagesIds.some((deletedMessageId) => dataItem.messageId === deletedMessageId)
                })
            }

            if (detailedDeletedMessageData) {
                const userData = await getUserSafe(this.client, detailedDeletedMessageData.fromPeerId)
                const chatData = await getChatSafe(this.client, detailedDeletedMessageData.chatId)
                deletedMessageNotificationText = createUserDeleteMessageText(
                    userData,
                    chatData,
                    new Date(detailedDeletedMessageData.sentAt * 1000),
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
