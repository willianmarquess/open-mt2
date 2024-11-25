# Packet Documentation

### ChannelPacket

**Type:** Out

**Header:** 0x79

**Size:** 2 bytes

**Description:** Used to send the number of channel.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| channel | `byte` | 1 | Channel number |

---

### CharacterDetailsPacket

**Type:** Out

**Header:** 0x71

**Size:** 46 bytes

**Description:** Represents the detail information about the character.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| vid | `int` | 4 | Player identification in game |
| playerClass | `short` | 2 | Number which indicates the player class |
| playerName | `string` | 25 | Name of player (ascii) |
| positionX | `int` | 4 | Position X of player in game |
| positionY | `int` | 4 | Position Y of player in game |
| positionZ | `int` | 4 | Position Z of player in game |
| empireId | `byte` | 1 | Id of empire |
| skillGroup | `byte` | 1 | Id of skill group |

---

### CharacterInfoPacket

**Type:** Out

**Header:** 0x88

**Size:** 54 bytes

**Description:** Represents the basic information about the character.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| vid | `int` | 4 | Player identification in game |
| playerName | `string` | 25 | Name of player (ascii) |
| parts | `short[4]` | 8 | Equipment parts |
| empireId | `byte` | 1 | Id of empire |
| guildId | `int` | 4 | Id of guild |
| level | `int` | 4 | Player level |
| rankPoints | `short` | 2 | Rank points |
| pkMode | `byte` | 1 | If pk is enable |
| mountId | `int` | 4 | Id of mount |

---

### CharacterMoveOutPacket

**Type:** Out

**Header:** 0x03

**Size:** 25 bytes

**Description:** Is used to replicate the movement of a character (player, mobs) to other nearby players.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| movementType | `byte` | 1 | Number which indicates the movement type (See in MovementTypeEnum) |
| arg | `byte` | 1 | unknown |
| rotation | `byte` | 1 | Indicate the rotation of char in degrees |
| vid | `int` | 4 | Character identification in game |
| positionX | `int` | 4 | Position X of character in game |
| positionY | `int` | 4 | Position Y of character in game |
| time | `int` | 4 | unknown |
| duration | `int` | 4 | Number which indicates the duration of movement |
| unknown | `byte` | 1 | filled with 0 |

---

### CharacterPointChangePacket

**Type:** Out

**Header:** 0x11

**Size:** 22 bytes

**Description:** Is used to send and update of a point (attribute) to the client. See all points in PointsEnum.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| vid | `int` | 4 | Character identification in game. |
| type | `byte` | 1 | Number which indicates the point type (See in PointsEnum). |
| amount | `long` | 8 | Number which indicates the quantity of that point (default is 0). |
| value | `long` | 8 | Number which indicates the value of that point. |

---

### CharacterPointsPacket

**Type:** Out

**Header:** 0x10

**Size:** 1021 bytes

**Description:** Is used to send update of all the points (attributes) of a character to the client. See all points in PointsEnum.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| points | `int[4]` | 4 | I this array we send the value of each point. |

---

