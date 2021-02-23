import { DrunkenBot } from "./base/drunkenbot";

const bot = new DrunkenBot(process.env.TOKEN); /* PROD */
bot.startListening();