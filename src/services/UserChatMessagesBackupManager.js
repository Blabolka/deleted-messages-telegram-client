const { Api } = require('telegram')
const { createChannelDeleteMessageText, createUserDeleteMessageText } = require('../utils/userFormatUtils')
const {
    getUserSafe,
    getChatSafe,
    getChannelSafe,
    createChannelSafe,
    forwardMessagesSafe,
    getNotifyExceptionsSafe,
} = require('../api/safeApiCalls')
const logger = require('../services/Logger')

class UserChatMessagesBackupManager {
    constructor(client, telegramClientUserId) {
        this.client = client
        this.backupChannelId = null
        this.telegramClientUserId = telegramClientUserId

        // Data for deleted message detailed info
        // Increase value if you want to store more data (make sure you have enough RAM)
        this.TEMPORARY_DATA_STORAGE_MAX_LENGTH = 1000
        this.backedUpMessagesTemporaryData = []
    }

    async backupMessageToChannel(action) {
        if (
            this.backupChannelId &&
            (action instanceof Api.UpdateShortMessage ||
                action instanceof Api.UpdateShortChatMessage ||
                action instanceof Api.UpdateNewMessage ||
                action instanceof Api.UpdateNewChannelMessage)
        ) {
            if (!(await this.isChatNotificationsIsTurnOnByAction(action))) return

            this.backupNewMessageToChannel(action)
        } else if (action instanceof Api.UpdateDeleteMessages || action instanceof Api.UpdateDeleteChannelMessages) {
            this.notifyUserAboutDeletedMessages(action)
        }
    }

    async isChatNotificationsIsTurnOnByAction(action) {
        const allChatsNotifyExceptions = await getNotifyExceptionsSafe(this.client, { peer: this.telegramClientUserId })
        if (!Array.isArray(allChatsNotifyExceptions?.updates)) return false

        let isNotificationIsTurnOff = false
        if (action?.message?.peerId?.className === 'PeerUser' || action?.userId?.value) {
            const userId = action?.message?.peerId?.userId?.value || action.userId?.value
            isNotificationIsTurnOff = allChatsNotifyExceptions.updates.some((update) => {
                return update?.peer?.peer?.userId?.value === userId && update?.notifySettings?.muteUntil > 0
            })
        } else if (action?.message?.peerId?.className === 'PeerChat' || action?.chatId?.value) {
            const chatId = action?.message?.peerId?.chatId?.value || action?.chatId?.value
            isNotificationIsTurnOff = allChatsNotifyExceptions.updates.some((update) => {
                return update?.peer?.peer?.chatId?.value === chatId && update?.notifySettings?.muteUntil > 0
            })
        } else if (action?.message?.peerId?.className === 'PeerChannel') {
            const channelId = action?.message?.peerId?.channelId?.value
            isNotificationIsTurnOff = allChatsNotifyExceptions.updates.some((update) => {
                return update?.peer?.peer?.channelId?.value === channelId && update?.notifySettings?.muteUntil > 0
            })
        }

        return !isNotificationIsTurnOff
    }

    async backupNewMessageToChannel(action) {
        const isMessageOut = action?.message?.out || action.out
        if (!isMessageOut) {
            const fromPeerId =
                action?.message?.peerId?.channelId?.value ||
                action?.message?.senderId?.value ||
                action?.fromId?.value ||
                action?.userId?.value
            const messageId = action?.message?.id || action?.id

            forwardMessagesSafe(this.client, {
                fromPeer: fromPeerId,
                id: [messageId],
                toPeer: this.backupChannelId,
            })

            const chatId =
                action?.message?.peerId?.channelId?.value ||
                action?.message?.peerId?.chatId?.value ||
                action?.message?.peerId?.userId?.value ||
                action?.chatId?.value ||
                action?.userId?.value
            this.backedUpMessagesTemporaryData.push({
                messageId,
                fromPeerId,
                chatId,
                sentAt: new Date(),
            })

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

    async setupBackupChannel() {
        const dialogs = await this.client.getDialogs()
        const backupChannel = dialogs.find((dialog) => {
            return (
                dialog.title === 'Message Backups Channel' &&
                dialog.entity.participantsCount < 2 &&
                dialog.entity.creator
            )
        })

        if (backupChannel && backupChannel.entity && backupChannel.entity.id && backupChannel.entity.id.value) {
            this.backupChannelId = backupChannel.entity.id.value
        } else {
            const createdBackupChannel = await this.createBackupChannel()
            if (createdBackupChannel && createdBackupChannel.id && createdBackupChannel.id.value) {
                this.backupChannelId = createdBackupChannel.id.value
            }
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

        logger.log(
            'INFO',
            'Deleted message handler',
            deletedMessageNotificationText,
            new Date() - processTime.getTime(),
        )

        if (process.env.SAVED_MESSAGES_LOGGER_ENABLED === 'true') {
            await this.client.sendMessage('me', { message: deletedMessageNotificationText })
        }
    }

    async createBackupChannel() {
        return createChannelSafe(this.client, {
            title: 'Message Backups Channel',
            about: '',
        })
    }
}

module.exports = {
    UserChatMessagesBackupManager,
}
