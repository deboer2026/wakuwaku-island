# mura_v3.html セーブ移行仕様

## 1. キー

| 用途 | キー名 | 扱い |
|---|---|---|
| 旧セーブ（v1/v2共用） | `mura_progress` | 読み取り専用の移行元。**絶対に書き込み・削除しない** |
| 新セーブ（v3） | `mura_v3_progress` | v3が読み書きする唯一のキー |

`public/games/mura_v3.html` 内の定義（コピー元は mura_v1.html:197 の `SAVE_KEY = "mura_progress"`）:

```js
const LEGACY_SAVE_KEY = "mura_progress";
const SAVE_KEY = "mura_v3_progress";
```

## 2. モデルにした元コード

`mura_v1.html:343-361` の `save()`/`load()`（v2でも `mura_v2.html:241-259` にほぼ同一のコピーがある）が示す
寛容なマージパターンをそのまま踏襲した:

```js
S = Object.assign(defaultState(), d);
S.inv = Object.assign(defaultState().inv, d.inv || {});
S.friends = Object.assign(defaultState().friends, d.friends || {});
if(!Array.isArray(S.plots) || S.plots.length !== 6) S.plots = defaultState().plots;
if(!Array.isArray(S.dishes)) S.dishes = [];
if(!Array.isArray(S.orders)) S.orders = [];
if(!Array.isArray(S.decos)) S.decos = [];
const wdef = defaultState().wardrobe;
S.wardrobe = Object.assign({}, wdef, d.wardrobe || {});
if(!Array.isArray(S.wardrobe.owned)) S.wardrobe.owned = wdef.owned.slice();
wdef.owned.forEach(id => { if(S.wardrobe.owned.indexOf(id) < 0) S.wardrobe.owned.push(id); });
```

v3ではこのブロックを `mergeIntoDefaults(d)` という共通関数に切り出し、通常の `load()` と
移行処理 `migrateFromLegacyIfNeeded()` の両方から同じロジックを呼ぶようにした。これにより
「通常読み込み」と「旧データからの移行」で挙動が分岐してズレることを防いでいる。

## 3. フィールド対応表（一対一・変換不要）

v1/v2の `mura_progress` と v3の `mura_v3_progress` は **同一のオブジェクト形状** であるため、
フィールド名・型の変換は一切不要。単純に旧JSONを `defaultState()` の上へマージするだけで
互換が取れる。対応関係は以下の通り（すべて `mura_v1.html:324-341` の `defaultState()` 基準）。

| フィールド | 型 | 移行方法 |
|---|---|---|
| `gender` | string\|null | そのままコピー |
| `crowns`, `totalCrowns`, `level` | number | そのままコピー |
| `plots` | array(6) | 配列長6でなければ既定値[null×6]に差し替え |
| `inv.{ninjin,tomato,ichigo,corn,komugi,egg}` | number | defaultState().inv の上にマージ（欠損キーは0で補完） |
| `dishes` | array | 配列でなければ`[]`に補正 |
| `orders` | array | 配列でなければ`[]`に補正 |
| `friends.{neko,usagi,kuma,kitsune,panda}` | number | defaultState().friends の上にマージ |
| `mapPieces`, `pity`, `treasureReady`, `treasureCount` | number/bool | そのままコピー |
| `decos` | array | 配列でなければ`[]`に補正 |
| `komugiUnlocked` | bool | そのままコピー |
| `lastEggAt`, `lastSeen` | number(ms) | そのままコピー |
| `mIdx`, `mProg` | number | そのままコピー |
| `wardrobe.owned` | array | 配列でなければ `wdef.owned.slice()`。さらに8既定アイテムのIDが欠けていれば個別に追加 |
| `wardrobe.{outfit,head,face,neck,hand,shoes,pet,fx}` | string | defaultState().wardrobe の上にマージ（欠損スロットは各既定値で補完） |

補足: v1のセーブには `face`/`neck`/`hand`/`shoes`/`fx` を一切使わない旧バージョンのデータが
存在する可能性があるが、`defaultState().wardrobe` に既定値（`face_none` 等）が定義されているため、
`Object.assign` で自動的に補完される。捏造ではなく、v1自身が定義している既定値を使うだけである。

## 4. 冪等性ガード

```js
function migrateFromLegacyIfNeeded(){
  try{
    const v3raw = SAFE_LS.getItem(SAVE_KEY);
    if(v3raw) return false; // 既にv3セーブがある → 二重移行しない
    const legacyRaw = SAFE_LS.getItem(LEGACY_SAVE_KEY);
    if(!legacyRaw) return false;
    const d = JSON.parse(legacyRaw);
    mergeIntoDefaults(d || {});
    S._migratedFromLegacy = true;
    S._migratedAt = Date.now();
    save(); // v3キーへ書き出す。legacyキーには一切書き込まない・削除しない。
    return true;
  }catch(e){ return false; }
}
```

`load()` は次の順で呼ばれる:

1. `mura_v3_progress` があれば、それを読み込んで終了（移行処理には入らない＝以後は毎回ここで完結）。
2. なければ `migrateFromLegacyIfNeeded()` を呼ぶ。
   - `mura_v3_progress` が（別タブ等の理由で）既にあればそこで即 `return false`（二重適用防止）。
   - `mura_progress` があれば1回だけマージ・保存し、`_migratedFromLegacy`/`_migratedAt` を記録する。
   - どちらも無ければ何もしない（新規プレイヤーとして `defaultState()` のまま起動）。

`_migratedFromLegacy` フラグ自体は「一度だけ実行すべき副作用」を持たないため、フラグの有無で
分岐処理を変える必要はない。ガードの本体は **「v3キーの存在チェックを移行処理の入口に置く」** ことであり、
これによって何度 `load()` を呼んでも（例: ページ再読み込みを繰り返しても）移行は最大1回しか発生しない。

## 5. 壊れたデータへの耐性

- `JSON.parse` が例外を投げた場合（壊れたJSON）: `load()` 側は `catch(e){ S = defaultState(); }` で
  無条件に既定値へフォールバックする（mura_v1.html:360 と同じ設計）。
- `migrateFromLegacyIfNeeded()` 内で例外が起きた場合も `catch(e){ return false; }` で移行を諦め、
  結果として `load()` は `defaultState()` のまま進む（v3キーへの書き込みも発生しないため、次回起動時に
  再度移行を試みることができる＝安全側に倒れる）。
- 欠損フィールド・型不一致のフィールドは全て `defaultState()` の値で補完され、存在しないデータを
  新規に作り出す（捏造する）ことはない。

## 6. 明示的に行わないこと

- 旧キー `mura_progress` への書き込み・削除は一切行わない（読み取りのみ）。
- v1が持たなかったデータ（新規畑・新規料理・新規住民など）をv3側で水増しして移行することはしない
  （Phase 1のスコープはv1完全互換であり、拡張はPhase 3以降）。

## 7. Phase 2 追加分（schemaVersion:4）

Phase 2では住民8体・室内11か所・個別依頼・仲良しイベントを追加した。
セーブ形式は以下のフィールドを追加している。

```js
{
  schemaVersion: 4,
  ...(Phase 1までの全フィールド、変更なし)...
  currentArea: "village",   // 現在地。village または "interior:xxx"
  buildings: { player:{visited}, kitchen:{visited}, boutique:{visited} },
  residents: {
    // 8体分。各要素は { questDone, eventSeen, dialogueStage, metOnce }
    neko:{...}, usagi:{...}, kuma:{...}, kitsune:{...}, panda:{...},
    risu:{...}, fukurou:{...}, kawauso:{...}
  },
  interiors: { "interior:resident_xxx": {visited} },
}
```

### 7-1. 仲良し度・移住状態は二重の情報源を作らない

Phase 1の `S.friends[id]`（仲良し度・移住判定の実体、`>=5` で移住済み）は Phase 2でも
唯一の情報源のまま変更していない。`S.residents[id]` は **依頼進行・イベント既読・
会話段階のみ** を持ち、仲良し度そのものは持たない。これにより「村側と室内側で
仲良し度が食い違う」という状態分裂を構造的に防いでいる。

### 7-2. マージ方法

`mergeIntoDefaults(d)` に以下を追加した（Phase 1のinv/friends/wardrobeマージと同じ方式）。

```js
const rdef = defaultState().residents;
S.residents = {};
Object.keys(rdef).forEach(id=>{
  S.residents[id] = Object.assign({}, rdef[id], (d.residents && d.residents[id]) || {});
});
const bdef = defaultState().buildings;
S.buildings = Object.assign({}, bdef, d.buildings || {});
if(!S.interiors || typeof S.interiors !== "object") S.interiors = {};
if(!S.currentArea) S.currentArea = "village";
```

`residents` は住民IDをキー単位でマージするため、Phase 1オンリーのセーブ（`residents`
キー自体が存在しない）でも8体分すべてが `questDone:false, eventSeen:false` などの
既定値で欠損なく補完される。新規3住民（risu/fukurou/kawauso）は `friends` 側も
`defaultState().friends` に追加済みのため、Phase 1セーブでは自動的に `0`（未接触）
として補完される。

### 7-3. 冪等性・現在地の復元

`currentArea` がセーブされているため、室内にいる状態でページを再読み込みしても
同じ室内へ復元される（`bootWorld()` 内で `S.currentArea !== "village"` を検出した場合、
一度 `"village"` に戻してから `InteriorSystem.enter()` を呼び直すことで、
`enter()` 内部の「既に同じエリアなら何もしない」ガードを回避しつつ入口位置へ配置する）。
これは実ブラウザで「室内でセーブ→リロード→同じ室内かつ仲良し度・依頼進行を維持」
することを確認済み（`MURA_V3_PHASE2_TEST_PLAN.md` 参照）。

### 7-4. 検証済みの互換シナリオ

実ブラウザで、Phase 1形式（`residents`/`buildings`/`currentArea`キーを持たない
`mura_v3_progress`）を直接 `localStorage` に投入して読み込ませ、以下を確認した。

- crowns/level/inv/dishes/komugiUnlocked/wardrobe が完全維持
- 既存5住民の仲良し度（neko:5, usagi:2, kuma:0, kitsune:0, panda:0）が維持
- 新規3住民（risu/fukurou/kawauso）の仲良し度が `0` で安全に補完
- `residents`/`buildings`/`currentArea` が欠損なく既定値で補完（`village` 起動）
- `schemaVersion` が `4` に更新
- 一度 `S.residents.usagi.questDone = true` にしてセーブ→再読み込みしても、
  再移行によって上書きされず維持される（冪等性）

## 8. Phase 3 追加分（schemaVersion:5）

Phase 3では畑・作物・料理を拡張するため、schemaVersionを5へ更新した。保存キーと
Phase 1・2のフィールドは変更していない。

```js
{
  schemaVersion: 5,
  plots: [
    {
      id, areaId, type, unlocked,
      cropId, plantedAt, wateredAt, boost, quality, harvestCount
    }
  ],
  progression: {
    farmingRank, farmingXp,
    cookingRank, cookingXp,
    harvestedCrops, cookedRecipes
  },
  recipeProgress: {
    [recipeId]: { bestStars, timesCooked }
  }
}
```

## Phase 4 schemaVersion 6

Phase 4 adds regional exploration without changing the existing flat `inv` schema. Regional materials live in `gathered`; node cooldowns, regional quests, one-time treasures, and return positions live in `exploration`. `progression` gains `explorationRank` and `explorationXp`. Existing plots, dishes, residents, interiors, wardrobe, and unknown top-level fields remain preserved by `mergeIntoDefaults()`; invalid areas fall back to `village`.

実ブラウザでは、Phase 3相当の `schemaVersion: 5` 状態から探索フィールドを欠いた入力を移行し、既存の村・畑・料理・住民・室内・着せ替えの状態を保持したまま、上記の探索既定値を補完して `schemaVersion: 6` へ更新することを確認した。移行後の通常URL再起動で再移行やコンソール error は発生しなかった。

移行直後の探索値は `explorationRank: 1`、`explorationXp: 0`、空の `gathered`／`exploration.quests` である。地域依頼・採集・宝の結果はこの既定値へ加算され、完了済み依頼は `exploration.quests` のIDで保持されるため、再読み込みや再入場で報酬を二重に得ない。

### 8-1. 旧6区画の正規化

`mergeIntoDefaults()`は、読み込んだ`plots`を新しい16区画の既定配列へ重ねる。

- Phase 3形式で`id`がある要素は、保存値を維持しつつ正規の`id/areaId/type`へ揃える。
- schemaVersion 4以前の`{crop, plantedAt, boost}`形式は、先頭6区画だけ
  `{cropId, plantedAt, boost}`へ変換する。
- 旧セーブに存在しない追加10区画は未解放・空の既定値で補完する。
- 既存6区画のレベル解放条件は従来どおりで、旧データを再購入させない。
- 変換後も旧キーを削除せず、保存時に新しいv3キーへschemaVersion 5として書き出す。

### 8-2. 在庫・料理の互換性

`inv`は従来のキーをそのままマージし、新作物6種を0で補完する。`dishes`は
従来どおり`[{id, stars}]`の配列を維持する。既存料理については、保存済みの最高星を
`recipeProgress[id].bestStars`の初期値へ反映するが、元の料理を削除・変換しない。

`progression`がない旧セーブは両ランク1・経験値0で開始する。これは既存の村レベル、
小麦解放、在庫、料理、仲良し度、着せ替え、現在地を変更しない安全な既定値である。

### 8-3. Phase 2状態の維持

`residents`、`buildings`、`interiors`は従来どおりキー単位でマージする。
実ブラウザfixtureでは、schemaVersion 4のサンプルを読み込み、次を確認した。

- 6要素畑が16要素へ変換され、先頭区画の`ninjin`と植付情報を維持
- `inv.tomato: 9`、`dishes`の`salad: ★3`を維持
- `residents.usagi.questDone/eventSeen: true`を維持
- schemaVersionが5になり、追加区画・進行・レシピ履歴が安全に補完

通常URLで再読み込みした場合も、解放済み区画、在庫、料理、ランクが保持された。

### 8-4. 離脱中の成長と冪等性

作物の成長は保存済み`plantedAt`と`boost`から現在時刻との差を計算し、`cropRatio()`で
最大1へ制限する。通常畑、果樹、ハーブは同じ`S.plots`配列と計算経路を使う。

実ブラウザでは、じゃがいもを途中成長、ハーブとりんごを成熟時刻にして通常起動し、
途中段階と成熟2件、おかえり通知の件数が一致することを確認した。直後の再読み込みでは
`bootWorld()`が保存した新しい`lastSeen`により通知を再表示しない。りんご収穫後は
`cropId:apple`を保持して`plantedAt`だけを更新し、離脱後の再成長も同じ計算で成熟した。

30日相当の時刻でも成長率は1を超えない。schemaVersion 4の旧plots形式に保存された
にんじんも`plot_001`へ正規化後、保存済み`plantedAt`から成熟状態を復元した。
