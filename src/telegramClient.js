const input = require('input')
const path = require('path')
const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const { createStorageIfNotExists, getUserStringSession, setUserStringSession } = require('./utils/userSessionStorage')

const STORAGE_PATH = path.resolve('data', 'userSessionStorage.json')

const initTelegramClient = async () => {
    createStorageIfNotExists()
    const API_ID = Number(process.env.API_ID)
    const API_HASH = String(process.env.API_HASH)
    const STRING_SESSION = new StringSession(getUserStringSession(STORAGE_PATH))

    const client = new TelegramClient(STRING_SESSION, API_ID, API_HASH, {
        connectionRetries: 5,
    })
    await client.connect()
    console.log('Connected to Telegram')

    if (!(await client.isUserAuthorized())) {
        console.log('Authorization')
        await client.start({
            phoneNumber: async () => await input.text('Please enter your phone number: '),
            phoneCode: async () => await input.text('Please enter the code you received: '),
            password: async () => await input.text('Please enter your password: '),
            onError: (err) => console.log(err),
        })
        await setUserStringSession(STORAGE_PATH, client.session.save())
    }

    console.log('User authorized')
    return client
}

module.exports = {
    initTelegramClient,
}
