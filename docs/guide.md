## Requirements

- **TMP4 client** (40k client)
- **Node.js** (version 20 or higher)
- **Docker**

## Setup Client

Open serverinfo.py file and update the variables:

```python
SERVER_NAME			= "Open MT2 Server"
SERVER_IP			= "localhost"
CH1_NAME			= "CH1"
PORT_1				= 13001
PORT_AUTH			= 11002
PORT_MARK			= 13001
```

ps: If you changed the ports in the .env, put the relative values ​​here

## Run

- Install dependencies
```bash
npm run install
```
- Setup .env file (you can use .env.example as example)
- Execute this command on terminal:
```bash
npm run docker:dep
```
- Execute migration command:
```bash
npm run migrate
```
- Run the auth server
```bash
npm run dev:auth
```
- Run the game server
```bash
npm run dev:game
```
- Open mt2 client and use these values for login and password:
```bash
login: admin
password: admin
```