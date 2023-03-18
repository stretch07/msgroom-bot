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
}