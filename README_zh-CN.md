# Open Metin2 - 服务器模拟器

<!-- hy-mt2-i18n:start -->
[English](./README.md) | **中文** | [日本語](./README_ja.md) | [Español](./README_es.md)
<!-- hy-mt2-i18n:end -->


![GitHub 仓库大小](https://img.shields.io/github/repo-size/willianmarquess/open-mt2?style=for-the-badge)
![GitHub 语言统计](https://img.shields.io/github/languages/count/willianmarquess/open-mt2?style=for-the-badge)
![GitHub 分支数量](https://img.shields.io/github/forks/willianmarquess/open-mt2?style=for-the-badge)

[![CI流水线](https://github.com/willianmarquess/open-mt2/actions/workflows/flow.yml/badge.svg)](https://github.com/willianmarquess/open-mt2/actions/workflows/flow.yml)
[![质量门禁状态](https://sonarcloud.io/api/project_badges/measure?project=willianmarquess_open-mt2&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)
[![质量检测门禁](https://sonarcloud.io/api/project_badges/quality_gate?project=willianmarquess_open-mt2)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)


Metin2 JS 是一个基于 Nodejs 和 TypeScript 语言开发的 MMORPG Metin2 服务器的开源实现。

本项目仅为娱乐与学习目的而开发。

免责声明：本项目并非旨在严格遵循游戏原有的运行逻辑；对于部分功能，开发者会根据自身判断添加新的行为特性，欢迎大家提出建议。

《Metin2》的版权归[Webzen](http://webzen.com/ “Webzen”）所有。

# 功能路线图

| 功能特性         | 待处理 | 进行中 | 已完成 |
|------------------|--------|--------|--------|
| 握手协议         |        |        | ✅     |
| 服务器状态       |        |        | ✅     |
| 登录             |        |        | ✅     |
| 登出             |        |        | ✅     |
| 返回选择界面     |        |        | ✅     |
| 删除角色         |        |        | ✅     |
| 协议加密         | X      |        |        |
| 创建角色         |        |        | ✅     |
| 进入游戏         |        |        | ✅     |
| 角色移动         |        |        | ✅     |
| 加载角色动画数据 |        |        | ✅     |
| 加载区域数据     |        |        | ✅     |
| 加载怪物数据     |        |        | ✅     |
| 加载NPC数据     |        |        | ✅     |
| 加载物品数据     |        |        | ✅     |
| 加载商店数据     |        |        | ✅     |
| 生成怪物         |        |        | ✅     |
| 从文件生成怪物   |        |        | ✅     |
| 怪物行为系统     |        |        | ✅     |
| 生成NPC          |        |        | ✅     |
| NPC行为系统     | X      |        |        |
| NPC商店系统     |        |        | ✅     |
| 生成物品         |        |        | ✅     |
| 装备物品         |        |        | ✅     |
| 属性物品系统     | X      |        |        |
| 内部聊天         |        |        | ✅     |
| 命令系统         |        | X      |        |
| GM系统           |        | X      |        |
| 角色经验系统     |        |        | ✅     |
| 角色属性系统     |        |        | ✅     |
| 角色生命值系统   |        |        | ✅     |
| 角色法力值系统   |        |        | ✅     |
| 角色攻击系统（物理、魔法、近战、远程） |        | X      |        |
| 角色防御系统（物理、魔法、近战、远程） |        | X      |        |
| 角色加成与减益系统（物理、魔法、近战、远程） |        | X      |        |
| 角色背包系统     |        |        | ✅     |
| 角色恢复系统     |        |        | ✅     |
| 角色决斗系统     | X      |        |        |
| 掉落系统         |        | X      |        |
| 影响系统         |        | X      |        |
| 任务系统         |        | X      |        |
| 技能系统         |        | X      |        |
| 私人商店系统     |        |        | ✅     |
| 聊天系统         | X      |        |        |
| 等级系统         |        |        | ✅     |
| 优雅关闭         |        |        | ✅     |
| Grafana监控系统   | X      |        |        |
| 游戏API（用于网站等） | X      |        |        |

## 入门指南

- 阅读此[**指南**](docs/guide.md)

## 数据包

- 阅读数据包[**文档**](docs/packets.md)（正在编写中）
  
## 任务系统

- 阅读任务系统相关的[**文档**](docs/quests.md)（仍在完善中）

## 命令

在当前实现中，我们使用了自定义命令，具体说明如下：

（目前，任何玩家均可执行任意命令）

- **/help**
    - 描述：该命令会显示所有命令及其描述，并附上使用示例。
    - 示例：/help
- **/exp**
    - 描述：为其他玩家或自己增加经验值。
    - 示例：/exp <数字> <目标名称>
- **/gold**
    - 描述：为其他玩家或自己增加金币数量。
    - 示例：/gold <数字> <目标名称>
- **/goto**
    - 描述：将你传送到某个<区域>、<玩家>或<坐标:x,y>位置。
    - 示例：/goto <区域, 玩家, 坐标> <区域名称, 目标名称, <x, y>>
- **/invoke**
    - 描述：通过vnum召唤怪物，你可以指定召唤数量。
    - 示例：/invoke <vnum> <数量>
- **/item**
    - 描述：通过vnum创建物品，你可以指定创建数量。
    - 示例：/item <vnum> <数量>
- **/list**
    - 描述：列出<区域、玩家、权限>相关的资源。
    - 示例：/list <区域, 玩家, 权限>
- **/lvl**
    - 描述：为其他玩家或自己设置等级。
    - 示例：/lvl <数字> <目标名称>
- **/stat**
    - 描述：为某项状态属性增加点数。
    - 示例：/stat <ht, st, dx, it> <数字>
    - 使用方式：/stat ht 90（为HT（生命值）属性增加90点）
- **/priv**
    - 描述：为某个帝国、玩家或公会添加权限。
    - 示例：/priv <玩家, 帝国, 公会> <玩家名称, 帝国名称, 公会名称> <经验值, 金币, 掉落物, gold5, gold10, gold50> <数值> <秒数>
    - 使用方式：/priv empire blue exp 100 1000（每1000秒为蓝色帝国增加100%的经验值加成）
- **/setblockmode**
    - 描述：设置玩家的方块交互模式（设置选项）。
    - 示例：/setblockmode <数字>
    - 使用方式：/setblockmode 3（将交易和组队功能设置为禁用）
- **/polymorph**
    - 描述：根据vnum将角色变换为某种怪物外观。输入0可恢复为原始外观。
    - 示例：/polymorph <vnum>
    - 使用方式：/polymorph 101（变为vnum为101的怪物外观）
- **/close_shop**
    - 描述：关闭玩家的私人商店。
    - 示例：/close_shop
- **/logout**
    - 描述：登出当前账户。
    - 示例：/logout
- **/quit**
    - 描述：退出客户端程序。
    - 示例：/quit
- **/restart_here**
    - 描述：死亡后在相同坐标处重新开始游戏。
    - 示例：/restart_here
- **/restart_town**
    - 描述：死亡后在城镇处重新开始游戏。
    - 示例：/restart_town
- **/phase_select**
    - 描述：返回角色选择界面。
    - 示例：/phase_select


## 认证流程
下图展示了客户端与认证服务器之间的交互方式。
![](https://github.com/willianmarquess/open-mt2/blob/master/docs/images/mt2-auth-server.drawio.png)

## 游戏流程（正在开发中）
下图展示了客户端与游戏服务器之间的交互方式。
![](https://github.com/willianmarquess/open-mt2/blob/master/docs/images/mt2-game-server.drawio.png)

## 许可证

本项目采用 GNU GENERAL PUBLIC LICENSE 进行许可——详情请参阅 [LICENSE](LICENSE) 文件。

## 参考资料

- [C# 编写的 Mt2 模拟器（Quantum-core-X）](https://github.com/MeikelLP/quantum-core-x)
- [JS 编写的 RuneScape 模拟器（RUNE JS）](https://github.com/runejs/server)


