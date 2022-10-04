const { Api } = require('telegram')
const { createChannelSafe, forwardMessagesSafe, getNotifyExceptionsSafe } = require('../api/safeApiCalls')

class UserChatMessagesBackupManager {
    constructor(client, telegramClientUserId, userDeleteMessageNotificationManager, options = {}) {
        this.client = client
        this.backupChannelId = null
        this.telegramClientUserId = telegramClientUserId
        this.userDeleteMessageNotificationManager = userDeleteMessageNotificationManager

        this.options = options
    }

    async processAction(action) {
        if (
            this.backupChannelId &&
            (action instanceof Api.UpdateShortMessage ||
                action instanceof Api.UpdateShortChatMessage ||
                action instanceof Api.UpdateNewMessage ||
                action instanceof Api.UpdateNewChannelMessage)
        ) {
            if (!this.options.includeMutedChats && !(await this.isChatNotificationsIsTurnOnByAction(action))) return

            this.backupMessageToChannel(action)
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

    async backupMessageToChannel(action) {
        const isMessageOut = action?.message?.out || action.out
        if (!isMessageOut) {
            const fromPeerId =
                action?.message?.peerId?.channelId?.value ||
                action?.message?.senderId?.value ||
                action?.fromId?.value ||
                action?.userId?.value
            const messageId = action?.message?.id || action?.id

            if (fromPeerId === this.backupChannelId) {
                return
            }

            forwardMessagesSafe(this.client, {
                fromPeer: fromPeerId,
                id: [messageId],
                toPeer: this.backupChannelId,
            })

            const messageDate = action?.message?.date || action?.date
            const chatId =
                action?.message?.peerId?.channelId?.value ||
                action?.message?.peerId?.chatId?.value ||
                action?.message?.peerId?.userId?.value ||
                action?.chatId?.value ||
                action?.userId?.value

            if (this.userDeleteMessageNotificationManager) {
                this.userDeleteMessageNotificationManager.addBackedUpMessageTemporaryData({
                    messageId,
                    fromPeerId,
                    chatId,
                    sentAt: messageDate,
                })
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
