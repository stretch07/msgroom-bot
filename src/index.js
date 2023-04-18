import { io } from "socket.io-client"
import MsgroomSocket from "./types.js"

export class CommandSet {
    constructor(prefix) {
        this.prefix = prefix
    }
    registerCommand(name, exec) {
        return new Command(name, exec)
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
    }
    /**
     * 
     * @param {string} nick Nickname of the bot to initially connect
     * @param {URL} url URL of the bot to connect to. Leave blank for default Windows 96 msgroom
     */
    connect(nick, url = new URL("wss://windows96.net:4096")) {
        this.SOCKET = io(url.href)
        this.SOCKET.on("message", data => {
            // we will handle CommandSet detection here
            data
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
    changeNick(nick = "nick") {
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
        return new CommandSet(prefix)
    }
}
