const { Api } = require('telegram')
const { createChannelSafe, forwardMessages } = require('../api/safeApiCalls')

class UserChatMessagesBackupManager {
    constructor(client) {
        this.client = client
        this.backupChannelId = null
    }

    async backupMessageToChannel(action) {
        if (this.backupChannelId) {
            if (action instanceof Api.UpdateShortMessage) {
                this.backupShortMessageToChannel(action)
            } else if (action instanceof Api.UpdateShortChatMessage) {
                this.backupShortChatMessageToChannel(action)
            } else if (action instanceof Api.UpdateNewMessage) {
                this.backupNewMessageToChannel(action)
            } else if (action instanceof Api.UpdateNewChannelMessage) {
                this.backupNewChannelMessageToChannel(action)
            }
        }
    }

    async backupShortMessageToChannel(action) {
        if (!action.out) {
            forwardMessages(this.client, {
                fromPeer: action.userId.value,
                id: [action.id],
                toPeer: this.backupChannelId,
            })
        }
    }
    async backupShortChatMessageToChannel(action) {
        if (!action.out) {
            forwardMessages(this.client, {
                fromPeer: action.fromId.value,
                id: [action.id],
                toPeer: this.backupChannelId,
            })
        }
    }
    async backupNewMessageToChannel(action) {
        if (action.message && !action.message.out) {
            forwardMessages(this.client, {
                fromPeer: action.message.senderId.value,
                id: [action.message.id],
                toPeer: this.backupChannelId,
            })
        }
    }
    async backupNewChannelMessageToChannel(action) {
        if (action.message && !action.message.out) {
            forwardMessages(this.client, {
                fromPeer: action.message.peerId.channelId.value,
                id: [action.message.id],
                toPeer: this.backupChannelId,
            })
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
