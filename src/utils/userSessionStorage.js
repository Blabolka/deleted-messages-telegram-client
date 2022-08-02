const fs = require('fs')

const getUserStringSession = (storageFilePath) => {
    const result = fs.readFileSync(storageFilePath, { encoding: 'utf-8' })
    const userLoginData = result ? JSON.parse(result) : {}

    return userLoginData.sessionString || ''
}

const setUserStringSession = (storageFilePath, sessionString) => {
    fs.writeFileSync(storageFilePath, JSON.stringify({ sessionString }))
}

module.exports = {
    getUserStringSession,
    setUserStringSession,
}
