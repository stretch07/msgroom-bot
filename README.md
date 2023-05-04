# msgroom-bot
A Javascript library to create a Windows96 MsgRoom bot using Node.js.  
*Please note that this is NOT the official API for creating MsgRoom bots. The official API is not yet publicly released.*  
## Features
### Native command support
Support for command prefixes. Commands trigger a function that the bot handles.
### Automatic entity decoding
Your bot receives the decoded HTML entities for conveniance.
### Native image support
Coming soon - native image support for your bot.

## Installation
Run `npm i msgroom-bot` and import `msgroom-bot` into your library. That's it!

## Usage
View [installation](#installation) for help on the basics of this library.  
Some quick tips and reminders:
* Do not use strict equality operators when checking if arguments are primitive values that aren't strings. Your code will fail if you do this. Arguments will always be strings.

## Contributing
Feel free to open forks and pull requests. Below are some notable contributors.
### Lead Developers
* [its-pablo](https://github.com/its-pablo)
### Maintainers
* [Kelbaz](https://github.com/kelbazz)
### General Contributors
* [NanderTGA](https://github.com/NanderTGA)
