import MsgroomBot from "./index.js";
const bot = new MsgroomBot

try {
    await bot.connect("msgroom-bot")
} catch(e) {
    process.exit(1, e)
}
console.log("Connected")

await bot.send("Hello! This is msgroom-bot made by its-pablo. If you are seeing this, everything is working properly. Try not to run this file many times because staff doesn't like spam.")
console.log("Default message sent")