import MsgroomBot from "./index.js";
const bot = new MsgroomBot

try {
    bot.connect("msgroom-bot")
} catch(e) {
    process.exit(1)
}
console.log("Connected")

bot.send("Hello! This is msgroom-bot made by its-pablo. If you are seeing this, everything is working properly. Try not to run this file many times because staff doesn't like spam.")
console.log("Default message sent")

const cmse = bot.registerCommandSet("ok!")
cmse.registerCommand("say", async (...said) => {
    //users can say multiple things separated by spaces, so lets take all the arguments
    //and join them with spaces.
    bot.send("You said: " + said.join(" "))
})