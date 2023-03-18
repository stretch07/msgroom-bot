import msgroomBot from "./index.js";
const bot = new msgroomBot

await bot.connect()
bot.send("Example bot has connected!")