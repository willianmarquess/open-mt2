# Metin2 JS - Server Emulator

![GitHub repo size](https://img.shields.io/github/repo-size/willianmarquess/mt2-server-javascript?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/willianmarquess/mt2-server-javascript?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/willianmarquess/mt2-server-javascript?style=for-the-badge)

Metin2 JS is an open source implementation of MMORPG Metin2 server using Nodejs with Javascript language.

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
| Load NPC Data    | X    |       |      |
| Load item Data    | X    |       |      |
| Spawn Mob    |      |       |  ✅    |
| Spawn Mob From File    |  X   |       |       |
| Mob Behavior System    | X    |       |      |
| Spawn NPC    | X    |       |      |
| NPC Behavior System    | X    |       |      |
| NPC Shop System    | X    |       |      |
| Spawn Item    | X    |       |      |
| Equip Item    | X    |       |      |
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
| Character Inventory    | X    |       |      |
| Character Regen System    | X    |       |      |
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

## Prerequisites

Before you start, make sure you have the following tools installed:

- **Node.js** (version 20 or higher)
- **Docker**
- **40k client**

## Running the Project

You can choose to run the project using Docker or locally.

### Using Docker

To run the project with Docker, use the commands below:

1. To run everything with Docker:
   ```bash
   npm run docker:all

### Run locally

1. Install dependencies
    ```bash
    npm run install
2. Setup .env file (you can use .env.example as example)
3. To run only the dependencies with Docker
    ```bash
    npm run docker:dep
4. Run the auth server
    ```bash
    npm run dev:auth
5. Run the game server
    ```bash
    npm run dev:game

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

