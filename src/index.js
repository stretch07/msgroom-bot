//@ts-check
import { io } from "socket.io-client"
import { AuthError } from "./errors.js"

export class CommandSet {
    /** @type {string} */
    prefix
    /** @type {Command[]} */
    commands

    /**
     * @param {string} prefix The prefix for your command.
     */
    constructor(prefix) {
        this.prefix = prefix
        this.commands = []
    }

    /**
     * Registers a new command.
     * @param {string} name The name of the command.
     * @param {(...params: string[]) => void} exec This function will be called when the command is ran.
     * @returns {Command}
     */
    registerCommand(name, exec) {
        const command = new Command(name, exec)
        this.commands.push(command)
        return command
    }

    /**
     * Executes a command.
     * @param {string} name 
     * @param  {...string} params 
     */
    execCommand(name, ...params) {
        const command = this.commands.find( command => command.name === name )
        if (command) command.exec(...params)
    }
}
export class Command {
    /**
     * The name of the command.
     * @type {string}
     */
    name
    /**
     * This function will be called when the command is ran.
     * @type {(...params: string[]) => void}
     */
    exec

    /**
     * @param {string} name The name of the command.
     * @param {(...params: string[]) => void} exec This function will be called when the command is ran.
     */
    constructor(name, exec) {
        this.name = name
        this.exec = exec
    }
}
export default class {
    /** @type {import("./types.js").default} */
    SOCKET
    /** @type {CommandSet[]} */
    commandSets
    /** @type {import("./types.js").User[]} */
    users
    
    constructor() {
        this.commandSets = []
        this.commands = []
        this.users = []
    }
    /**
     * Connects to msgroom instance.
     * @param {string} nick Nickname of the bot to initially connect
     * @param {string | undefined} apikey The apikey for your bot, you can request one from ctrlz. Using an apikey will result in your bot getting a `bot` flag.
     * @param {URL} url URL of the bot to connect to. Leave blank for default Windows 96 msgroom
     * @returns {Promise<void>}
     * @throws {AuthError} When the event `auth-error` is received
     */
    connect(nick, apikey, url = new URL("wss://windows96.net:4096")) {
        this.SOCKET = io(url.href)

        //#region define event listeners

        this.SOCKET.on("message", (message) => {
            const matchingCommandSet = this.commandSets.find(commandSet => message.content.startsWith(commandSet.prefix))
            const matchingCommand = this.commands.find(command => message.content.startsWith(command.name))
            const matcher = (matchingCommandSet || matchingCommand)
            if (!matcher) return
            const matcherIdentifier = matcher.prefix || matcher.name
            
            //thanks for the command parser, chatgpt
            const regex = new RegExp(`^${matcherIdentifier}([a-z]+)\\s(.*)$`, "i");
            let match = message.content.match(regex);
            if (!match) {
              //lets try for command instead of commandset
              match = message.content.match(new RegExp(`^${matcherIdentifier}(\\S+)\\s?(.*)$`, "i"))
            }
            console.log(match)
            if (!match) {
              this.send("Syntax error ocurred when parsing command")
              return
            }
            const args = match[2].split(" ");
            if (matcher.execCommand) {
              matcher.execCommand(command, ...args)
            } else {
              matcher.exec(command, ...args)
            }
        })

        this.SOCKET.on("online", users => {
            this.users = users
        })

        this.SOCKET.on("user-join", user => {
            this.users.push(user)
        })

        this.SOCKET.on("user-leave", user => {
            const leftUser = this.users.find(founduser => founduser.id === user.id)
            if (!leftUser) return

            const indexOfLeftUser = this.users.indexOf(leftUser)
            delete this.users[indexOfLeftUser]
        })

        //#endregion

        return new Promise((resolve, reject) => {
            this.SOCKET.on("auth-complete", userId => {
                this.userId = userId
                resolve()
            })
            this.SOCKET.on("auth-error", e => {
                reject(new AuthError(e.reason))
            })

            this.SOCKET.emit("auth", { user: nick, apikey})
        })
    }
    /**
     * Sends a message. Supports some markdown.
     * @param {string} msg 
     * @returns {this}
     */
    send(msg = "") {
        this.SOCKET.emit("message", {
            type: "text",
            content: msg
        })
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
     * Wait until a specific event fires.
     * @param {import("./types.js").ServerToClientEventNames} event The event being listened to.
     * @returns {Promise<any>} The content of the event.
     */
    waitUntil(event) { // I can't type the return value. I might be able to do such a thing using typescript.
        return new Promise( resolve => {
            this.SOCKET.once(event, e => {
                resolve(e)
            })
        })
    }

    /**
     * Disconnects. Call {@link connect} to reconnect.
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
     * @returns {CommandSet} The newly created commandSet
     */
    registerCommandSet(prefix) {
        const thing = new CommandSet(prefix)
        this.commandSets.push(thing)
        return thing
    }
    registerCommand(name, exec) {
        const command = new Command(name, exec)
        this.commands.push(command)
        return command
    }
}
