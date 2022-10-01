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

const getChatSafe = async (client, chatId) => {
    try {
        const chatsData = await client.invoke(
            new Api.messages.GetChats({
                id: [chatId],
            }),
        )

        if (chatsData && Array.isArray(chatsData.chats) && chatsData.chats.length) {
            return chatsData.chats[0]
        }

        return null
    } catch (err) {
        return null
    }
}

const getChannelSafe = async (client, channelId) => {
    try {
        const channels = await client.invoke(
            new Api.channels.GetChannels({
                id: [channelId],
            }),
        )

        if (channels && Array.isArray(channels.chats) && channels.chats.length) {
            return channels.chats[0]
        }

        return null
    } catch (err) {
        return null
    }
}

const createChannelSafe = async (client, options) => {
    try {
        const channelCreationResponse = await client.invoke(new Api.channels.CreateChannel(options))

        if (
            channelCreationResponse &&
            Array.isArray(channelCreationResponse.chats) &&
            channelCreationResponse.chats.length
        ) {
            return channelCreationResponse.chats[0]
        }

        return null
    } catch (err) {
        console.log(err)
        return null
    }
}

const forwardMessagesSafe = async (client, options) => {
    try {
        await client.invoke(new Api.messages.ForwardMessages(options))

        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

const getNotifyExceptionsSafe = async (client, options) => {
    try {
        const result = await client.invoke(new Api.account.GetNotifyExceptions(options))

        return result || null
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = {
    getChatHistoryMessagesSafe,
    getUserCommonChatsSafe,
    getUserSafe,
    getChatSafe,
    getChannelSafe,
    createChannelSafe,
    forwardMessagesSafe,
    getNotifyExceptionsSafe,
}
