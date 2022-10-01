const createUserTypingMessageText = (fullUserInfo, commonChats, actionData) => {
    const { firstName, lastName, username } = fullUserInfo

    const lastNameValidated = lastName ? ' ' + lastName : ''
    const usernameValidated = username ? ' ' + `(@${username})` : ''

    const message = [
        `User: ${firstName}${lastNameValidated}${usernameValidated}`,
        `User id: ${actionData.userId}`,
        'Action type: ' + actionData.actionType,
        'Action date: ' + new Date(actionData.actionDate).toISOString(),
    ]

    if (commonChats.length) {
        const commonChatsNames = commonChats.map((commonChat) => {
            return '"' + commonChat.title + '"'
        })
        message.push('Common chats: ' + commonChatsNames.join(', '))
    }

    return message.join('\n')
}

const createChannelDeleteMessageText = (fullChannelInfo, deletedMessageSentAtDate, deletedMessagesIds) => {
    const { title, username } = fullChannelInfo

    const usernameValidated = username ? ' ' + `(@${username})` : ''

    const pluralMessagesWord = deletedMessagesIds.length > 1 ? 'messages' : 'message'
    const capitalizedPluralMessagesWord = deletedMessagesIds.length > 1 ? 'Messages' : 'Message'
    const message = [
        `Channel delete ${pluralMessagesWord}`,
        `Channel: ${title}${usernameValidated}`,
        `${capitalizedPluralMessagesWord} sent at: ${new Date(deletedMessageSentAtDate).toISOString()}`,
        `${capitalizedPluralMessagesWord} deleted at: ${new Date().toISOString()}`,
    ]

    return message.join('\n')
}

const createSomeChannelDeleteMessageText = (deletedMessagesIds) => {
    const pluralMessagesWord = deletedMessagesIds.length > 1 ? 'messages' : 'message'
    return `Some channel delete ${pluralMessagesWord} at: ${new Date().toISOString()}`
}

const createUserDeleteMessageText = (fullUserInfo, fullChatData, deletedMessageSentAtDate, deletedMessagesIds) => {
    const { firstName, lastName, username } = fullUserInfo
    const chatTitle = (fullChatData && fullChatData.title) || ''

    const lastNameValidated = lastName ? ' ' + lastName : ''
    const usernameValidated = username ? ' ' + `(@${username})` : ''

    const pluralMessagesWord = deletedMessagesIds.length > 1 ? 'messages' : 'message'
    const capitalizedPluralMessagesWord = deletedMessagesIds.length > 1 ? 'Messages' : 'Message'
    const message = [
        `User delete ${pluralMessagesWord}`,
        `User: ${firstName}${lastNameValidated}${usernameValidated}`,
        chatTitle ? `Chat: ${chatTitle}` : '',
        `${capitalizedPluralMessagesWord} sent at: ${new Date(deletedMessageSentAtDate).toISOString()}`,
        `${capitalizedPluralMessagesWord} deleted at: ${new Date().toISOString()}`,
    ]

    return message.filter((item) => item).join('\n')
}

const createSomeUserDeleteMessageText = (deletedMessagesIds) => {
    const pluralMessagesWord = deletedMessagesIds.length > 1 ? 'messages' : 'message'
    return `Some user delete ${pluralMessagesWord} at: ${new Date().toISOString()}`
}

module.exports = {
    createUserTypingMessageText,
    createChannelDeleteMessageText,
    createSomeChannelDeleteMessageText,
    createUserDeleteMessageText,
    createSomeUserDeleteMessageText,
}