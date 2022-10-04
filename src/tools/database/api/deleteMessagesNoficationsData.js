const { Types } = require('mongoose')
const DeletedMessagesNotificationDataModel = require('../../../models/DeletedMessagesNotificationData')

const deleteManyNotificationsByIds = async (documentIdsToRemove) => {
    await DeletedMessagesNotificationDataModel.deleteMany({
        _id: {
            $in: documentIdsToRemove,
        },
    })
}

const findManyNotificationsAndDelete = async (fields) => {
    const { messages, ...otherFields } = fields
    const matchedDocuments = await DeletedMessagesNotificationDataModel.find({
        ...otherFields,
        messageId: {
            $in: messages,
        },
    }).lean()

    await deleteManyNotificationsByIds(matchedDocuments.map((a) => a._id))

    return matchedDocuments
}

const addNotificationData = (data) => {
    return DeletedMessagesNotificationDataModel.findOneAndUpdate(
        { _id: new Types.ObjectId() },
        { ...data },
        {
            upsert: true,
        },
    )
}

const deleteManyElementsByLimit = async (deleteLimit) => {
    const documentsToRemove = await DeletedMessagesNotificationDataModel.find().limit(deleteLimit).exec()
    const documentIdsToRemove = documentsToRemove.map((a) => a._id)

    await deleteManyNotificationsByIds(documentIdsToRemove)
}

const getNotificationsDataDocumentsCount = () => {
    return DeletedMessagesNotificationDataModel.countDocuments({})
}

module.exports = {
    addNotificationData,
    deleteManyElementsByLimit,
    findManyNotificationsAndDelete,
    getNotificationsDataDocumentsCount,
}
