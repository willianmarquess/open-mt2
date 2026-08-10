# Open Metin2 - Emulador de servidor

<!-- hy-mt2-i18n:start -->
[English](./README.md) | [中文](./README_zh-CN.md) | [日本語](./README_ja.md) | **Español**
<!-- hy-mt2-i18n:end -->


![Tamaño del repositorio de GitHub](https://img.shields.io/github/repo-size/willianmarquess/open-mt2?style=for-the-badge)
![Conteo de lenguajes en GitHub](https://img.shields.io/github/languages/count/willianmarquess/open-mt2?style=for-the-badge)
![Forks en GitHub](https://img.shields.io/github/forks/willianmarquess/open-mt2?style=for-the-badge)

[![Pipeline de CI](https://github.com/willianmarquess/open-mt2/actions/workflows/flow.yml/badge.svg)]
[![Estado de la puerta de calidad](https://sonarcloud.io/api/project_badges/measure?project=willianmarquess_open-mt2&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=willianmarquess_open-mt2)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)


Metin2 JS es una implementación de código abierto del servidor de MMORPG Metin2, desarrollada con Nodejs y el lenguaje TypeScript.

Este proyecto se desarrollará únicamente por diversión y con fines de estudio.

Aviso legal: El objetivo no es seguir estrictamente el comportamiento original del juego; para algunas funciones, los desarrolladores añadirán nuevos comportamientos según lo consideren oportuno. No dude en enviar sus sugerencias.

Metin2 está protegido por derechos de autor por [Webzen](http://webzen.com/ "Webzen").

# Hoja de ruta de funcionalidades

| Característica   | Pendiente | En desarrollo | Finalizado |
|------------------|------------|---------------|-----------|
| Intercambio de datos |          |               | ✅        |
| Estado del servidor |          |               | ✅        |
| Inicio de sesión |          |               | ✅        |
| Cierre de sesión |          |               | ✅        |
| Volver a la selección |          |               | ✅        |
| Eliminar personaje |          |               | ✅        |
| Encriptación de protocolo | X |               |           |
| Crear personaje |          |               | ✅        |
| Entrar al juego |          |               | ✅        |
| Movimiento del personaje |          |               | ✅        |
| Cargar datos de animaciones del personaje |          |               | ✅        |
| Cargar datos de área |          |               | ✅        |
| Cargar datos de monstruos |          |               | ✅        |
| Cargar datos de NPCs |          |               | ✅        |
| Cargar datos de objetos |          |               | ✅        |
| Cargar datos de tiendas |          |               | ✅        |
| Generar monstruos |          |               | ✅        |
| Generar monstruos desde archivo |          |               | ✅        |
| Sistema de comportamiento de monstruos |          |               | ✅        |
| Generar NPCs |          |               | ✅        |
| Sistema de comportamiento de NPCs | X |               |           |
| Sistema de tiendas de NPCs |          |               | ✅        |
| Generar objetos |          |               | ✅        |
| Equipar objetos |          |               | ✅        |
| Sistema de atributos de objetos | X |               |           |
| Chat interno |          |               | ✅        |
| Sistema de comandos |          | X             |           |
| Sistema de GM |          | X             |           |
| Sistema de experiencia del personaje |          |               | ✅        |
| Sistema de estadísticas del personaje |          |               | ✅        |
| Sistema de salud del personaje |          |               | ✅        |
| Sistema de maná del personaje |          |               | ✅        |
| Sistema de ataques del personaje (físico, mágico, cuerpo a cuerpo, a distancia) |          | X             |           |
| Sistema de defensa del personaje (físico, mágico, cuerpo a cuerpo, a distancia) |          | X             |           |
| Sistema de bonificaciones y reducciones del personaje (físico, mágico, cuerpo a cuerpo, a distancia) |          | X             |           |
| Inventario del personaje |          |               | ✅        |
| Sistema de regeneración del personaje |          |               | ✅        |
| Sistema de duelos de personajes | X |               |           |
| Sistema de caída de objetos |          | X             |           |
| Sistema de efectos |          | X             |           |
| Sistema de misiones |          | X             |           |
| Sistema de habilidades |          | X             |           |
| Sistema de tiendas privadas |          |               | ✅        |
| Sistema de chat |          | X             |           |
| Sistema de niveles |          |               | ✅        |
| Apagado ordenado |          |               | ✅        |
| Monitoreo con Grafana | X |               |           |
| API del juego (para sitios web, etc.) | X |               |           |

## Primeros pasos

- Sigue esta [**guía**](docs/guide.md)

## Paquetes

- Lea la [**documentación**](docs/packets.md) sobre los paquetes (en desarrollo).
  
## Misiones

- Lea la [**documentación**] sobre misiones [docs/quests.md] (en desarrollo)

## Comandos

En esta implementación utilizamos comandos personalizados, descritos a continuación:

*(por el momento, cualquier jugador puede ejecutar cualquier comando)*

- **/help**
    - Descripción: Este comando muestra todos los comandos, la descripción de cada uno además de un ejemplo.
    - Ejemplo: /help
- **/exp**
    - Descripción: Añade experiencia a otro jugador o a ti mismo.
    - Ejemplo: /exp <número> <nombreDelObjetivo>
- **/gold**
    - Descripción: Añade oro a otro jugador o a ti mismo.
    - Ejemplo: /gold <número> <nombreDelObjetivo>
- **/goto**
    - Descripción: Te teletransporta a una <área>, <jugador> o <ubicación:x,y>.
    - Ejemplo: /goto <área, jugador, ubicación> <nombreDeLaÁrea, nombreDelObjetivo, <x, y>>
- **/invoke**
    - Descripción: Invoca a un mob mediante vnum; puedes indicar la cantidad.
    - Ejemplo: /invoke <vnum> <cantidad>
- **/item**
    - Descripción: Crea un ítem usando vnum; puedes indicar la cantidad.
    - Ejemplo: /item <vnum> <cantidad>
- **/list**
    - Descripción: Lista los recursos <áreas, jugadores, privilegios>.
    - Ejemplo: /list <áreas, jugadores, privilegios>
- **/lvl**
    - Descripción: Establece el nivel de otro jugador o de ti mismo.
    - Ejemplo: /lvl <número> <nombreDelObjetivo>
- **/stat**
    - Descripción: Agrega puntos a un estado específico.
    - Ejemplo: /stat <ht, st, dx, it> <número>
    - Uso: /stat ht 90 (agrega 90 puntos a HT (fuerza vital))
- **/priv**
    - Descripción: Añade un privilegio a un imperio, jugador o gremio.
    - Ejemplo: /priv <jugador, imperio, gremio> <nombreDelJugador, nombreDelImperio, nombreDelGremio> <exp, gold, drop, gold5, gold10, gold50> <valor> <tiempoEnSegundos>
    - Uso: /priv imperio blue exp 100 1000 (agrega un bono del 100% en experiencia al imperio blue cada 1000 segundos)
- **/setblockmode**
    - Descripción: Configura los modos de interacción con bloques para el jugador.
    - Ejemplo: /setblockmode <número>
    - Uso: /setblockmode 3 (establece Comercio y Grupo como bloqueados)
- **/polymorph**
    - Descripción: Transforma a tu personaje en la apariencia de un mob según vnum. Introduce 0 para volver a la apariencia original.
    - Ejemplo: /polymorph <vnum>
    - Uso: /polymorph 101 (se transforma en el mob con vnum 101)
- **/close_shop**
    - Descripción: Cierra la tienda privada del jugador.
    - Ejemplo: /close_shop
- **/logout**
    - Descripción: Cierra la sesión de la cuenta.
    - Ejemplo: /logout
- **/quit**
    - Descripción: Abandona el cliente.
    - Ejemplo: /quit
- **/restart_here**
    - Descripción: Reinicia en las mismas coordenadas (después de morir).
    - Ejemplo: /restart_here
- **/restart_town**
    - Descripción: Reinicia en la ciudad (después de morir).
    - Ejemplo: /restart_town
- **/phase_select**
    - Descripción: Vuelve a la pantalla de selección de personajes.
    - Ejemplo: /phase_select


## Flujo de autenticación
La imagen a continuación muestra cómo el cliente interactúa con el servidor de autenticación.
![](https://github.com/willianmarquess/open-mt2/blob/master/docs/images/mt2-auth-server.drawio.png)

## Flujo del juego (en desarrollo)
La imagen a continuación muestra cómo el cliente interactúa con el servidor del juego.
![](https://github.com/willianmarquess/open-mt2/blob/master/docs/images/mt2-game-server.drawio.png)

## Licencia

Este proyecto está licenciado bajo la GNU GENERAL PUBLIC LICENSE; consulte el archivo [LICENSE](LICENSE) para obtener más detalles.

## Referencias

- [Emulador de Mt2 en C# (Quantum-core-X)](https://github.com/MeikelLP/quantum-core-x)
- [Emulador de RuneScape en JS (RUNE JS)](https://github.com/runejs/server)


