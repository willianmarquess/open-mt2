# Open Metin2 - Server Emulator

![GitHub repo size](https://img.shields.io/github/repo-size/willianmarquess/mt2-server-javascript?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/willianmarquess/mt2-server-javascript?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/willianmarquess/mt2-server-javascript?style=for-the-badge)

Metin2 JS is an open source implementation of MMORPG Metin2 server using Nodejs with Typescript language.

This project will be developed for fun and study only.

Metin2 are copyrighted by [Webzen](http://webzen.com/ "Webzen").

# Features roadmap

| Feature          | Todo | Doing | Done |
|------------------|------|-------|------|
| Handshake |      |       | ✅    |
| Server Status |      |       | ✅    |
| Login |      |       | ✅    |
| Logout    |      |       | ✅    |
| Return to Select    | X    |       |      |
| Delete Character    | X    |       |      |
| Protocol Encryption   | X    |       |      |
| Create character  |      |       | ✅    |
| Enter Game    |      |       | ✅   |
| Character Movement    |      |       | ✅    |
| Load Character Animation Data    |      |       | ✅    |
| Load Area Data    |      |       | ✅    |
| Load Mob Data    |      |       | ✅    |
| Load NPC Data    |      |       | ✅    |
| Load item Data    |      |       | ✅    |
| Spawn Mob    |      |       |  ✅    |
| Spawn Mob From File    |      |       |  ✅    |
| Mob Behavior System    |      | X     |      |
| Spawn NPC    |      |       |  ✅   |
| NPC Behavior System    | X    |       |      |
| NPC Shop System    | X    |       |      |
| Spawn Item    |      |       |  ✅   |
| Equip Item    |      |       |   ✅  |
| Attributes Item System    | X    |       |      |
| Internal Chat    |      |       | ✅    |
| Command System    |      | X     |      |
| GM System    |      | X     |      |
| Character Exp System    |      |       | ✅    |
| Character Stat System    |      |       | ✅    |
| Character Health System    |      | X     |      |
| Character Mana System    |      | X     |      |
| Character Attack System(physic, magic, melee, range)    | X    |       |      |
| Character Defense System(physic, magic, melee, range)    | X    |       |      |
| Character Bonus and Reduces System(physic, magic, melee, range)    | X    |       |      |
| Character Inventory    |      |       | ✅    |
| Character Regen System    |      |       | ✅    |
| Character Duel System   | X    |       |      |
| Drop System   | X    |       |      |
| Affect System   | X    |       |      |
| Quest System   | X    |       |      |
| Skills System   | X    |       |      |
| Chat System   | X    |       |      |
| Level System   |      |       | ✅    |
| Graceful shutdown   |      |       | ✅    |
| Grafana Monitoring   | X   |       |      |
| Game Api(for websites etc)   | X   |       |      |

## Getting Started

- Follow this [**guide**](docs/guide.md)

## Documentation

- See the packet [**documentation**](docs/packets.md) (work in progress)

## Commands

In this implementation we are using custom commands, described bellow:

**(for now, any player can execute any command)**

- **/help**
    - Description: This command shows all the commands and the description of each command as well as an example.
    - Example: /help
- **/exp**
    - Description: add exp to other player or to yourself.
    - Example: /exp <number> <targetName>
- **/gold**
    - Description: add gold to other player or to yourself.
    - Example: /gold <number> <targetName>
- **/goto**
    - Description: teleports you to a <area>, <player> or <location:x,y>.
    - Example: /goto <area, player, location> <areaName, targetName, <x, y>>
- **/invoke**
    - Description: invoke a mob with <vnum> and you can pass the quantity.
    - Example: /invoke <vnum> <quantity>
- **/item**
    - Description: create an item with <vnum> and you can pass the quantity.
    - Example: /item <vnum> <quantity>
- **/list**
    - Description: list resources <areas, players>.
    - Example: /list <areas, players>
- **/lvl**
    - Description: set level to other player or to yourself.
    - Example: /lvl <number> <targetName>
- **/stat**
    - Description: add points to a point status.
    - Example: /stat <ht, st, dx, it> <number>



## Auth Flow
The image bellow show how the client interacts with auth server.
![](https://github.com/willianmarquess/mt2-server-javascript/blob/master/docs/images/mt2-auth-server.drawio.png)

## Game Flow (work in progress)
The image bellow show how the client interacts with game server.
![](https://github.com/willianmarquess/mt2-server-javascript/blob/master/docs/images/mt2-game-server.drawio.png)

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the [LICENSE](LICENSE) file for details.

## References

- [Mt2 emulator in C# (Quantum-core-X)](https://github.com/MeikelLP/quantum-core-x)
- [RuneScape emulator in JS (RUNE JS)](https://github.com/runejs/server)

