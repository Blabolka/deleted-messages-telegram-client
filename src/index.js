const { TelegramClient, Api } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require("input")

const apiId = Number(process.env.API_ID);
const apiHash = String(process.env.API_HASH);
const stringSession = new StringSession(String(process.env.STRING_SESSION)); // fill this later with the value from session.save()

(async () => {
    console.log('Loading interactive example...');
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await client.connect();

    client.addEventHandler((update) => {
        if (
            update instanceof Api.UpdateUserTyping
            || update instanceof Api.UpdateChatUserTyping
        ) {
            console.log(update)
        }
    });

    // await client.start({
    //     phoneNumber: async () => await input.text("Please enter your number: "),
    //     password: async () => await input.text("Please enter your password: "),
    //     phoneCode: async () =>
    //         await input.text("Please enter the code you received: "),
    //     onError: (err) => console.log(err),
    // });
    // console.log("You should now be connected.");
    // console.log(client.session.save()); // Save this string to avoid logging in again
    // await client.sendMessage("me", { message: "Hello!" });
})();
