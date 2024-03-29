//@ts-check
import { io } from "socket.io-client"
import he from "he"
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
     * @param {(user: import("./types.js").User, ...params: string[]) => void} exec This function will be called when the command is ran.
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
    execCommand(name, user, ...params) {
        const command = this.commands.find( command => command.name === name )
        if (command) command.exec(user, ...params)
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
     * @type {(user: import("./types.js").User, ...args: string[]) => void}
     */
    exec

    /**
     * @param {string} name The name of the command.
     * @param {(user: import("./types.js").User, ...args: string[]) => void} exec This function will be called when the command is ran.
     */
    constructor(name, exec) {
        this.name = name
        this.exec = exec
    }
}
export class msgroomBot {
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
            // decode HTML entities in message
            const sender = message.id
            const user = this.getUserById(sender)
            message.content = he.decode(message.content)

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
            if (!match) {
              this.send("Syntax error ocurred when parsing command")
              return
            }
            const command = match[1];
            const args = match[2]?.split(" ");
            if (matcher.execCommand) {
              matcher.execCommand(command, user, ...args)
            } else {
              matcher.exec(command, user, ...args)
            }
        })

        this.SOCKET.on("online", users => {
            this.users = users
        })

        this.SOCKET.on("user-join", user => {
            this.users.push(user)
        })

        this.SOCKET.on("user-leave", user => {
            const leftUser = this.users.find(founduser => founduser?.id === user.id)
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
    waitUntil(event) {
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
     * A CommandSet is a collection of commands under one prefix. Most bots only need one CommandSet.
     * @param {string} prefix prefix for the CommandSet
     * @returns {CommandSet} The newly created commandSet
     */
    registerCommandSet(prefix) {
        const thing = new CommandSet(prefix)
        this.commandSets.push(thing)
        return thing
    }

    /**
     * Unregisters a CommandSet.
     * @param {string} prefix prefix for the CommandSet
     * @returns {this}
     */
    unRegisterCommandSet(prefix) {
        const cmse = this.commandSets.find(possibleCmse => {
            return possibleCmse.prefix === prefix
        })
        // @ts-ignore 
        // we're assuming this isn't undefined
        const index = this.commandSets.indexOf(cmse)
        this.commands.splice(index, 1)
        return this
    }

    /**
     * Registers a new command.
     * @param {string} name The name of the command.
     * @param {(user: import("./types.js").User, ...params: string[]) => void} exec This function will be called when the command is ran.
     * @returns {Command}
     */
    registerCommand(name, exec) {
        const command = new Command(name, exec)
        this.commands.push(command)
        return command
    }

    /**
     * Unregisters a command
     * @param {string} name The name of the command.
     * @returns {this} 
     */
    unRegisterCommand(name) {
        const command = this.commands.find(possibleCommand => {
            return possibleCommand.name === name
        })
        const index = this.commands.indexOf(command)
        this.commands.splice(index, 1)
        return this
    }

    /**
     * Registers a help command.
     * @param {string} content Message to be displayed when help command is triggered
     * @returns 
     */
    registerHelp(content) {
        this.help = content
        this.registerCommand("help", () => {
            this.send(content)
        })
        return this
    }

    /**
     * Unregisters the help command.
     * @returns {this}
     */
    unRegisterHelp() {
        try {
            this.unRegisterCommand("help")
        } catch(e) {
            // Swallow error
            // Error probably caused by the help command not being registered in the first place.
        }
        return this
    }

    getUserById(id) {
        return this.users.find((user) => {
            user.id === id
        })
    }
}
