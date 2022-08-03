const createUserTypingMessageText = (fullUserInfo, commonChats, actionData) => {
    const { firstName, lastName, username } = fullUserInfo

    const lastNameValidated = lastName ? ' ' + lastName : ''
    const usernameValidated = username ? ' ' + `(@${username})` : ''

    const message = [
        '‼ STATISTICS TELEGRAM CLIENT ‼',
        `${firstName}${lastNameValidated}${usernameValidated}`,
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

module.exports = {
    createUserTypingMessageText,
}