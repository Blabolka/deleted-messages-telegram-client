const { Schema, model } = require('mongoose')

const schema = new Schema(
    {
        messageId: {
            type: Number,
            required: true,
        },
        fromPeerId: {
            type: Number,
            require: true,
        },
        chatId: {
            type: Number,
            required: true,
        },
        sentAt: {
            type: Number,
            require: true,
        },
    },
    {
        collection: 'deletedMessagesNotificationData',
        versionKey: false,
    },
)

const DeletedMessagesNotificationDataModel = model('DeletedMessagesNotificationData', schema)

module.exports = DeletedMessagesNotificationDataModel
