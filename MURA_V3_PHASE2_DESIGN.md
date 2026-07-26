# mura_v3.html Phase 2 設計書
## 「入れる家・室内・住民8体」

対象: `public/games/mura_v3.html`（Phase 1 commit `3ace7c2c3890b7467652893ac5e396fd392d17c9` からの追加実装）

---

## 1. 目的

Phase 1までは村に建っている建物（プレイヤーの家・キッチン・服屋・住民宅）が
すべて「近づくとその場でモーダルが開く背景オブジェクト」だった。Phase 2では
これらを実際に「中へ入る」場所へ拡張し、村の外観と室内を明確に分離した。

## 2. 対象の入室先（11か所）

| エリアID | 種別 | 内容 |
|---|---|---|
| `interior:player` | プレイヤー宅 | ベッド・テーブル・収納・思い出棚・すがたみ（きせかえ確認） |
| `interior:kitchen` | キッチン | 調理台（Phase1の料理2工程をそのまま利用）・料理を置くテーブル・食器棚 |
| `interior:boutique` | 服屋 | 服のラック（Phase1のワードローブモーダルをそのまま利用）・カウンター・店員 |
| `interior:resident_neko` | ねこの家 | 住民本人・テーマ家具・好物展示・ギフト棚 |
| `interior:resident_usagi` | うさぎの家 | 同上 |
| `interior:resident_kuma` | くまの家 | 同上 |
| `interior:resident_kitsune` | きつねの家 | 同上 |
| `interior:resident_panda` | ぱんだの家 | 同上 |
| `interior:resident_risu` | りすの家（新規） | 同上 |
| `interior:resident_fukurou` | ふくろうの家（新規） | 同上＋「ほんだな」個別依頼 |
| `interior:resident_kawauso` | かわうその家（新規） | 同上 |

住民宅は、Phase 1と同じ「仲良し度5（移住済み）で家が村に出現する」条件を
満たしたときにのみドアが出現する（新規3住民も含め、初期状態で全員移住済みには
していない）。

## 3. データ駆動設計

単一の巨大if文を避け、以下の3つのレジストリで管理している。

```js
const INTERIORS = {
  "interior:player":   { kind:"player",   buildingId:"player",   doorPos:playerHousePos, label:"..." },
  "interior:kitchen":   { kind:"kitchen",  buildingId:"kitchen",  doorPos:kitchenPos,     label:"..." },
  "interior:boutique":  { kind:"boutique", buildingId:"boutique", doorPos:shopPos,        label:"..." },
  // ANIMALSのキーから "interior:resident_<id>" を自動生成
};

const RESIDENTS = {
  neko:{ personality, favoriteDish, dislikedDish, furnitureTheme, dialogue:{...}, quest:{...} },
  ... 8体分
};

const InteriorSystem = {
  build(interiorId),  // 初回のみ実際にメッシュを生成し interiorGroups[] にキャッシュ
  enter(interiorId),  // 村を隠して該当室内を表示、入口へプレイヤーを配置、エリアIDを保存
  exit(),             // 室内を隠して村を復元、建物の外（ドア前）へプレイヤーを戻す
  update(dt, now),    // 室内滞在中のみの軽い更新（住民の呼吸アニメ等）
};
```

`FURN_THEME`（8種のテーマカラーセット: cozy/bright/rustic/mystic/zen/cabin/study/river）
により、床・壁・ベッド・ラグの色を住民ごとに変え、「同じ部屋の壁色だけ変えた」状態を
避けている。

## 4. エリア切替の仕組み

`InteriorSystem.enter(id)`:

1. 村の `scene.children` を走査し、プレイヤー・ペット・室内グループ・
   **グローバル照明（HemisphereLight/DirectionalLight）以外** を非表示にする
   （実装時に照明まで誤って非表示にする不具合を発見・修正済み。詳細は
   `MURA_V3_PHASE2_TEST_PLAN.md` 参照）。
2. 対象の室内グループを初回のみ構築（以降はキャッシュを再利用、多重生成しない）し、表示する。
3. プレイヤーを室内の入口付近へ配置。
4. `S.currentArea` を更新し、`S.buildings`/`S.interiors` の訪問フラグを立てる。
5. 住民宅の場合、仲良しイベント判定（`maybeFriendshipEvent`）を行う。
6. セーブする。

`InteriorSystem.exit()`:

1. 室内グループを非表示にし、村側で保存しておいた表示状態を復元する。
2. プレイヤーを対応する建物のドア前（村座標）へ戻す。
3. `S.currentArea` を `"village"` に戻してセーブする。

村・室内は同じ `scene`/`camera`/`renderer` を共有し、別の THREE.Scene は作っていない
（実装コストと、村オブジェクトの使い回しやすさを優先した設計判断）。

## 5. 当たり判定・カメラの切り替え

- 移動の衝突判定は `S.currentArea` で分岐: 村では従来通り世界端・川の判定、
  室内では単純な部屋サイズ（`ROOM_W`×`ROOM_D`）でのクランプに切り替える。
- 室内カメラは全室共通の`INTERIOR_CAMERA`設定（FOV 65、上方の希望位置、
  ターゲット追従率、最低距離4.4）を使用する。屋外追従カメラとは同時に動かさず、
  室内では希望位置算出→最低距離補正→`lookAt`の順に適用する。開いた上方から
  部屋全体を見るため壁外へ出ず、入口・中央・壁際でもプレイヤーへ接近しすぎない。
  室内ごとの固定カメラ座標やプレイヤー位置の補正は持たない。
- 村限定の演出（動物AI・畑のきらきら・川の波・ほたる・かがり火の煙・宝の明滅）は
  `S.currentArea === "village"` の場合のみ更新する。パーティクルの残留処理
  （`bursts`/`fxTrail` の減衰・破棄ループ）は場所を問わず常に継続し、
  室内で発生した演出も村へ戻ってから残留することはない。

## 6. キッチン・服屋の再利用

Phase 1で実装した `openKitchenModal()`（切る→焼くの2工程クッキング）と
`openShopModal()`（8カテゴリ着せ替え）は **一切複製せず、そのまま呼び出している**。

- キッチン室内の調理台に近づく → `openKitchenModal()`
- 服屋室内のラックに近づく → `openShopModal()`
- プレイヤー宅のすがたみに近づく → `openShopModal()`（きせかえ確認用途として再利用）

料理が完成した際の演出（`spawnBurst`）は、`S.currentArea === "interior:kitchen"` の
場合にのみ室内の食器テーブル位置へ変更している（それ以外は従来通り村のキッチン位置）。
これにより「村の別UIと室内キッチンで料理在庫や進行が分裂する」ことはなく、
セーブされる `S.inv`/`S.dishes` は単一のままである。

## 7. 住民8体・会話・個別依頼

### 7-1. 新規住民3体

| ID | 名前 | 種族 | 性格 | 好物 | 個別依頼 |
|---|---|---|---|---|---|
| risu | りすの ぺかん | りす（オリジナル） | しんぱいしょうの あつめずき | ポップコーン | にんじんを2個届ける |
| fukurou | ふくろうの ノノ | ふくろう（オリジナル） | ものしり・よふかし | やさいスープ | 家のほんだなを調べる |
| kawauso | かわうその ラッコロ | かわうそ（オリジナル） | あまえんぼ | いちごケーキ | 井戸でみんなに水をあげる |

いずれも既存5体と性格・好物・家具テーマが重複しないよう設定し、他社IPを
想起させない完全オリジナルの名前・外見（3D形状はしっぽ・耳の形状を種ごとに
変えて区別している）にしている。

### 7-2. 会話

各住民に「初対面」「通常（3種類以上）」「注文中」「配達後（Phase1の`deliver`流用）」
「仲良し中間（friendship>=3）」「仲良し最大（friendship>=5）」「自宅専用（2種類）」を
個別に用意し、全住民で使い回している台詞はない。

### 7-3. 個別依頼

8体それぞれに1件、計8件の個別依頼を実装。既存アイテム・料理のみで完結し、
Phase 3以降の未実装要素は要求していない。依頼タイプは3種類（`inv`＝食材を届ける、
`dish`＝完成料理を届ける、`find`／`well`＝特定の行動を行う）を組み合わせて多様性を
持たせた。

達成状態は `S.residents[id].questDone`（真偽値）で保存し、`completeQuest()`内で
`if(rs.questDone) return;` により二重達成・二重報酬を防いでいる。

### 7-4. 仲良しイベント

各住民につき1段階、「仲良し度5（移住済み）かつ個別依頼クリア後」に自宅へ入室すると
一度だけ発生する短いイベント（`S.residents[id].eventSeen` で一度きり管理）を実装した。

## 8. 3D表現・視認性

Phase 1で調整した `ACESFilmicToneMapping`（exposure 1.0）・昼の`HemisphereLight 0.62`・
道の色`0xb89a68`はすべて変更していない。室内は各テーマの床・壁色に加え、
暖色のPointLight（0xffdca8、強度0.7）を各室内グループの子として追加する。
室内では屋外時間帯の変化にかかわらずグローバル照明を低い固定強度
（sun 0.18／hemi 0.28）へ保ち、暖色ライトと合わせて昼の白飛び・夜の暗転を防ぐ。
室内グループは初回構築後にキャッシュされるため、入退室でライトは増殖しない。
村へ戻ると次の`updateSky()`で屋外の時間帯強度へ復元される。

## 9. スコープ外（意図的）

- 畑12区画以上・作物10種以上などの成長上限拡張（Phase 3）
- 料理の追加・多工程化のさらなる拡張（Phase 3）
- 森・川上・海岸などの村外地域（Phase 4）
- 家具の配置編集機能（データ構造は将来の拡張を見越して`INTERIORS`/`RESIDENTS`に
  分離済みだが、UIは未実装）
- 公開ルート（`/mura`）の切り替え・`src/games/MuraGame.jsx`等の変更
