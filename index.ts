import { DrunkenBot } from "./base/DrunkenBot";

const bot = new DrunkenBot(process.env.TOKEN);
bot.startListening();