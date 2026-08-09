# Packet Documentation

### AffectAddPacket

**Type:** Out

**Header:** 0x7E

**Size:** 22 bytes

**Description:** Used to send an effect.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| type | `int` | 4 | Apply type number. See in AffectTypeEnum |
| apply | `byte` | 1 | Describe which point is affected by this affect. See in PointEnum |
| value | `int` | 4 | The amount applied to the affected point |
| flag | `int` | 4 | The bit flag of applies. See in AffectBitsTypeEnum |
| duration | `int` | 4 | The duration in seconds of an affect |
| manaCost | `int` | 4 | The mana cost of an affect |

---

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

**Size:** 17 bytes

**Description:** Is used to send an update of a single point (attribute) of a character to the client. The client plays the level-up effect when it receives a POINT_LEVEL change for any vid. See all points in PointsEnum.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| padding | `byte[3]` | 3 | The client declares the header as a 4-byte int, so 3 padding bytes follow the header byte. |
| vid | `int` | 4 | Character identification in game. |
| type | `byte` | 1 | Number which indicates the point type (See in PointsEnum). |
| amount | `int` | 4 | Signed quantity delta of that point (default is 0). |
| value | `int` | 4 | Signed new value of that point. |

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
| points | `int[255]` | 1020 | In this array we send the value of each point. |

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
| Port | `short` | 2 | Port to server where the map the player is on is managed (for now we have only one server, but we can add remote maps to increase the quantity of players of our server). |
| skillGroup | `byte` | 1 | Number which indicates the skill group of character (to be implemented). |
| guildId | `int` | 4 | The guild id of current character |
| guildName | `string` | 13 | The guild name of current character (ascii). |
| unknown | `int` | 4 | filled with 0. |
| unknown | `int` | 4 | filled with 0. |

---

### CharacterSpawnPacket

**Type:** Out

**Header:** 0x01

**Size:** 35 bytes

**Description:** Is used to spawn a character (player, mob, npc) on the client of nearby players. The affect flag is repeated 2x.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| vid | `int` | 4 | Character identification in game |
| rotation | `float` | 4 | Rotation of character in degrees |
| positionX | `int` | 4 | Position X of character in game |
| positionY | `int` | 4 | Position Y of character in game |
| positionZ | `int` | 4 | Position Z of character in game |
| entityType | `byte` | 1 | Kind of entity being spawned (See in EntityTypeEnum) |
| playerClass | `short` | 2 | Class of player, or vnum of the mob/npc |
| movementSpeed | `byte` | 1 | Movement speed of character |
| attackSpeed | `byte` | 1 | Attack speed of character |
| state | `byte` | 1 | State flag of character |
| affects | `int[2]` | 8 | Affect flags of character |

---

### CharacterUpdatePacket

**Type:** Out

**Header:** 0x13

**Size:** 35 bytes

**Description:** Is used to send the updated state of an already spawned character to nearby players. The equipment part is repeated 4x and the affect flag 2x.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| vid | `int` | 4 | Character identification in game |
| parts | `short[4]` | 8 | Equipment parts (armor, weapon, head, hair) |
| moveSpeed | `byte` | 1 | Movement speed of character |
| attackSpeed | `byte` | 1 | Attack speed of character |
| state | `byte` | 1 | State flag of character |
| affects | `int[2]` | 8 | Affect flags of character |
| guildId | `int` | 4 | Id of guild |
| rankPoints | `short` | 2 | Rank points |
| pkMode | `byte` | 1 | If pk is enable |
| mountVnum | `int` | 4 | Vnum of mount |

---

### ChatOutPacket

**Type:** Out

**Header:** 0x04

**Size:** 9 + message.length + 1 bytes

**Description:** Is used to send a chat message to the client. This is a dynamic size packet: the 9 byte head is fixed and the message field grows with the text, so the documented sizes below are for an empty message.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| size | `short` | 2 | Total size of the packet in bytes |
| messageType | `byte` | 1 | Kind of message being sent (See in ChatMessageTypeEnum) |
| vid | `int` | 4 | Character identification in game of the sender |
| empireId | `byte` | 1 | Id of empire |
| message | `string` | 1 | Null terminated ascii message, message.length + 1 bytes wide (1 when empty) |

---

### ConnectionStatePacket

**Type:** Out

**Header:** 0xfd

**Size:** 2 bytes

**Description:** Is used to tell the client which phase the connection moved to. See in ConnectionStateEnum.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| state | `byte` | 1 | New phase of the connection |

---

### CreateCharacterFailurePacket

**Type:** Out

**Header:** 0x09

**Size:** 2 bytes

**Description:** Sent when the character creation request is refused, the client shows the matching error message on the select screen.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| reason | `byte` | 1 | Number which indicates why the creation failed (See CreateCharacterFailureReasonEnum). |

---

### CreateCharacterSuccessPacket

**Type:** Out

**Header:** 0x08

**Size:** 65 bytes

**Description:** Sent when the character creation succeeds, it carries the slot plus the same character block used by the characters list (one character only, not repeated).

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| slot | `byte` | 1 | Account character slot the new character was created on (0 to 3). |
| id | `int` | 4 | Character identification in server. |
| name | `string` | 25 | Name of character (ascii). |
| playerClass | `byte` | 1 | Number which indicates the player class (See the number of each class in JobEnum). |
| level | `byte` | 1 | Number which indicates the player level. |
| playTime | `int` | 4 | Time the player played with this character in minutes. |
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
| ip | `int` | 4 | Ip address of the server which manages the map the player is on. |
| port | `short` | 2 | Port of the server which manages the map the player is on. |
| skillGroup | `byte` | 1 | Number which indicates the skill group of character (to be implemented). |

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

### DeleteCharacterFailurePacket

**Type:** Out

**Header:** 0x0b

**Size:** 1 bytes

**Description:** Sent when the character deletion is refused, header only packet (GC_PLAYER_DELETE_WRONG_SOCIAL_ID), the client shows the wrong private code message.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |

---

### DeleteCharacterSuccessPacket

**Type:** Out

**Header:** 0x0a

**Size:** 2 bytes

**Description:** Tells the client the character in the given slot was deleted so it can clear the slot on the select screen.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| slot | `byte` | 1 | Account character slot that was cleared (0 to 3). |

---

### FlyPacket

**Type:** Out

**Header:** 0x46

**Size:** 10 bytes

**Description:** Used to send fly particle from entity to another.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| type | `byte` | 1 | type of fly. See in FlyEnum. |
| fromVirtualId | `number` | 4 | wich entity the fly starts |
| toVirtualId | `number` | 4 | wich entity the fly ends |

---

### FlyTargetingPacket

**Type:** Out

**Header:** 0x47

**Size:** 17 bytes

**Description:** Draws a projectile flying from a shooter to a target. The client homes it on the target when the target is in view, otherwise it flies to the given position.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| shooterVirtualId | `number` | 4 | Entity the projectile starts from |
| targetVirtualId | `number` | 4 | Entity the projectile homes on |
| positionX | `number` | 4 | Fallback target position X |
| positionY | `number` | 4 | Fallback target position Y |

---

### GameTimePacket

**Type:** Out

**Header:** 0x6a

**Size:** 5 bytes

**Description:** Sends the current server time so the client can sync its own clock. Matches the client struct TPacketGCTime.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| time | `int` | 4 | Server time as a unix timestamp in seconds (client time_t) |

---

### InternalPongPacket

**Type:** Out

**Header:** 0xef

**Size:** 5 bytes

**Description:** Used to internal pong.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| time | `int` | 4 | The time sent by client |

---

### ItemDroppedHidePacket

**Type:** Out

**Header:** 0x1b

**Size:** 21 bytes

**Description:** Tells the client to remove a dropped item from the ground. Only the 5 bytes listed below are written by pack(); the declared size of 21 makes the buffer 16 bytes longer than the payload, and those trailing bytes are sent as zeros. The client reads 5 bytes (TPacketGCItemGroundDel).

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| virtualId | `int` | 4 | Virtual id of the ground item to remove |

---

### ItemDroppedPacket

**Type:** Out

**Header:** 0x1a

**Size:** 21 bytes

**Description:** Tells the client to spawn a dropped item on the ground at the given position.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| positionX | `int` | 4 | Position X of the item on the ground |
| positionY | `int` | 4 | Position Y of the item on the ground |
| positionZ | `int` | 4 | Position Z of the item on the ground, always 0 |
| virtualId | `int` | 4 | Virtual id assigned to the ground item |
| id | `int` | 4 | Item vnum (prototype id) used to render the item |

---

### ItemPacket

**Type:** Out

**Header:** 0x15

**Size:** 54 bytes

**Description:** Sets an item into a client window cell (inventory, equipment, ...). The bonusId/bonusValue pair is repeated 7x, one per item attribute slot.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| window | `byte` | 1 | Window the cell belongs to (See WindowTypeEnum) |
| position | `short` | 2 | Cell position inside the window |
| id | `int` | 4 | Item vnum (prototype id) |
| count | `byte` | 1 | Stack size of the item |
| flags | `int` | 4 | Item flags, currently always sent as 0 |
| antiFlags | `int` | 4 | Item anti flags, currently always sent as 0 |
| highlight | `int` | 4 | Non zero highlights the cell in the client, currently always sent as 0 |
| sockets | `int[3]` | 12 | Metin socket values, 3 slots of 4 bytes |
| bonusId | `byte` | 1 | Attribute type of the bonus slot, repeated 7x |
| bonusValue | `short` | 2 | Attribute value of the bonus slot, repeated 7x |

---

### ItemUsePacket

**Type:** Out

**Header:** 0x0b

**Size:** 4 bytes

**Description:** Sends the use of an item at a given window cell.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| window | `byte` | 1 | Window the cell belongs to (See WindowTypeEnum) |
| position | `short` | 2 | Cell position inside the window |

---

### LoginFailedPacket

**Type:** Out

**Header:** 0x07

**Size:** 10 bytes

**Description:** Sent when the credentials are refused, the status text is the key the client uses to pick the error message (See LoginStatusEnum).

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| status | `string` | 9 | Status text, null terminated and zero padded, max 8 ascii characters (ex: WRONGPWD, ALREADY). |

---

### LoginSuccessPacket

**Type:** Out

**Header:** 0x96

**Size:** 6 bytes

**Description:** Sent when the credentials are accepted, it carries the login key the client sends back on the game connection.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| key | `int` | 4 | Login key generated for this authentication, the client echoes it on the token packet. |
| result | `byte` | 1 | Number which indicates the authentication result (1 means success, 0 makes the client show a key failure). |

---

### PingPacket

**Type:** Out

**Header:** 0x2c

**Size:** 1 bytes

**Description:** Keepalive ping (GC_PING, header 44) sent periodically to every connection; the client answers with CG_PONG (header 254). Header-only packet, matches the client struct TPacketGCPing.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |

---

### QuestInfoPacket

**Type:** Out

**Header:** 0x51

**Size:** 105 bytes

**Description:** Used to send the state of a quest to the client quest window. The 6 byte head is always written, every field after the flag byte is optional and is only written when its bit is set in the flag, so the packet on the wire is between 6 and 105 bytes. The widths below are the maximum case, with every optional field present.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| size | `short` | 2 | Total size in bytes of this packet |
| id | `short` | 2 | Index of the quest this info belongs to |
| flags | `byte` | 1 | Bitmask telling which of the optional fields below follow. See QuestFlagEnum. |
| wasStarted | `byte` | 1 | Optional (ISBEGIN). 1 when the quest begins, 0 when it ends. |
| title | `string` | 31 | Optional (TITLE). Quest title (ascii). |
| clockName | `string` | 17 | Optional (CLOCK_NAME). Label of the quest clock (ascii). |
| clockValue | `int` | 4 | Optional (CLOCK_VALUE). Value shown in the quest clock. |
| counterName | `string` | 17 | Optional (COUNTER_NAME). Label of the quest counter (ascii). |
| counterValue | `int` | 4 | Optional (COUNTER_VALUE). Value shown in the quest counter. |
| iconFile | `string` | 25 | Optional (ICON_FILE). File name of the quest icon (ascii). |

---

### QuestScriptPacket

**Type:** Out

**Header:** 0x2d

**Size:** 6 + srcSize bytes

**Description:** Used to send a quest script (the text and buttons of a quest dialog) to the client. The size is dynamic: a fixed 6 byte head followed by srcSize raw script bytes, so the packet is 6 + srcSize bytes. The script is not zero terminated on the wire, the client appends the terminator itself.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| size | `short` | 2 | Total size in bytes of this packet (6 + srcSize) |
| skin | `byte` | 1 | Quest dialog skin the client should render with |
| srcSize | `short` | 2 | Length in bytes of the script that follows |
| src | `string` | 0 | Quest script source. Variable length, srcSize bytes, so no fixed width applies. |

---

### QuestTargetCreatePacket

**Type:** Out

**Header:** 0x7d

**Size:** 51 bytes

**Description:** Used to create a quest target on the client minimap and, when the target is a character, the target effect in the world. pack() writes only the 43 bytes listed below, while the buffer is declared as 51 bytes, so 8 trailing zero bytes follow the type field.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| id | `int` | 4 | Identifier of the target, reused later to update or remove it |
| targetName | `string` | 33 | Name of the target (ascii) |
| targetVirtualId | `int` | 4 | Virtual id of the entity the target is attached to |
| type | `byte` | 1 | Kind of target: 0 none, 1 location, 2 character |

---

### QuestTargetRemovePacket

**Type:** Out

**Header:** 0x7c

**Size:** 5 bytes

**Description:** Used to remove a quest target from the client minimap and drop its target effect.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| id | `int` | 4 | Identifier of the target to remove, the same one sent in QuestTargetCreatePacket |

---

### QuickSlotAddResponsePacket

**Type:** Out

**Header:** 0x1c

**Size:** 4 bytes

**Description:** Used to confirm to the client that a quick slot was filled.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| slot | `byte` | 1 | Quick slot position that was filled |
| type | `byte` | 1 | Kind of entry placed in the slot. See QuickSlotTypeEnum. |
| position | `byte` | 1 | Position of the item or skill inside its own container |

---

### QuickSlotRemoveResponsePacket

**Type:** Out

**Header:** 0x1d

**Size:** 2 bytes

**Description:** Used to confirm to the client that a quick slot was cleared.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| slot | `byte` | 1 | Quick slot position that was cleared |

---

### QuickSlotSwapResponsePacket

**Type:** Out

**Header:** 0x1e

**Size:** 3 bytes

**Description:** Used to confirm to the client that the content of two quick slots was swapped.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| slotA | `byte` | 1 | First quick slot position of the swap |
| slotB | `byte` | 1 | Second quick slot position of the swap |

---

### RemoveCharacterPacket

**Type:** Out

**Header:** 0x02

**Size:** 5 bytes

**Description:** Is used to despawn a character (player, mob, npc) from the client of nearby players.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| vid | `int` | 4 | Character identification in game |

---

### ServerStatusPacket

**Type:** Out

**Header:** 0xd2

**Size:** 9 bytes

**Description:** Answers the client channel status request; the 3 byte channel entry (port, status) repeats once per channel and the declared size of 9 only fits the default single channel.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| size | `int` | 4 | Value produced by calcSize(), 6 + 3 per channel. See notes, the client reads this as a channel count |
| port | `short` | 2 | Channel port. Repeated once per channel entry |
| status | `byte` | 1 | Channel status flag, 1 means online. Repeated once per channel entry |
| isSuccess | `byte` | 1 | Trailing success flag written after the channel entries. The client never reads it |

---

### SetItemOwnershipPacket

**Type:** Out

**Header:** 0x1f

**Size:** 30 bytes

**Description:** Marks a dropped ground item as owned by a player, so only that player may loot it while the ownership lasts. Matches the client struct TPacketGCItemOwnership.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| virtualId | `int` | 4 | Virtual id of the ground item the ownership applies to |
| ownerName | `string` | 25 | Name of the owning player (ascii, null terminated), empty clears the ownership |

---

### SetSkillGroupPacket

**Type:** Out

**Header:** 0x70

**Size:** 2 bytes

**Description:** Tells the client which skill group (skill tree branch) the character has chosen. Matches the client struct TPacketGCChangeSkillGroup.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| skillGroup | `byte` | 1 | Selected skill group, 0 means no group chosen yet |

---

### ShopEndPacket

**Type:** Out

**Header:** 0x26

**Size:** 4 bytes

**Description:** Is used to tell the client to close the shop window. Matches TPacketGCShop with subheader SHOP_SUBHEADER_GC_END (1).

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| size | `short` | 2 | Total packet size in bytes, including the header. |
| subheader | `byte` | 1 | Shop subheader, always END (1). See ShopSubHeaderGC. |

---

### ShopResultPacket

**Type:** Out

**Header:** 0x26

**Size:** 4 bytes

**Description:** Is used to send the outcome of a shop operation to the client. Matches TPacketGCShop, the subheader carries the result code.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| size | `short` | 2 | Total packet size in bytes, including the header. |
| subheader | `byte` | 1 | Result code: OK (4), NOT_ENOUGH_MONEY (5), INVENTORY_FULL (7), INVALID_POS (8), SOLD_OUT (9). See ShopSubHeaderGC. |

---

### ShopSignPacket

**Type:** Out

**Header:** 0x27

**Size:** 38 bytes

**Description:** Is used to show or hide the private shop sign above a player. An empty sign string tells the client the shop is closed. Matches SPacketGCShopSign.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| ownerVid | `int` | 4 | Virtual id of the player owning the private shop. |
| sign | `string` | 33 | Shop sign text (ascii), at most 32 chars plus a null terminator. |

---

### ShopStartPacket

**Type:** Out

**Header:** 0x26

**Size:** 1728 bytes

**Description:** Is used to open the shop window with its full item grid (we need to repeat the item block 40x, empty slots are sent zeroed). Matches TPacketGCShop + owner vid + TPacketGCShopStart.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| size | `short` | 2 | Total packet size in bytes, including the header. |
| subheader | `byte` | 1 | Shop subheader, always START (0). See ShopSubHeaderGC. |
| ownerVid | `int` | 4 | Virtual id of the shop owner (npc or player). |
| vnum | `int` | 4 | Item vnum of this shop slot, 0 when the slot is empty. |
| price | `int` | 4 | Price of the item in yang. |
| count | `byte` | 1 | Item stack count. |
| displayPos | `byte` | 1 | Slot position of the item inside the shop grid. |
| sockets | `int[3]` | 12 | Three socket values, always 0 for shop items. |
| bonuses | `bonus[7]` | 21 | Seven attribute slots, each one a {byte} id plus a {short} value, always 0 for shop items. |

---

### ShopUpdateItemPacket

**Type:** Out

**Header:** 0x26

**Size:** 48 bytes

**Description:** Is used to refresh a single slot of an already open shop window. Matches TPacketGCShop + TPacketGCShopUpdateItem.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header. |
| size | `short` | 2 | Total packet size in bytes, including the header. |
| subheader | `byte` | 1 | Shop subheader, always UPDATE_ITEM (2). See ShopSubHeaderGC. |
| pos | `byte` | 1 | Slot position being updated. |
| vnum | `int` | 4 | Item vnum of the slot, 0 when the slot became empty. |
| price | `int` | 4 | Price of the item in yang. |
| count | `byte` | 1 | Item stack count. |
| displayPos | `byte` | 1 | Slot position of the item inside the shop grid, same value as pos. |
| sockets | `int[3]` | 12 | Three socket values, always 0 for shop items. |
| bonuses | `bonus[7]` | 21 | Seven attribute slots, each one a {byte} id plus a {short} value, always 0 for shop items. |

---

### SkillLevelPacket

**Type:** Out

**Header:** 0x4c

**Size:** 1531 bytes

**Description:** Sends the level of every skill slot to the client; the 6 byte skill entry (masterType, level, nextReadTime) repeats SKILL_MAX_NUM = 255 times, so 1 + 255 * 6 = 1531 bytes. Matches the client struct TPacketGCSkillLevelNew with TPlayerSkill entries.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| masterType | `byte` | 1 | Mastery stage of the skill, always 0 here. Repeated 255 times as part of the skill entry |
| level | `byte` | 1 | Current level of the skill, clamped to 0-255. Repeated 255 times as part of the skill entry |
| nextReadTime | `int` | 4 | Timestamp when the skill book may be read again, always 0 here. Repeated 255 times as part of the skill entry |

---

### SpecialEffectPacket

**Type:** Out

**Header:** 0x72

**Size:** 6 bytes

**Description:** Used to send an special effect.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| type | `byte` | 1 | Describe the special effect. See in SpecialEffectTypeEnum |
| virtual | `int` | 4 | Virtual id of the player to be effected |

---

### SyncPositionPacket

**Type:** Out

**Header:** 0x05

**Size:** 15 bytes

**Description:** Forces the client to snap an entity (including the player's own

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| size | `number` | 2 | Total packet size in bytes |
| virtualId | `number` | 4 | virtualId of the entity to snap |
| positionX | `number` | 4 | Server-side X position |
| positionY | `number` | 4 | Server-side Y position |

---

### TargetUpdatePacket

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

### TeleportPacket

**Type:** Out

**Header:** 0x41

**Size:** 15 bytes

**Description:** Is used to warp the player to another position, reconnecting it to the game server that owns the destination.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| positionX | `int` | 4 | Destination position X in game |
| positionY | `int` | 4 | Destination position Y in game |
| address | `int` | 4 | Address of the destination game server |
| port | `short` | 2 | Port of the destination game server |

---

### UpdateItemPacket

**Type:** Out

**Header:** 0x19

**Size:** 38 bytes

**Description:** Updates the stack count, sockets and bonuses of an item already set in a client window cell. The bonusId/bonusValue pair is repeated 7x, one per item attribute slot.

**Fields:**

| Name        | Type       | Size (bytes)   | Description               |
|-------------|------------|----------------|---------------------------|
| header | `byte` | 1 | Packet header |
| window | `byte` | 1 | Window the cell belongs to (See WindowTypeEnum) |
| position | `short` | 2 | Cell position inside the window |
| count | `byte` | 1 | New stack size of the item |
| sockets | `int[3]` | 12 | Metin socket values, 3 slots of 4 bytes |
| bonusId | `byte` | 1 | Attribute type of the bonus slot, repeated 7x |
| bonusValue | `short` | 2 | Attribute value of the bonus slot, repeated 7x |

---

