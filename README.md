# HypixelGuildChat-DiscordBot
A Discord bot that links your Hypixel guild chat to a specific Discord channel. The code is messy but will be cleaned up later on.
Not recommended to be used in a production environment because of a bug that does not detect the bot disconnecting (will be fixed later). A simple workaround for this issue is to automatically restart the bot periodically (every 6-12 hours).

# Features
* Supports two way chat. You can send messages from Discord to Hypixel and vice versa.
* (Coming soon) Microsoft account support.

# Todo List
* Add Microsoft account support.
* Fix auto-reconnect bug.
* Clean up code.

# Usage
Install the bot (refer to *Installation*) and run it. You'll get a message in your logging channel that the bot has initialized. Say something in the in-game guild chat and the bot should display it in its logging channel.

## How to send messages from Discord to Hypixel
Send a message in the bot's message logging channel. The bot should react to your message with a checkmark and show the sent message unless your message contains banned phrases (customizable, can be found in `main.js`). 

You should see a message in the in-game guild chat along the lines of "[DISCORD] example#0001: Hello from the other side!"

# Setup
## Prerequisites
You will need the following:
* A premium [Minecraft account]("https://www.minecraft.net/en-us/about-minecraft") inside of a Hypixel guild.
  Note: Yes, Microsoft account support is coming later.
* A [Discord bot API token]("https://discordpy.readthedocs.io/en/stable/discord.html") and [invite]("https://discordpy.readthedocs.io/en/stable/discord.html#inviting-your-bot")
* (Coming soon) A Hypixel API key (obtainable by logging onto Hypixel using any account and running `/api`)
* A bot host

## Installation
1. Install node.js if you haven't already. Installation instructions can be found [here]("https://nodejs.org/en/download/package-manager/").
2. Clone the project, download and extract.
3. Go to the bot's path and run the following commands to resolve dependencies:
   `npm install mineflayer`
   `npm install prismarine-viewer`
  4. Edit/open `botConfig.json`in a text editor. You should see this:
```json
   {
    "host": "mc.hypixel.net",
    "port": "25565",
    "username": "example@example.com",
    "password": "password",
    "discordBotToken": "discordBotToken",
    "messageLoggingChannel" : "messageLoggingChannel",
    "serverID": "serverID",
    "HypixelAPIKey": "HypixelAPIKey"
    }
```
4. Change `username` to your login email, `password` to your login password, `discordBotToken` to your Discord bot token, `messageLoggingChannel` to the channel that you want to log messages (make sure the bot can send messages there!), `HypixelAPIKey` to your Hypixel API key, and `serverID` to the server that the message logging channel resides in.
      To find the server and channel ID, turn on Developer mode in your client's settings, right click the server and the channel, and click "Copy ID".
5.  Save the text file and start the bot using `npm main.js`.
      Protip for Linux users: Install `screen` and run `screen npm main.js` to start the bot without it automatically shut down when you quit Terminal or close your SSH session.
6. Invite your bot to your server and you're done!

# Contributions
Pull requests are welcome. For major pull requests, please describe a rough summary of your push and why you would like for us to approve it.

## License
We use the [MIT](https://choosealicense.com/licenses/mit/) license.
A quick summary of said license is:

* You may commercially use this project;
* You are allowed to edit the project as much as you like;
* You may distribute the compiled code and/or source;
* You may incorporate this project into something with a more restrictive license;
* You may use this project for private use;
* The work is provided "as is", and the authors/contributors cannot be held liable and
* You must include this copyright notice and license in all copies or substantial uses of the project.

