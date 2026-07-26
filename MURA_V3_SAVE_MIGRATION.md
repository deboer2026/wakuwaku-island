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
