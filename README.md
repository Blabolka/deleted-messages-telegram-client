# What you can track right now:

- [Users who started typing a message but didn't send it](#users-who-started-typing-a-message-but-didnt-send-it)
- [Chat's, group's and channel's deleted messages](#chats-groups-and-channels-deleted-messages)

# How to get started

- Create _.env_ file based on _.env.example_ with your API_KEY and API_HASH. More information can be
  found [here](https://core.telegram.org/api/obtaining_api_id)

```bash
npm install
npm run start
```

To avoid having to keep your computer on all the time, I recommend running the client on an external server that is
constantly running.

# How it works

You sign in to telegram account as usual, but through terminal. As a result, we get all the functionality of the
telegram api

### Users who started typing a message but didn't send it

This event fires, when user make some action in chat with you (typing a message, recording a voice, etc.)

After 3 minutes of some action, the telegram client checks if some message has been sent. If the message was not sent,
you get information about it in this format:

```bash
User: *firstName* *lastName* *(@username)*
User id: *userid*
Action type: *action type (typing, recording message, etc.)*
Action date: *action date*
Common chats: *list of common chats*
```

If another event is sent within three minutes, the old event is overwritten by the new one.

### Chat's, group's and channel's deleted messages

The client automatically creates a private channel where all messages from chats, groups and channels will be forwarded.

When someone deletes a message, client try to find this message in temporary storage. If the client finds the message,
it sends detailed information about deleted message, after that, you can find full deleted message in the private
channel created by client, otherwise you got simple message about message deletion.
