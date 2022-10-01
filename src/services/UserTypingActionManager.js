const { Api } = require('telegram')

class UserTypingActionManager {
    constructor() {
        this.userTypingStorageMap = new Map()
    }

    getUsersAfterTimeAfterTyping(timeAfterTypingMs) {
        return Array.from(this.userTypingStorageMap.entries()).reduce((memo, [userId, actionData]) => {
            const actionDateMs = new Date(actionData.actionDate).getTime()
            const currentDateMs = new Date().getTime()

            const isActionDateWithDelayAfterNow = currentDateMs >= actionDateMs + timeAfterTypingMs
            if (isActionDateWithDelayAfterNow) {
                memo.push({
                    userId,
                    ...actionData,
                })
            }

            return memo
        }, [])
    }

    deleteAction(userId) {
        this.userTypingStorageMap.delete(userId)
    }

    processAction(action) {
        if (!(action instanceof Api.UpdateUserTyping)) return

        if (action && action.userId) {
            const actionKey = action.userId.value
            const actionValue = {
                actionType: action.action.className,
                actionDate: new Date(),
            }

            this.userTypingStorageMap.set(actionKey, actionValue)
        }
    }
}

module.exports = {
    UserTypingActionManager,
}
