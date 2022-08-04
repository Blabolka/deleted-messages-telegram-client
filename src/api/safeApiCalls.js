const { Api } = require('telegram')

const getChatHistoryMessagesSafe = async (client, userId) => {
    try {
        const chatHistory = await client.invoke(
            new Api.messages.GetHistory({
                peer: userId,
            }),
        )

        if (chatHistory && Array.isArray(chatHistory.messages)) {
            return chatHistory.messages
        }

        return []
    } catch (err) {
        return []
    }
}

const getUserCommonChatsSafe = async (client, userId) => {
    try {
        const commonChats = await client.invoke(
            new Api.messages.GetCommonChats({
                userId: userId,
            }),
        )

        if (commonChats && Array.isArray(commonChats.chats)) {
            return commonChats.chats
        }

        return []
    } catch (err) {
        return []
    }
}

const getUserSafe = async (client, userId) => {
    try {
        const users = await client.invoke(
            new Api.users.GetUsers({
                id: [userId],
            }),
        )

        if (users && Array.isArray(users) && users.length) {
            return users[0]
        }

        return null
    } catch (err) {
        return null
    }
}

module.exports = {
    getChatHistoryMessagesSafe,
    getUserCommonChatsSafe,
    getUserSafe,
}
