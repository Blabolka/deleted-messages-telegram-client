const fs = require('fs')
const path = require('path')

const DEFAULT_DIRECTORY_NAME = 'data'
const DEFAULT_STORAGE_NAME = 'userSessionStorage'

const createStorageIfNotExists = (options = {}) => {
    const { directoryName, storageName } = options

    const newDirectoryName = directoryName || DEFAULT_DIRECTORY_NAME
    const newStorageName = storageName || DEFAULT_STORAGE_NAME

    if (!fs.existsSync(newDirectoryName)) {
        fs.mkdirSync(newDirectoryName)
    }

    const storagePath = path.join(newDirectoryName, newStorageName + '.json')
    if (!fs.existsSync(storagePath)) {
        fs.writeFileSync(storagePath, '')
    }
}

const getUserStringSession = (storageFilePath) => {
    const result = fs.readFileSync(storageFilePath, { encoding: 'utf-8' })
    const userLoginData = result ? JSON.parse(result) : {}

    return userLoginData.sessionString || ''
}

const setUserStringSession = (storageFilePath, sessionString) => {
    fs.writeFileSync(storageFilePath, JSON.stringify({ sessionString }))
}

module.exports = {
    createStorageIfNotExists,
    getUserStringSession,
    setUserStringSession,
}
