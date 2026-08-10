# Open Metin2 - サーバーエミュレータ

<!-- hy-mt2-i18n:start -->
[English](./README.md) | [中文](./README_zh-CN.md) | **日本語** | [Español](./README_es.md)
<!-- hy-mt2-i18n:end -->


![GitHubリポジトリサイズ](https://img.shields.io/github/repo-size/willianmarquess/open-mt2?style=for-the-badge)
![GitHubの使用言語数](https://img.shields.io/github/languages/count/willianmarquess/open-mt2?style=for-the-badge)
![GitHubのフォーク数](https://img.shields.io/github/forks/willianmarquess/open-mt2?style=for-the-badge)

[![CIパイプライン](https://github.com/willianmarquess/open-mt2/actions/workflows/flow.yml/badge.svg)](https://github.com/willianmarquess/open-mt2/actions/workflows/flow.yml)
[![品質ゲートステータス](https://sonarcloud.io/api/project_badges/measure?project=willianmarquess_open-mt2&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)
[![品質ゲート](https://sonarcloud.io/api/project_badges/quality_gate?project=willianmarquess_open-mt2)](https://sonarcloud.io/summary/new_code?id=willianmarquess_open-mt2)


Metin2 JSは、NodejsとTypeScript言語を使用したMMORPG Metin2サーバーのオープンソース実装です。

このプロジェクトは、純粋に楽しみと学習のためだけに開発されます。

免責事項：このプロジェクトはゲームの元の動作を厳密に再現することを目的としていません。一部の機能については、開発者が適切だと判断して新たな動作を追加する場合がありますので、ご意見がございましたら遠慮なくお寄せください。

Metin2は[Webzen](http://webzen.com/ "Webzen")によって著作権が保護されています。

# 機能ロードマップ

| 機能項目          | 未実装 | 実装中 | 完了 |
|------------------|--------|--------|------|
| ハンドシェイク   |        |        | ✅    |
| サーバー状況     |        |        | ✅    |
| ログイン         |        |        | ✅    |
| ログアウト       |        |        | ✅    |
| 選択画面へ戻る  |        |        | ✅    |
| キャラクター削除 |        |        | ✅    |
| プロトコル暗号化 | X      |        |      |
| キャラクター作成 |        |        | ✅    |
| ゲームに入る     |        |        | ✅    |
| キャラクター移動 |        |        | ✅    |
| キャラクターアニメーションデータ読み込み |        |        | ✅    |
| エリアデータ読み込み |        |        | ✅    |
| モブデータ読み込み |        |        | ✅    |
| NPCデータ読み込み |        |        | ✅    |
| アイテムデータ読み込み |        |        | ✅    |
| ショップデータ読み込み |        |        | ✅    |
| モブの生成       |        |        |  ✅    |
| ファイルからモブの生成 |        |        |  ✅    |
| モブ行動システム |        |        |   ✅   |
| NPCの生成       |        |        |  ✅   |
| NPC行動システム | X      |        |      |
| NPCショップシステム |        |        |   ✅   |
| アイテムの生成   |        |        |  ✅   |
| アイテム装備     |        |        |   ✅  |
| ステータスアイテムシステム | X      |        |      |
| 内部チャット     |        |        | ✅    |
| コマンドシステム |        | X     |      |
| GMシステム       |        | X     |      |
| キャラクター経験値システム |        |        | ✅    |
| キャラクターステータシステム |        |        | ✅    |
| キャラクター体力システム |        |        |  ✅   |
| キャラクターマナシステム |        |        | ✅    |
| キャラクター攻撃システム（物理・魔法・近接・遠距離） |        |  X    |      |
| キャラクター防御システム（物理・魔法・近接・遠距離） |        | X     |      |
| キャラクターボーナス・減算システム（物理・魔法・近接・遠距離） |        | X     |      |
| キャラクターインベントリ |        |        | ✅    |
| キャラクター回復システム |        |        | ✅    |
| キャラクタードゥエルシステム | X      |        |      |
| ドロップシステム   |        | X     |      |
| 影響システム     |        | X     |      |
| クエストシステム |        |  X    |      |
| スキルシステム   |        | X     |      |
| プライベートショップシステム |        |        | ✅    |
| チャットシステム   | X      |        |      |
| レベルシステム   |        |        | ✅    |
| 正常終了         |        |        | ✅    |
| Grafana監視     | X      |       |      |
| ゲームAPI（ウェブサイトなど向け） | X      |       |      |

## はじめに

- この[**ガイド**](docs/guide.md)に従ってください

## パケット

- パケットに関する[**ドキュメント**](docs/packets.md)をご覧ください（作成中）
  
## クエストシステム

- クエストに関する[**ドキュメント**](docs/quests.md)をご覧ください（作成中）

## コマンド一覧

この実装では、以下に説明するカスタムコマンドを使用しています：

（現時点では、どのプレイヤーでも任意のコマンドを実行できます）

- **/help**
    - 説明: このコマンドを実行すると、すべてのコマンドと各コマンドの説明、および使用例が表示されます。
    - 例: /help
- **/exp**
    - 説明: 他のプレイヤーや自分自身の経験値を増加させます。
    - 例: /exp <数値> <ターゲット名>
- **/gold**
    - 説明: 他のプレイヤーや自分自身のゴールドを増加させます。
    - 例: /gold <数値> <ターゲット名>
- **/goto**
    - 説明: <エリア>、<プレイヤー>、または<位置:x,y>に瞬間移動します。
    - 例: /goto <エリア, プレイヤー, 位置> <エリア名, ターゲット名, <x, y>>
- **/invoke**
    - 説明: vnumを指定してモブを呼び出し、数量も指定できます。
    - 例: /invoke <vnum> <数量>
- **/item**
    - 説明: vnumを指定してアイテムを作成し、数量も指定できます。
    - 例: /item <vnum> <数量>
- **/list**
    - 説明: <エリア>、<プレイヤー>、<権限>のリソースを一覧表示します。
    - 例: /list <エリア, プレイヤー, 権限>
- **/lvl**
    - 説明: 他のプレイヤーや自分自身のレベルを設定します。
    - 例: /lvl <数値> <ターゲット名>
- **/stat**
    - 説明: 特定のステータスポイントにポイントを追加します。
    - 例: /stat <ht, st, dx, it> <数値>
    - 使い方: /stat ht 90 (HT（体力）に90ポイントを追加)
- **/priv**
    - 説明: 帝国、プレイヤー、ギルドに権限を追加します。
    - 例: /priv <プレイヤー, 帝国, ギルド> <プレイヤー名, 帝国名, ギルド名> <exp, gold, drop, gold5, gold10, gold50> <値> <秒数>
    - 使い方: /priv empire blue exp 100 1000 (1000秒ごとにblue帝国に経験値ボーナス100%を追加)
- **/setblockmode**
    - 説明: プレイヤーのブロック操作モード（設定）を変更します。
    - 例: /setblockmode <数値>
    - 使い方: /setblockmode 3 (TradeおよびGroupをブロック状態に設定)
- **/polymorph**
    - 説明: vnumによってキャラクターをモブの姿に変形させます。0を指定すると元の姿に戻ります。
    - 例: /polymorph <vnum>
    - 使い方: /polymorph 101 (vnum 101のモブに変形)
- **/close_shop**
    - 説明: プレイヤーのプライベートショップを閉じます。
    - 例: /close_shop
- **/logout**
    - 説明: アカウントからログアウトします。
    - 例: /logout
- **/quit**
    - 説明: クライアントを終了します。
    - 例: /quit
- **/restart_here**
    - 説明: 死亡後、同じ座標から再開します。
    - 例: /restart_here
- **/restart_town**
    - 説明: 死亡後、町で再開します。
    - 例: /restart_town
- **/phase_select**
    - 説明: キャラクター選択画面に戻ります。
    - 例: /phase_select


## 認証フロー
下の画像は、クライアントが認証サーバーとどのようにやり取りするかを示しています。
![](https://github.com/willianmarquess/open-mt2/blob/master/docs/images/mt2-auth-server.drawio.png)

## ゲームフロー（開発中）
下の画像は、クライアントがゲームサーバーとどのようにやり取りするかを示しています。
![](https://github.com/willianmarquess/open-mt2/blob/master/docs/images/mt2-game-server.drawio.png)

## ライセンス

このプロジェクトはGNU GENERAL PUBLIC LICENSEの下でライセンスされており、詳細については[LICENSE](LICENSE)ファイルをご覧ください。

## 参考文献

- [C#で作られたMt2エミュレータ（Quantum-core-X）](https://github.com/MeikelLP/quantum-core-x)
- [JSで作られたRuneScapeエミュレータ（RUNE JS）](https://github.com/runejs/server)


