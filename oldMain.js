//TODO Add filter for discord-ig guild chat

const Minecraft = require('mineflayer');
const stringSimilarity = require("string-similarity");

const Discord = require('discord.js');
const BotConfig = require('./botConfig.json');
const Perspective = require('perspective-api-client');
let connected = false;
let perspectiveClient;
let lastMessage = null;
let flaggedAsSpam = null;
let alreadyRelogging = false;
const { glob } = require('glob');
const { result, last } = require('lodash');
const DiscordClient = new Discord.Client();
const BannedPhrases = ["twitch.com", "twitch.tv", "cunt", "bitch", "nigga", "nigger", "sex", "cum", "dick", "fuck", "youtube.com", "https://", "http://", ".com", ".net", ".org", ".io", ".co"];
const SmartFilterWordBlacklist = [ "twitch.com", "twitch.tv", "youtube.com", "https://", "http://", ".com", ".net", ".org", ".io", ".co"]
let usedPhrases = [];
let MinecraftBot = null;
const HypixelAPI = require('hypixel-api');
const client = new HypixelAPI(BotConfig.HypixelAPIKey);
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
const info = (message) => {
    console.log("[INFO] " + message);
}
const chat = (message) => {
    console.log("[CHAT] " + message);
}
const warn = (message) => {
    console.warn("[WARN] " + message);
}
const error = (message) => {
    console.error("[ERROR] " + message);
}
const remove = (ent) => {
    usedPhrases[ent] = null;
}


const reattachlistners = () => {
    info("Reregistering events...");
    if (alreadyRelogging == false) {
        alreadyRelogging = true;
        info("Logging onto Minecraft...");
        MinecraftBot = null;
        if (BotConfig.AuthType.toLowerCase() == "mojang") {
            info("Login account type: Mojang");
            MinecraftBot = null;
            MinecraftBot = Minecraft.createBot({
                host: BotConfig.host,
                port: BotConfig.port,
                username: BotConfig.username,
                password: BotConfig.password,
                version: "1.16.5",
                auth: BotConfig.AuthType.toLowerCase()
            });
        } else if (BotConfig.AuthType.toLowerCase() == "microsoft") {
            info("Login account type: Microsoft");
            MinecraftBot = null;
            MinecraftBot = Minecraft.createBot({
                host: BotConfig.host,
                port: BotConfig.port,
                username: BotConfig.username,
                password: BotConfig.password,
                version: "1.16.5",
                auth: "microsoft"
            });
        }
        
        MinecraftBot.on('end', async () => {
            connected = false;
            error("I was kicked from " + BotConfig.host + ". Relogging!");
            DiscordClient.channels.cache.get(BotConfig.messageLoggingChannel).send(new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setDescription("I was kicked from " + BotConfig.host + ". Reconnecting in 30 seconds!"));
            await snooze(30000);
            reattachlistners();
        })
        
        MinecraftBot.on('messagestr', (message) => {
            chat(message);

           /*  if (message.toLowerCase().startsWith("you cannot say the same message twice!")) {
                flaggedAsSpam = true
            } */

            let parsedMessage = parse(message);
            if (parsedMessage != null) {
                if (parsedMessage[0] != BotConfig.BotName && parsedMessage[1] != null) {
                DiscordClient.channels.cache.get(BotConfig.messageLoggingChannel).send(new Discord.MessageEmbed()
                .setColor('#32d600')
                .setAuthor(parsedMessage[0], "https://mc-heads.net/avatar/" + parsedMessage[0])
                .setFooter(DiscordClient.guilds.cache.get(BotConfig.serverID).name, DiscordClient.guilds.cache.get(BotConfig.serverID).iconURL())
                .setDescription(parsedMessage[1])
                .setTimestamp()
                );
                }
                
            }
        });
    
        MinecraftBot.on('error', async (err) => {
            error("An error has occured: " + err.message + ". Reconnecting!");
            connected = false;
            await snooze(30000);
            reattachlistners();
        })
    
        MinecraftBot.on('spawn', () => {
            
            info("Spawned into world!");
            })
            alreadyRelogging = false;
    }
}

const init = () => {
    const embed = new Discord.MessageEmbed()
        .setColor(0x00AE86)
        .setDescription("Hypixel Guild Livechat initiated.")
        .setTimestamp();

    DiscordClient.channels.cache.get(BotConfig.messageLoggingChannel).send(embed);
    reattachlistners();
}
const parse = (str) => {

if (str.startsWith("Guild > ")) {
    let player = null;
    let message = null;
    let pmessage = "";
    str = str.slice(8);
    message = str.split(":");
    
    if (message.length > 2) {
        for (i = 0; i < message.length; i++) {
            if (i > 0) {
                if (i == 1) {
                    pmessage = pmessage + message[i];
                } else {
                    pmessage = pmessage + ":" + message[i];
                }
            }
        }
    } else {
        pmessage = message[1];
    }
    str = str.split(":")[0].split(" ");
    if (str.length == 1) {
        return [str[0], pmessage];
    } else {
        return [str[1], pmessage];
    }
}

}

const checkIfDisconnected = async () => {
    while (true) {
        await snooze(10000);
        client.getPlayer('name', 'JustPrettyBoy').then((player) => {
            if (player.player.lastLogin > player.player.lastLogout) {
            } else {
                warn("The bot is not connected to Hypixel - relogging!");
                connected = false;
                if (alreadyRelogging == true) {
                    info("Relog cancelled - the bot is already relogging!");
                } else {
                    reattachlistners();
                }
            }
        })
    }
}

const onStart = async () => {
    info("Starting HypixelGuild-Discord bridge bot...");
    info("Checking for Perspective API key...");
    if (BotConfig.filterType.toLowerCase() == "perspective" && BotConfig.perspectiveAPIkey != undefined) {
        info("Using advanced (Perspective) chat filtering!");
        // TODO Add code for Perspective API initialization. 
        perspectiveClient = new Perspective({apiKey: BotConfig.perspectiveAPIkey});
    } else if (BotConfig.filterType.toLowerCase == "perspective" && BotConfig.perspectiveAPIkey == undefined) {
        info("Sorry, but advanced/Perspective chat filtering requires a Perspective API key. You can get one for free.");
    }
    info("Logging onto Discord...");
    DiscordClient.login(BotConfig.discordBotToken);
    DiscordClient.once('ready', () => {
        checkIfDisconnected();
        info("Connected to Discord and successfully logged in!");
        init();
        DiscordClient.user.setActivity("over Hypixel Portal", { type: "WATCHING"});
        DiscordClient.on('message', async (message) => {
            let duplicate = false;
            let pMessage = message.content.split(" "); 
            
            if (message.channel.id == BotConfig.messageLoggingChannel && message.member.id != "837953384182579211") {
                let invalid = false;

                if (perspectiveClient != undefined) {
                    const apiReturnRawJSON = JSON.stringify(await perspectiveClient.analyze(message.content, {attributes: ['SEVERE_TOXICITY', 'IDENTITY_ATTACK', 'THREAT', 'SEXUALLY_EXPLICIT'], languages: "en", doNotTrack: false}));
                        const apiReturn = JSON.parse(apiReturnRawJSON);
                       
                       /*
                       */ if (apiReturn.attributeScores.SEVERE_TOXICITY.summaryScore.value * 100 > BotConfig.messageFlagTolernace) {
                           info("Member " + message.member.user.tag + "'s message '" + message.cleanContent + "' has been flagged by the Perspective API for SEVERE_TOXICITY. Percentage: " + apiReturn.attributeScores.SEVERE_TOXICITY.summaryScore.value * 100);
                           if (message.deletable == true) { message.delete(); }
                           message.channel.send(new Discord.MessageEmbed()
                           .setColor('#FF0000')
                           .setDescription("<@!" + message.member.user.id + ">, please refrain from sending toxic messages!"));
                           invalid = true;
                       } else if (apiReturn.attributeScores.IDENTITY_ATTACK.summaryScore.value * 100 > BotConfig.messageFlagTolernace) {
                           info("Member " + message.member.user.tag + "'s message '" + message.cleanContent + "' has been flagged by the Perspective API for IDENTITY_ATTACK. Percentage: " + apiReturn.attributeScores.IDENTITY_ATTACK.summaryScore.value * 100);
                           if (message.deletable == true) { message.delete(); }
                           message.channel.send(new Discord.MessageEmbed()
                           .setColor('#FF0000')
                           .setDescription("<@!" + message.member.user.id + ">, please refrain from attacking others because of their identities!"));
                           invalid = true;
                       } else if (apiReturn.attributeScores.THREAT.summaryScore.value * 100 > BotConfig.messageFlagTolernace) {
                           info("Member " + message.member.user.tag + "'s message '" + message.cleanContent + "' has been flagged by the Perspective API for THREAT. Percentage: " + apiReturn.attributeScores.THREAT.summaryScore.value * 100);
                           if (message.deletable == true) { message.delete(); }
                           message.channel.send(new Discord.MessageEmbed()
                           .setColor('#FF0000')
                           .setDescription("<@!" + message.member.user.id + ">, please refrain from discussing threatening others!"));
                           invalid = true;
                       } else if (apiReturn.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value * 100 > BotConfig.messageFlagTolernace) {
                           info("Member " + message.member.user.tag + "'s message '" + message.cleanContent + "' has been flagged by the Perspective API for SEXUALLY_EXPLICIT. Percentage: " + apiReturn.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value * 100);
                           if (message.deletable == true) { message.delete(); }
                           message.channel.send(new Discord.MessageEmbed()
                           .setColor('#FF0000')
                           .setDescription("<@!" + message.member.user.id + ">, please refrain from discussing anything sexually explicit!"));
                           invalid = true;
                       }
                       if (invalid == false) {
                        for (i = 0; i < SmartFilterWordBlacklist.length; i++) {
                            let loweredMessage = message.content.toLowerCase();
                            if (loweredMessage.includes(SmartFilterWordBlacklist[i])) {
                                if (message.deletable) {
                                    message.channel.send(new Discord.MessageEmbed()
                                    .setColor('#FF0000')
                                    .setDescription("<@!" + message.member.id + ">, please do not send links!")
                                    );
                                    message.delete();
                                    invalid = true;
                                } else {
                                    message.channel.send(new Discord.MessageEmbed()
                                    .setColor('#FF0000')
                                    .setDescription("<@!" + message.member.id + ">, please do not send links!")
                                    );
                                    invalid = true;
                                }
                            }
                        }
                    }
                } else if (perspectiveClient == undefined) {
                    for (i = 0; i < BannedPhrases.length; i++) {
                        let loweredMessage = message.content.toLowerCase();
                        if (loweredMessage.includes(BannedPhrases[i])) {
                            if (message.deletable) {
                                message.channel.send(new Discord.MessageEmbed()
                                .setColor('#FF0000')
                                .setDescription("<@!" + message.member.id + ">, your message contains banned phrases and cannot be sent.")
                                );
                                message.delete();
                                invalid = true;
                            }
                        }
                    }
                }

                usedPhrases.forEach((element) => {
                        if (element != null) {
                        let spamP = stringSimilarity.compareTwoStrings(element, message.content) * 100;
                        if (spamP > 75) {
                            warn("Message is most likely spam - blocked!");
                            duplicate = true;
                        }
                    }
                });
                
                if (!invalid && duplicate == false) {
                    
                    /*
                    lastMessage = message.channel.send(new Discord.MessageEmbed()
                    .setColor('#add8e6')
                    .setDescription('Sending message...'));
                    await MinecraftBot.chat("/gc " + "[DISCORD] " + message.member.user.tag + ": " + message.cleanContent);
                    if (flaggedAsSpam) {
                        message.react('❌');
                        (await lastMessage).edit(new Discord.MessageEmbed()
                        .setColor('#ff0000')
                        .setDescription("Message failed to send - flagged by Hypixel as spam."));
                        flaggedAsSpam = false;
                    } else */ if (true) {
                        await MinecraftBot.chat("/gc " + "[DISCORD] " + message.member.user.tag + ": " + message.cleanContent);
                        message.react('✅');
                        /* (await lastMessage).edit */ message.channel.send(new Discord.MessageEmbed()
                        .setAuthor(message.member.user.tag, message.member.user.displayAvatarURL())
                        .setColor('0x00AE86')
                        .setDescription(message.cleanContent)
                        .setFooter(DiscordClient.guilds.cache.get(BotConfig.serverID).name, message.guild.iconURL())
                        .setTimestamp());
                        usedPhrases[usedPhrases.length] = message.content.toLowerCase();
                        await snooze(30000);
                        usedPhrases.splice(0, 1);
                        // flaggedAsSpam = false;
                    }


                    // TODO Replace mentions with user's Discord tag.
                    

                } else if (duplicate == true) {
                    message.react('❌');
                    message.channel.send(new Discord.MessageEmbed()
                    .setColor('#FF0000')
                    .setDescription("Message spam blocked."));
                }
            } 
            if (pMessage.length > 0) {
                if (pMessage[0].toLowerCase() == "$gkick") {
                    let kickReason = null;

                    for (i = 0; i < pMessage.length; i++) {
                        if (i >= 3) {
                            if (kickReason == null || kickReason == "") {
                                kickReason = pMessage[i];
                            } else {
                                kickReason = kickReason + " " + pMessage[i];
                            }
                        }
                    }

                    if (pMessage.length >= 2) {
                        if (message.member.hasPermission('KICK_MEMBERS')) {
                                if (kickReason == null) {
                                    await MinecraftBot.chat("/g kick " + pMessage[1] + " Guild member kick requested by " + message.member.user.tag + ".");
                                    message.react("✅");
                                    message.channel.send(new Discord.MessageEmbed()
                                    .setColor('#00FF00')
                                    .setTitle("Success")
                                    .setDescription("Command to kick guild member `" + pMessage[1] + "` has been successfully sent!"));
                                } else {
                                    await MinecraftBot.chat("/g kick " + pMessage[1] + " " + kickReason);
                                    message.react("✅");
                                    message.channel.send(new Discord.MessageEmbed()
                                    .setColor('#00FF00')
                                    .setTitle("Success")
                                    .setDescription("Command to kick guild member `" + pMessage[1] + "` with reason `" + kickReason +"` has been successfully sent!"));
                                }
                        } else {
                            message.react("❌");
                            message.channel.send(new Discord.MessageEmbed()
                            .setColor('#FF0000')
                            .setTitle("Error")
                            .setDescription("You are missing the kick members permission which is required to perform this command."));
                        }
                    } else {
                        message.react("❌");
                        message.channel.send(new Discord.MessageEmbed()
                        .setColor('#FF0000')
                        .setTitle('Error')
                        .setDescription("Invalid command usage! \n Command syntax: \n `$gkick <member>`"));
                    }
                } else if (pMessage[0].toLowerCase() == "$ginvite") {
                    if (message.member.hasPermission('KICK_MEMBERS')) {
                        if (pMessage.length == 2) {
                            MinecraftBot.chat("/g invite " + pMessage[1]);
                            message.react("✅");
                            message.channel.send(new Discord.MessageEmbed()
                            .setColor('#00FF00')
                            .setTitle("Success")
                            .setDescription("Successfully sent command to invite member `" + pMessage[1] + "` to guild!"));
                        } else {
                            message.react("❌");
                            message.channel.send(new Discord.MessageEmbed()
                            .setColor('#FF0000')
                            .setTitle('Error')
                            .setDescription("Invalid command usage! \n Command syntax: \n `$ginvite <member>`"));
                        }
                    } else {
                        message.react("❌");
                        message.channel.send(new Discord.MessageEmbed()
                        .setColor('#FF0000')
                        .setTitle("Error")
                        .setDescription("You are missing the kick members permission which is required to perform this command."));
                    }
                } else if (pMessage[0].toLowerCase() == "$help") {
                    message.react("✅");
                    if (message.member.hasPermission('KICK_MEMBERS')) {
                        message.channel.send(new Discord.MessageEmbed()
                        .setColor('#00FF00')
                        .setTitle("Help")
                        .setDescription("`$gkick <member>` - Kicks specified member from in-game guild. \n **Requires:** \n Bot kick permission in in-game guild \n Member kick members permission \n `$ginvite <member>` - Invites specified member to in-game guild. \n **Requires:** \n Bot invite member permission \n Member kick members permission"));

                    } else {
                        message.channel.send(new Discord.MessageEmbed()
                        .setColor('#00FF00')
                        .setTitle("Help")
                        .setDescription("This bot does not have any commands. However, you can send messages to the in-game guild through <#" + BotConfig.messageLoggingChannel + ">."));
                    }
                }
            }
        });
    });
}

onStart();