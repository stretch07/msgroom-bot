import { io } from "socket.io-client"

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
    constructor() {
    }
    /**
     * 
     * @param {string} nick Nickname of the bot to initially connect
     * @param {URL} url URL of the bot to connect to. Leave blank for default Windows 96 msgroom
     */
    connect(nick, url = new URL("wss://windows96.net:4096")) {
        this.SOCKET = new io(url.href)
        return new Promise((resolve, reject) => {
            this.SOCKET.emit("auth", { user: nick })
            this.SOCKET.on("auth-complete", userId => {
                this.useId = userId
                resolve(this)
            })
            this.SOCKET.on("auth-error", e => {
                reject(e)
            })
        })
    }
    send(msg = "") {
        this.SOCKET.emit("message", {
            type: "text",
            value: msg
        })
        return this
    }
    changeNick(nick = "nick") {
        this.SOCKET.emit("change-user", nick)
        return this
    }
    waitUntil(event) {
        return new Promise((resolve) => {
            this.SOCKET.on(event, () => {
                resolve()
            })
        })
    }
    registerCommand(name, exec) {
        return new Command(name, exec)
    }
}