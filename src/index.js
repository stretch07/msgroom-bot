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
        //console.log()
    }
}
export class Command {
    constructor(name, exec) {
        this.name = name
        this._exec = exec
    }
    exec(...params) {
        this._exec(...params)
    }
}
export default class {
    /**
     * @type {MsgroomSocket}
     */
    SOCKET

    constructor() {
        this.commandSets = []
    }
    /**
     * 
     * @param {string} nick Nickname of the bot to initially connect
     * @param {URL} url URL of the bot to connect to. Leave blank for default Windows 96 msgroom
     */
    connect(nick, url = new URL("wss://windows96.net:4096")) {
        this.SOCKET = io(url.href)
        this.SOCKET.on("message", async (message) => {
            const matchingCommandSet = this.commandSets.find(comset => {
                if (message.content.startsWith(comset.prefix)) {
                    return comset
                }
            })
            if (!matchingCommandSet) {
                return
            } else {
                //thanks for the command parser, chatgpt
                const input = message.content
                const prefix = matchingCommandSet.prefix
                const regex = new RegExp(`^${prefix}([a-z]+)\\s(.*)$`, "i");
                const match = input.match(regex);

                if (match) {
                    const command = match[1];
                    const args = match[2].split(" ");
                    matchingCommandSet.execCommand(command, ...args)
                } else {
                    await this.send("Syntax error ocurred when parsing command")
                }
            }
        })
        return new Promise((resolve, reject) => {
            this.SOCKET.on("auth-complete", userId => {
                this.userId = userId
                resolve(this)
            })
            this.SOCKET.on("auth-error", e => {
                reject(e)
            })
            this.SOCKET.emit("auth", { user: nick })
        })
    }
    /**
     * 
     * @param {string} msg 
     * @returns {this}
     */
    async send(msg = "") {
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
    async changeNick(nick = "nick") {
        this.SOCKET.emit("change-user", nick)
        return this
    }
    waitUntil(event) {
        return new Promise((resolve) => {
            this.SOCKET.on(event, e => {
                resolve(e)
            })
        })
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
