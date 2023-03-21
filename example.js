import msgroomBot from "./index.js";
const bot = new msgroomBot

await bot.connect("msgroom-bot")
await bot.send("Hello! This is msgroom-bot made by its-pablo. If you are seeing this, everything is working properly. Try not to run this file many times because staff doesn't like spam.")
bot.send("Example bot has connected!")
console.log("done")