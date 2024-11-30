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
| playerClass | `short` | 2 | Number which indicates the player class (See the number of each class in JobEnum) |
| playerName | `string` | 25 | Name of player (ascii) |
| positionX | `int` | 4 | Position X of player in game |
| positionY | `int` | 4 | Position Y of player in game |
| positionZ | `int` | 4 | Position Z of player in game |
| empireId | `byte` | 1 | Id of empire |
| skillGroup | `byte` | 1 | Id of skill group |

---

### CharacterDiedPacket

**Type:** Out

**Header:** 0x0e

**Size:** 5 bytes

**Description:** Used to notify the client when some entity has died.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| virtualId | `number` | 4 | virtualId of the dead entity |

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

**Description:** Is used to send and update of a point (attribute) to the client (used to notify all nearby players of an update of a character). See all points in PointsEnum.

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
| points | `int[255]` | 4 | In this array we send the value of each point. |

---

### CharactersInfoPacket

**Type:** Out

**Header:** 0x20

**Size:** 329 bytes

**Description:** Is used to send the characters list to client select screen (we need to repeat the characterInfo 4x, guildIds 4x, guildNames 4x).

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| id | `int` | 4 | Character identification in server. |
| name | `string` | 25 | Name of character (ascii). |
| playerClass | `byte` | 1 | Number which indicates the player class (See the number of each class in JobEnum). |
| level | `byte` | 1 | Number which indicates the player level. |
| playtime | `int` | 4 | Time the player played with this character in minutes. |
| st | `byte` | 1 | Number which indicates the st point quantity (strength). |
| ht | `byte` | 1 | Number which indicates the ht point quantity (vitality). |
| dx | `byte` | 1 | Number which indicates the dx point quantity (dexterity). |
| iq | `byte` | 1 | Number which indicates the iq point quantity (intelligence). |
| bodyPart | `short` | 2 | Number which indicates the id of the body part. |
| nameChange | `byte` | 1 | Number which indicates if that character need to change name (0 or 1). |
| hairPart | `short` | 2 | Number which indicates the id of the hair part. |
| unknown | `int` | 4 | filled with 0. |
| positionX | `int` | 4 | Position X of player in game |
| positionY | `int` | 4 | Position Y of player in game |
| Ip | `int` | 4 | Ip Address to server where the map the player is on is managed (for now we have only one server, but we can add remote maps to increase the quantity of players of our server). |
| Port | `int` | 4 | Port to server where the map the player is on is managed (for now we have only one server, but we can add remote maps to increase the quantity of players of our server). |
| skillGroup | `byte` | 1 | Number which indicates the skill group of character (to be implemented). |
| guildId | `int` | 4 | The guild id of current character |
| guildName | `string` | 13 | The guild name of current character (ascii). |
| unknown | `int` | 4 | filled with 0. |
| unknown | `int` | 4 | filled with 0. |

---

### DamagePacket

**Type:** Out

**Header:** 0x87

**Size:** 10 bytes

**Description:** Used to send the damage to client.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| virtualId | `number` | 4 | virtualId of the affected entity |
| damageFlags | `byte` | 1 | indicates the flags of damage like: critical, pierced etc //TODO |
| damage | `number` | 4 | the damage number |

---

### TargetUpdatedPacket

**Type:** Out

**Header:** 0x3f

**Size:** 6 bytes

**Description:** Used to send the target to client.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| virtualId | `number` | 4 | virtualId of the target entity |
| healthPercentage | `byte` | 1 | indicates the percent of target entity health |

---

