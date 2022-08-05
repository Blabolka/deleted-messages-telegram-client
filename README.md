# What can you track right now:
- [Users who started typing a message but didn't send it](#users-who-started-typing-a-message-but-didnt-send-it)

# How to get started
- Create _.env_ file based on _.env.example_ with your API_KEY and API_HASH. More information can be found [here](https://core.telegram.org/api/obtaining_api_id)

```bash
npm install
npm run start
```

To avoid having to keep your computer on all the time, I recommend running the client on an external server that is constantly running.

# How it works

You sign in to telegram account as usual, but through terminal.
As a result, we get all the functionality of the telegram api

### Users who started typing a message but didn't send it

This event fires, when user make some action in chat with you (typing a message, recording a voice, etc.)

After 3 minutes of some action, the telegram client checks if some message has been sent.
If the message was not sent, you get information about it in this format:

```bash
User: *firstName* *lastName* *(@username)*
User id: *userid*
Action type: *action type (typing, recording message, etc.)*
Action date: *action date*
Common chats: *list of common chats*
```

If another event is sent within three minutes, the old event is overwritten by the new one.
