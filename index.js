import { io } from "socket.io-client"
export default class {
    constructor(){
    }
    connect(url = "wss://windows96.net:4096"){
        this.SOCKET = new io(url)
        return new Promise((resolve, reject) => {
            this.SOCKET.on("open", () => {
                this.SOCKET.on("auth-complete", userId => {
                    this.useId = userId
                    resolve(this)
                })
            })
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
}