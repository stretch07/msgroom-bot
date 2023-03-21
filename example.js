import msgroomBot from "./index.js";
const bot = new msgroomBot

await bot.connect("sup")
bot.send("Example bot has connected!")
console.log("done")