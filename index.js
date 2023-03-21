import { io } from "socket.io-client"

export class Command {
    constructor(name, exec){
        this.name = name
        this._exec = exec
    }
    exec(...params){
        this._exec(...params)
    }
}
export default class {
    constructor(){
    }
    connect(nick, url = process.env.URL || "wss://windows96.net:4096"){
        this.SOCKET = new io(url)
        return new Promise((resolve, reject) => {
            //this.SOCKET.on("open", () => {
                this.SOCKET.emit("auth", {user: nick})
                this.SOCKET.on("auth-complete", userId => {
                    this.useId = userId
                    resolve(this)
                })
                this.SOCKET.on("auth-error", e => {
                    console.error(e.reason)
                    reject(e)
                })
            //})
        })
    }
    send(msg = ""){
        this.SOCKET.emit("message", {
            type: "text",
            value: msg
        })
        return this
    }
    changeNick(nick = "nick"){
        this.SOCKET.emit("change-user", nick)
        return this
    }
    waitUntil(event){
        return new Promise((resolve) => {
            this.SOCKET.on(event, () => {
                resolve()
            })
        })
    }
    registerCommand(name, exec){
        return new Command(name, exec)
    }
}