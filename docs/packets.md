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

