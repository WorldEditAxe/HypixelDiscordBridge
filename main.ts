/*
    Hypixel guild Discord bridge

    A rewritten version of the original codebase, designed to be much better
    and less of a pain in the butt to look at.
*/

// Imports
import * as Minecraft from "mineflayer";
import * as Discord from "discord.js";
import * as comp from "./utils.js"
import * as l from "./logger"
import { ChatMessage } from "mineflayer";

// Internal variables (DO NOT EDIT)
const client = new Discord.Client()
let bot: Minecraft.Bot
const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Process variables
const token = process.env.TOKEN
const loginEmail = process.env.USERNAME
const loginPassword = process.env.PASSWORD
const loggingChannel = process.env.LOGGING_CHANNEL
let isMojang = process.env.authType == "mojang" ? true : false

// Functions
async function load() {
    bot = null

    bot = Minecraft.createBot({
        username: loginEmail,
        password: loginPassword,
        host: "hypixel.net",
        version: "1.8",
        auth: isMojang ? "mojang" : "microsoft" 
    })

    // You are required to manually register events yourself
}

// Parsing function (this is 9/10 broken)
