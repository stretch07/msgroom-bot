# msgroom-bot
A Javascript library to create a Windows96 MsgRoom bot using Node.js.  
*Please note that this is NOT the official API for creating MsgRoom bots. The official API is not yet publicly released.*  
*Note that the npm version of this package has a CWE-912 vuln*
## Features
### Native command support
Support for command prefixes. Commands trigger a function that the bot handles.
### Native image support
Coming soon - native image support for your bot.

## Installation
Run `npm i msgroom-bot` and import `msgroom-bot` into your library. That's it!

## Usage
View [installation](#installation) for help on the basics of this library.  
Some quick tips and reminders:
* Do not use strict equality operators when checking if arguments are primitive values that aren't strings. Your code will fail if you do this. Arguments will always be strings.

## FAQ
Q. I'm getting an argument from a user, but it's HTML-encoded! (\&amp; instead of &, etc.)
A. Use the [`he`](https://www.npmjs.com/package/he) package or similar to encode and decode special HTML characters. Functionality for this is not built in.

## Contributing
Feel free to open forks and pull requests. Below are some notable contributors.
### Lead Developers
* [its-pablo](https://github.com/its-pablo)
### Maintainers
* [Kelbaz](https://github.com/kelbazz)
### General Contributors
* [NanderTGA](https://github.com/NanderTGA)
