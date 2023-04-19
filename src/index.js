import { io } from "socket.io-client"
import MsgroomSocket from "./types.js"

export class CommandSet {
    constructor(prefix) {
        this.prefix = prefix
        this.commands = []
    }
    registerCommand(name, exec) {
        const command = new Command(name, exec)
        this.commands.push(command)
        return command
    }
    execCommand(name, ...params) {
        const command = this.commands.find(command => command.name === name )
        this.commands[this.commands.indexOf(command)].exec(...params)
    }
}
export class Command {
    constructor(name, exec) {
        this.name = name
        this.exec = exec
    }
}
export default class {
    /**
     * @type {MsgroomSocket}
     */
    SOCKET
    
    constructor() {
        /** @type {CommandSet[]} */
        this.commandSets = []
        /** @type {import("./types.js").User[]} */
        this.users = []
    }
    /**
     * Connects to msgroom instance.
     * @param {string} nick Nickname of the bot to initially connect
     * @param {string | undefined} apikey The apikey for your bot, you can request one from ctrlz. Using an apikey will result in your bot getting a `bot` flag.
     * @param {URL} url URL of the bot to connect to. Leave blank for default Windows 96 msgroom
     */
    connect(nick, apikey, url = new URL("wss://windows96.net:4096")) {
        this.SOCKET = io(url.href)
        this.SOCKET.on("message", async (message) => {
            const matchingCommandSet = this.commandSets.find(comset => {
                if (message.content.startsWith(comset.prefix)) {
                    return comset
                }
            })
            if (!matchingCommandSet) return

            //thanks for the command parser, chatgpt
            const input = message.content
            const prefix = matchingCommandSet.prefix
            const regex = new RegExp(`^${prefix}([a-z]+)\\s(.*)$`, "i");
            const match = input.match(regex);

            if (!match) return this.send("Syntax error ocurred when parsing command")

            const command = match[1];
            const args = match[2].split(" ");
            matchingCommandSet.execCommand(command, ...args)
        })
        this.SOCKET.on("online", users => {
            this.users = users
        })
        this.SOCKET.on("user-join", user => {
            this.users.push(user)
        })
        this.SOCKET.on("user-leave", user => {
            //we find the user that left, get its index, and delete the value.
            this.users.splice(this.users.indexOf(this.users.find(founduser => founduser.id === user.id)), 1)
        })
        return new Promise((resolve, reject) => {
            this.SOCKET.on("auth-complete", userId => {
                this.userId = userId
                resolve(this)
            })
            this.SOCKET.on("auth-error", e => {
                reject(e)
            })
            if (apikey) {
                this.SOCKET.emit("auth", { user: nick, apikey: apikey})
            } else {
                this.SOCKET.emit("auth", {user: nick})
            }
        })
    }
    /**
     * Sends a message. Supports some markdown.
     * @param {string} msg 
     * @returns {this}
     */
    send(msg = "") {
        try {
            this.SOCKET.emit("message", {
                type: "text",
                content: msg
            })
        } catch (e) {
            throw new Error(e)
        }
        return this
    }
    /**
     * Changes the bot nickname.
     * @param {string} nick 
     * @returns {this}
     */
    changeNick(nick = "nick") {
        this.SOCKET.emit("change-user", nick)
        return this
    }
    /**
     * Wait until a specific event fires
     * @param {string} event The event being listened to
     * @returns {any} Returns with the content of the event
     */
    waitUntil(event) {
        return new Promise((resolve) => {
            this.SOCKET.once(event, e => {
                resolve(e)
            })
        })
    }
    /**
     * Disconnects. Call this.connect to reconnect.
     * @returns {this}
     */
    disconnect() {
        this.SOCKET.disconnect()
        return this
    }
    /**
     * Executes an admin action. You must be staff for this to work.
     * @param {string[]} args We currently have no idea what this could be, apart from what the type must be according to the code of the official msgroom client.
     * @returns {this}
     */
    admin(args) {
        this.SOCKET.emit("admin-action", { args })
        return this
    }
    /**
     * A CommandSet is a collection of commands under one prefix. Most bots only need one CommandSet.
     * @param {string} prefix prefix for the CommandSet
     */
    registerCommandSet(prefix) {
        const thing = new CommandSet(prefix)
        this.commandSets.push(thing)
        return thing
    }
}
