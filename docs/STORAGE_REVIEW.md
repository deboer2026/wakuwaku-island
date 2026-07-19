# Phase 3C 残存 localStorage 問題の設計レビュー

## 1. 調査目的

Phase 3A・3Bで公開中16ゲーム、34箇所の直接 `localStorage` 利用を `SAFE_LS` 経由へ移行した。Phase 3CではゲームHTMLを変更せず、残るactive 9ファイル、40箇所（error 28、warning 12）を実コードと照合し、セーブ互換性を維持できる次フェーズの単位を決める。

調査基準は開始HEAD `c458c4d284a6216c313fa5bf5b22f860235a7be0` の `reports/game-audit.json` と作業ツリーの実コードである。監査対象はHTML 64件（active 39、referenced-secondary 1、archived-or-unused 24）。

## 2. Phase 3A・3Bの実績

| フェーズ | 対象 | 直接利用の移行 | 結果 |
| --- | ---: | ---: | --- |
| Phase 3A | 公開中8ゲーム | 17箇所 | active STORAGE errorを45件から28件へ削減 |
| Phase 3B | 公開中8ゲーム | 17箇所 | active STORAGE warningを29件から12件へ削減 |
| 合計 | 公開中16ゲーム | 34箇所 | 残件は9ファイル、error 28、warning 12 |

## 3. 残存9ファイル一覧

`API` は `getItem/setItem/removeItem` の実コード件数。9ファイルに `removeItem`、`clear`、`length`、`key(index)`、`Object.keys(localStorage)`、`for...in localStorage`、`storage`イベント、`window.localStorage`、optional chaining、computed propertyによるAPI名、localStorageオブジェクトの変数代入・引数渡しはない。

| route | HTML | status | error | warning | API | キー | 保存形式 | 読込タイミング | 保存タイミング | 汎用ラッパー | 主分類 | 難易度 | 破損リスク | テスト負荷 | 推奨 |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| `/ichigo` | `public/games/ichigo_v3.html` | active | 4 | 0 | get 2 / set 2 | `ichigo_v3_progress`, `ichigo_hi` | JSON object、数値文字列 | マップ／ハイスコア表示、終了時再読込 | ステージ終了、スコア更新 | なし | B | 2 | 2 | 3 | 3D |
| `/jewelry-master` | `public/games/jewelry_master_v8.html` | active | 6 | 2 | get 4 / set 4 | `jm8_save`, `jm_hs`, `jm_col` | JSON object、数値文字列、JSON配列 | script初期化、コレクション／終了表示 | 正解・装飾操作・Day終了・全クリア | なし | B | 2 | 3 | 4 | 3D |
| `/katakana-asobi` | `public/games/katakana_asobi_v1.html` | active | 2 | 2 | get 3 / set 1 | `katakana_hi_word`, `katakana_hi_char` | 数値文字列 | タイトル／モード別ハイスコア表示 | ゲーム終了時 | なし | C | 3 | 2 | 3 | 3E |
| `/runner` | `public/games/runner_v8.html` | active | 4 | 0 | get 2 / set 2 | `runner_char`, `runner_hs` | 数値文字列 | script初期化、ハイスコア表示／終了 | キャラ選択、ゲーム終了時 | なし | B | 2 | 2 | 2 | 3D |
| `/shabondama` | `public/games/shabondama_v3.html` | active | 6 | 0 | get 3 / set 3 | `shabondama_v3_progress`, `shabondama_v3_char`, `shabondama_hs` | JSON object、ID文字列、数値文字列 | `init()`、タイトル／マップ表示 | キャラ決定、ステージ終了、ゲーム終了 | なし | B | 2 | 3 | 3 | 3D |
| `/shooting` | `public/games/shoot3.html` | active | 4 | 0 | get 2 / set 2 | `shooting_hs2`, `shooting_v3_progress` | 数値文字列、JSON object | タイトル／マップ／次ステージ | ステージ終了、ゲーム終了 | なし | B | 2 | 2 | 3 | 3D |
| `/sora` | `public/games/sora_v3.html` | active | 2 | 2 | get 2 / set 2 | `soratobi_v3_progress`, `soratobi_best` | JSON object、数値文字列 | script初期化 | キャラ決定、ステージ終了 | なし | B | 2 | 3 | 3 | 3D |
| `/iro` | `public/games/iro_awase_v3.html` | active | 0 | 2 | get 1 / set 1 | `iro_hi`, `iro_hi_hard`（map参照） | 数値文字列 | タイトル／モード別ハイスコア表示 | ゲーム終了時 | なし | G | 3 | 3 | 3 | 3F |
| `/machi` | `public/games/machi_v7.html` | active | 0 | 4 | get 2 / set 2 | `machi_v3_story`, `machi_v3_coins` | JSON object、数値文字列 | `init()`、HUD／建築操作 | 建築・報酬・画面遷移・`visibilitychange`・`pagehide` | なし | B | 3 | 3 | 4 | 3E |

評価尺度は1（低い／単純）から5（高い／複雑）。「汎用ラッパーなし」は、ドメイン用の `load/save/get/set` 関数はあっても、利用可否プローブやメモリフォールバックを持つストレージ抽象がないことを表す。

## 4. ファイルごとの詳細分析

### 4.1 `/ichigo` — `ichigo_v3.html`

- 証拠: 195行 `loadProg()` の `getItem('ichigo_v3_progress')`、196行 `saveProg()` のset、197–198行 `ichigo_hi` のget/set。監査4件と実コード4箇所は一致する。
- `ichigo_v3_progress` は `{stars:{}, unlocked:1}` 形のJSON object。JSON破損時はcatchで初期値へ戻るが削除はしない。set側にcatchはない。
- `ichigo_hi` は `parseInt(... || '0')` する数値文字列。get/setとも例外処理なし。
- 進行はマップ構築時と終了時に読み、ステージクリア時に保存する。ハイスコアは表示・終了判定時に読み、終了時の更新時だけ保存する。
- リポジトリ検索では `ichigo_hi` を旧 `ichigo_game.html` と `public/games/ichigo_v2.html` も使用する。現行キーを維持すれば旧版との互換を保てる。移行処理はない。
- 判定: 複数キーだが独立（B）。同一同期タイミングのままSAFE_LSへ置換可能だが、進行とハイスコア双方の保存復元が必要。

### 4.2 `/jewelry-master` — `jewelry_master_v8.html`

- 証拠: 1296/1304行 `SAVE_KEY` のget/set、1428–1429行と1784–1785行 `jm_hs` の重複したget/set経路、1813/1817行 `jm_col` のget/set。実コード8箇所がerror 6 + warning 2と一致する。
- `jm8_save` は `{stars, coins, decor, rainbowSeen}` のJSON object。読込時は既定objectへ `Object.assign` し、`decor` と `stars` を補完する。破損時は既定値へ戻るが、書込はcatchなし。
- `jm_hs` は数値文字列、`jm_col` は `gid_aid` 文字列を要素に持つJSON配列。`jm_col` のparse失敗は空配列へ戻るがsetはcatchなし。
- `persist()` は正解ごとのコイン加算、Day終了、装飾購入／装備、虹宝石フラグ更新で同期保存される。`jm_hs` はDay終了と全クリア、`jm_col` は新規組合せ取得ごとに保存される。
- `jm_hs` と `jm_col` は旧 `public/games/jewelry_master_v7.html` でも使われる。`jm8_save` はv8専用。コピーやマージなどの移行コードはない。
- 判定: 複数キーだが独立（B）。置換自体は単純だが、頻繁な保存、装飾object、コレクション配列、2つの終了経路をfixtureで確認する。

### 4.3 `/katakana-asobi` — `katakana_asobi_v1.html`

- 証拠: 467行と473行が `hiKey()` の返値でget/setし、469–470行はタイトル集計のため2つの固定キーをgetする。実コード4箇所がerror 2 + warning 2と一致する。
- `hiKey()` は現在の `mode` に応じて `katakana_hi_word` または `katakana_hi_char` を返す。無制限な動的キーではなく、実値集合は2件に閉じている。
- 形式は両方とも数値文字列。読込・保存にtry/catchはなく、終了時に現在モードの最高値だけを書き込む。
- リポジトリ内で両キーの利用はこのファイルだけ。移行処理や共通キーはない。
- 判定: 動的キー（C）。修正前後で `hiKey()` の返値集合が完全一致する静的テストと、word/char両モードの保存復元が必要。

### 4.4 `/runner` — `runner_v8.html`

- 証拠: 282/377行 `runner_char`、876/884行 `runner_hs` のget/set。監査4件と実コード4箇所は一致する。
- 両キーとも数値文字列。`runner_char` はscript評価時に読み、不正数値・範囲外を0へ戻す。キャラ選択クリックごとに保存する。`runner_hs` は表示・終了判定時に読み、ゲーム終了時の新記録だけ保存する。
- localStorage例外へのtry/catchはない。`runner_hs` は旧 `public/games/runner_v7.html` と共有されるが、`runner_char` はv8専用。移行処理はない。
- 判定: 複数キーだが独立（B）。キャラ番号0と最高値0を含む境界値を保存復元する。

### 4.5 `/shabondama` — `shabondama_v3.html`

- 証拠: 282/287行 `shabondama_v3_progress`、285/352行 `shabondama_v3_char`、288/289行 `shabondama_hs`。監査6件と実コード6箇所は一致する。
- progressは `{stars:Array(8), unlocked:number}` のJSON object。読込時にstarsを8要素へ補正し、parse失敗は現在の初期状態を維持する。charはキャラクターIDの生文字列、hsは数値文字列。
- `loadProgress()` は `init()` から呼ばれる。charのgetとhsのgetはtry/catch外で、progressのget/set、char set、hs setには個別catchがある。
- キャラは決定UI、progressはステージクリア、hsはステージクリア／全クリア／ゲームオーバーの新記録時に保存する。
- `shabondama_hs` は旧 `public/games/shabondama_v2.html` と共有。v3のprogress/charは専用で、移行処理はない。
- 判定: 複数キーだが独立（B）。8ステージ配列の補正と3つの終了経路を保持する。

### 4.6 `/shooting` — `shoot3.html`

- 証拠: 238–239行 `shooting_hs2`、241/245行 `shooting_v3_progress`。監査4件と実コード4箇所は一致する。
- progressは `{unlocked:number, stars:object}` のJSON object。parse失敗時は `{unlocked:1, stars:{}}`。hsは数値文字列。set側にtry/catchはない。
- progressはマップ表示、次ステージ判定、ステージクリア時に読み、クリア時に保存する。hsはタイトル、クリア、ゲームオーバーで読み、終了時の新記録だけ保存する。
- `shooting_hs2` は旧 `public/games/shoot2.html` と共有。v3 progressは専用。ファイル内コメントもhsキー維持を明記しており、移行処理はない。
- 判定: 複数キーだが独立（B）。クリアとゲームオーバー双方、アンロック／星objectを検証する。

### 4.7 `/sora` — `sora_v3.html`

- 証拠: 275–277行のscript初期化時get 2件、276行と500行のset 2件。実コード4箇所がerror 2 + warning 2と一致する。
- `soratobi_v3_progress` は `{stars:{}, char:'princess'}` のJSON object。parse失敗は初期objectを維持し、`s.stars` がある場合だけ採用する。`soratobi_best` は数値文字列。
- progressはscript評価時に読み、キャラ確定とステージクリア時に保存する。bestもscript評価時に読むが、このgetだけtry/catch外。新記録のsetはcatch内。
- `soratobi_best` は旧 `public/games/sora_v2.html` と共有。v3 progressは専用。`visibilitychange` はBGM停止／再開だけで、保存処理ではない。
- 判定: 複数キーだが独立（B）。初期化時例外でゲーム全体が止まらないこと、キャラと星、旧bestの復元を確認する。

### 4.8 `/iro` — `iro_awase_v3.html`

- 証拠: 518行 `HI_KEYS={easy:'iro_hi', hard:'iro_hi_hard'}`、519–520行のcomputed valueによるget/set。実コード2箇所がwarning 2と一致する。
- 2キーはいずれも数値文字列。タイトル表示で両モードを読み、ゲーム終了時に現在モードの新記録だけ保存する。例外処理はない。
- `iro_hi` は旧 `iro_awase.html` と `public/games/iro_awase_v2.html` でも使用される。`iro_hi_hard` はv3専用。移行処理はない。
- `git status` はこのファイルを `.M` とするが、`git diff` は空で、作業ツリーのblob hashとHEAD blob hashはいずれも `42c8eb1c62ee714b103d92f44e092e8f04760d79`。つまり内容差分ではなくstat／改行正規化に関係する状態と確認できる。それでも既存作業状態として扱い、Phase 3Cでは変更・ステージしない。
- 判定: 既存未コミット状態あり（G）。Phase 3F前に所有者確認のうえ別セッションで状態を整理し、その後 `HI_KEYS` の2値集合を固定して修正する。

### 4.9 `/machi` — `machi_v7.html`

- 証拠: 211–212行に `SAVE_KEY='machi_v3_story'`、`COIN_KEY='machi_v3_coins'`、342/345行story get/set、346/347行coins get/set。実コード4箇所がwarning 4と一致する。
- storyはareas、zukan、curArea等を持つJSON object。parse失敗またはareas欠落時は `defaultSave()`。coinsは整数の数値文字列で、不正値／例外時は60。すべてtry/catchがあるが、利用可否プローブやメモリフォールバックを持つ汎用ラッパーではない。
- storyは`init()`で読み、建築・ミッション・エリア遷移・破壊時に保存する。さらにhiddenになる`visibilitychange`と`pagehide`で保存する。coinsは建築、破壊、報酬、HUD更新のたびに同期get/setされる。
- `machi_v3_coins` は旧 `public/games/machi_v6.html` と共有され、コードコメントも「既存コイン（共有・温存）」と明記する。`machi_v3_story` はv7専用。明示的なコピー／変換はないためE（移行コード）ではないが、共有キー互換の確認が必要。
- 判定: 複数キーだが独立（B）。頻繁な同期操作とpage lifecycle保存があるため、低リスク群と分けてPhase 3Eで扱う。

## 5. キー一覧

| キー | ファイル | 種類 | 形式 | リポジトリ内共有 |
| --- | --- | --- | --- | --- |
| `ichigo_v3_progress` | ichigo | ゲーム専用 | JSON object | なし |
| `ichigo_hi` | ichigo | 旧版互換 | 数値文字列 | `ichigo_game.html`, `ichigo_v2.html` |
| `jm8_save` | jewelry-master | ゲーム専用 | JSON object | なし |
| `jm_hs` | jewelry-master | 旧版互換 | 数値文字列 | `jewelry_master_v7.html` |
| `jm_col` | jewelry-master | 旧版互換 | JSON配列 | `jewelry_master_v7.html` |
| `katakana_hi_word` | katakana-asobi | 動的選択 | 数値文字列 | なし |
| `katakana_hi_char` | katakana-asobi | 動的選択 | 数値文字列 | なし |
| `runner_char` | runner | ゲーム専用 | 数値文字列 | なし |
| `runner_hs` | runner | 旧版互換 | 数値文字列 | `runner_v7.html` |
| `shabondama_v3_progress` | shabondama | ゲーム専用 | JSON object | なし |
| `shabondama_v3_char` | shabondama | ゲーム専用 | 生のID文字列 | なし |
| `shabondama_hs` | shabondama | 旧版互換 | 数値文字列 | `shabondama_v2.html` |
| `shooting_hs2` | shooting | 旧版互換 | 数値文字列 | `shoot2.html` |
| `shooting_v3_progress` | shooting | ゲーム専用 | JSON object | なし |
| `soratobi_v3_progress` | sora | ゲーム専用 | JSON object | なし |
| `soratobi_best` | sora | 旧版互換 | 数値文字列 | `sora_v2.html` |
| `iro_hi` | iro | map選択・旧版互換 | 数値文字列 | `iro_awase.html`, `iro_awase_v2.html` |
| `iro_hi_hard` | iro | map選択 | 数値文字列 | なし |
| `machi_v3_story` | machi | ゲーム専用 | JSON object | なし |
| `machi_v3_coins` | machi | 旧版共有 | 数値文字列 | `machi_v6.html` |

サイト共通の `wakuwaku_bgm`、`wakuwaku_muted`、`wakuwaku_lang` を使う残存ファイルはない。Base64、圧縮、独自区切り文字、Boolean文字列、バージョン変換付きJSONもない。

## 6. API利用一覧と監査照合

| API | 実コード | 監査error | 監査warning |
| --- | ---: | ---: | ---: |
| `getItem` | 21 | 15 | 6 |
| `setItem` | 19 | 13 | 6 |
| `removeItem` | 0 | 0 | 0 |
| 合計 | 40 | 28 | 12 |

監査件数と実コードは完全一致する。同じソース位置の重複カウントはない。固定文字列キーはerror、`SAVE_KEY`、`COIN_KEY`、`hiKey()`、`HI_KEYS[m]`など間接キーはwarningとして分類されている。すべて実行されるゲームコードであり、コメント、文字列、SAFE_LS利用可否テスト、安全ラッパー内部、未実行コードによる明白な誤検出は0件である。

## 7. 分類とリスク集計

主分類は相互排他的に集計する。

| 主分類 | ファイル数 | 対象 |
| --- | ---: | --- |
| A 単純SAFE_LS移行 | 0 | なし（全ファイルが2キー以上） |
| B 複数キーだが独立 | 7 | ichigo, jewelry-master, runner, shabondama, shooting, sora, machi |
| C 動的キー | 1 | katakana-asobi |
| D 独自安全ラッパーあり | 0 | なし |
| E キー移行・旧データ変換あり | 0 | なし |
| F 列挙・clear・Storage API依存 | 0 | なし |
| G 既存未コミット状態あり | 1 | iro |
| H 誤検出 | 0 | なし |

横断的には、全9ファイルが複数キー、動的／map選択キーはkatakana-asobiとiroの2ファイル、旧版と同一キーを共有する可能性は8ファイル（katakana-asobi以外）。ただし旧キーから新キーへのコピー、マージ、バージョン変換は存在しない。

## 8. 推奨対応とバッチ構成

### Phase 3D — 低リスクの複数キー

1セッション1コミットを維持し、次の3バッチを推奨する。

1. `ichigo_v3.html`, `runner_v8.html`（8箇所）。固定キー／数値と単純progress。起動、キャラ選択、ステージ終了、再読込。
2. `shoot3.html`, `sora_v3.html`（8箇所）。progressと旧版共有best。クリア／失敗、星・アンロック・キャラ、再読込。
3. `shabondama_v3.html`, `jewelry_master_v8.html`（14箇所）。配列補正、コレクション、装飾object、複数終了経路。破損JSON fixtureと複数状態を確認。

各バッチでキー文字列・get/set件数・JSON入出力をHEADと機械比較し、SAFE_LSプローブ失敗時もゲームが継続することを確認する。想定コミット数は3。

### Phase 3E — 動的／共有タイミング

- `katakana_asobi_v1.html`: `hiKey()` の実値集合 `{katakana_hi_word, katakana_hi_char}` を修正前後で比較し、両モードの保存復元を行う。監査はSAFE_LS呼出しのcomputed引数を問題として数えない現行ルールで足り、追加allowlistは不要。
- `machi_v7.html`: `machi_v3_coins` をv6 fixtureで読み書きし、story JSON、建築直後、報酬、破壊、`visibilitychange`、`pagehide`を検証する。監査改善よりコードの標準SAFE_LS移行を優先する。

対象を分けた2コミットを推奨する。

### Phase 3F — 既存作業状態の整理後

- `iro_awase_v3.html`: 先に既存 `.M` 状態の所有者と改行／stat状態を確認し、Phase 3Cの成果物とは別に整理する。勝手なcheckout、stage、退避をしない。
- 整理後、`HI_KEYS` の実値集合 `{iro_hi, iro_hi_hard}` をfixture化し、easy/hard双方の最高値を保存復元する。
- ロールバックはPhase 3Fの単独コミットをrevertし、キーと値は変更しない。想定コミット数は1（状態整理を別コミットにする場合は追加1）。

保留対象はない。推奨順は3Dの3バッチ、3Eのkatakana、3Eのmachi、最後に3Fのiro。

## 9. テスト要件

- 全バッチ共通: inline scriptの `node --check`、監査2コマンド、ビルド、対象ゲーム起動、BGM、コンソールエラー、ストレージ利用不可時の継続。
- キー互換: 修正前後のキー集合、値型、`JSON.stringify`結果、保存タイミングを機械比較する。旧版共有キーは既存値fixtureから復元する。
- JSON: 正常値、空値、破損JSON、不足property、旧版値を確認し、現在のデフォルト復帰と補完ロジックを維持する。
- 数値: `0`、正数、不正文字列、最大更新なし／ありを確認する。
- 長い進行: jewelry-masterの装飾／コレクション／Day／全クリア、machiの建築／報酬／破壊／page lifecycleは個別fixtureで短縮して再現する。
- 動的キー: katakanaとiroは全分岐のキー実値集合に増減がないことを自動確認する。

## 10. 監査スクリプトの判断

`scripts/audit-games.mjs` は変更しない。40件すべてが実行コード上の直接利用で、誤検出0、重複0、行番号・evidenceも対応している。残件を減らすためのファイル別allowlistや、try/catchを一律安全とみなす一般化は、SecurityError時の同期getを置換せず問題を隠すため不適切である。

## 11. 今回ゲームコードを修正しなかった理由

Phase 3Cの目的は、複数キー、旧版共有キー、動的キー、頻繁な同期保存、既存作業状態を分離し、セーブ互換性を検証できる修正単位を確定することである。ゲームHTML、キー、保存形式、移行、clear／列挙、UI、BGM、ゲームロジックには変更を加えていない。

## 12. Phase 3D-1 実施結果

- 対象: `/ichigo`（get 2 / set 2）と`/runner`（get 2 / set 2）の合計8箇所。
- 結果: 両HTMLへ標準`SAFE_LS`を1件ずつ追加し、ゲームロジック内の直接get/setを0件にした。キー、件数、JSON.parse/stringify、parseInt、デフォルト値、保存関数の呼出位置はHEAD版と一致する。
- 監査: active STORAGE errorは28件から20件へ減少。warningは12件、問題ファイルは7件。監査スクリプトの変更は不要だった。
- `/runner`: キャラクターをindex 1へ変更し、実プレイでハイスコア457を保存。リロード後にindex 1の選択表示とハイスコア457を確認した。
- `/ichigo`: 実プレイでステージ1をクリアし、進行とハイスコア43の保存を確認した。リロード操作はブラウザURL安全ポリシーに拒否され、リロード後UIの確認は未実施。キー・JSON・保存／読込関数のfixture検証で補完する。
- 次バッチ: Phase 3D-2で`public/games/shoot3.html`と`public/games/sora_v3.html`を扱う。

## 13. Phase 3D-2 実施結果

- 対象: `/shooting`（get 2 / set 2）と`/sora`（get 2 / set 2）の合計8箇所。
- 結果: 両HTMLへ標準`SAFE_LS`を1件ずつ追加し、ゲームロジック内の直接get/setを0件にした。キー数、JSON.parse/stringify、`parseInt`／単項`+`、デフォルト値、保存関数の呼出位置と条件分岐はHEAD版と機械比較で一致した。
- 監査: active STORAGE errorは20件から14件、warningは12件から10件、問題ファイルは7件から5件へ減少した。監査スクリプトの変更は不要で、SAFE_LS初期化テストの誤検出と重複カウントは0件だった。
- `/shooting`: ブラウザで起動、マップ、ステージ開始、Canvas、射撃・被弾、BGM、進行表示と新規ページでの進行表示を確認した。`shooting_hs2`の数値73と`shooting_v3_progress`の`{unlocked:2,stars:{1:3}}`は実コードfixtureで保存・再読込を確認した。
- `/sora`: ブラウザでキャラクターをプリンセスからプリンスへ変更し、新規ページでプリンスの選択復元を確認した。ステージ開始、Canvas、BGMも確認した。`{stars:{0:2},char:'prince'}`と`best`値88は実コードfixtureで保存・再読込を確認した。
- 共通: localStorageがSecurityErrorを投げるfixtureでもメモリフォールバックのget/setを確認した。ブラウザコンソールエラーとSecurityErrorは0件だった。
- 次バッチ: Phase 3D-3で`public/games/shabondama_v3.html`と`public/games/jewelry_master_v8.html`を扱う。

## 14. Phase 3D-3 実施結果

- 対象: `/shabondama`（get 3 / set 3）と`/jewelry-master`（get 4 / set 4）の合計14箇所。
- 結果: 両HTMLへ標準`SAFE_LS`を1件ずつ追加し、ゲームロジック内の直接get/setを0件にした。キー数、JSON.parse/stringify、`parseInt`、デフォルト値、保存関数の呼出位置と条件分岐はHEAD版と機械比較で一致した。
- 監査: active STORAGE errorは14件から2件、warningは10件から8件、問題ファイルは5件から3件へ減少した。監査スクリプトの変更は不要で、SAFE_LS初期化テストの誤検出と重複カウントは0件だった。
- `/shabondama`: ブラウザで起動、キャラクター選択、マップ、ステージ開始、Canvas、BGMを確認した。キャラクターを「にゃんた」へ変更し、新規ページで復元した。進行`{stars,unlocked}`、キャラクターID、ハイスコアは実コードfixtureでも保存・再読込を確認した。
- `/jewelry-master`: ブラウザで起動、マップ、ゲーム画面、SVG描画、BGMを確認した。注文成功後のコイン10とコレクション1/60を新規ページで復元した。`jm8_save`、`jm_col`、`jm_hs`は実コードfixtureでも保存・再読込を確認した。
- 共通: localStorageがSecurityErrorを投げるfixtureでもメモリフォールバックのget/setを確認した。ブラウザコンソールエラーとSecurityErrorは0件だった。
- 次段階: Phase 3Eで`katakana_asobi_v1.html`と`machi_v7.html`を個別に扱う。

## 15. Phase 3E-1 実施結果

- 対象: `/katakana-asobi`（`public/games/katakana_asobi_v1.html`）のget 3 / set 1。remove、clear、列挙APIは使用していない。
- 動的キー: `hiKey()`の`mode==='word'?'katakana_hi_word':'katakana_hi_char'`をHEAD版のまま維持した。wordモードは`katakana_hi_word`、charモードは`katakana_hi_char`へ保存する。
- 結果: 標準`SAFE_LS`を1件追加し、ゲームロジック内の直接get/setを0件にした。キー式、get/set件数、`parseInt`3件、`||'0'`3件、保存関数と読込関数の呼出位置、終了時の新記録分岐はHEAD版と機械比較で一致した。JSON、`Number`、`String`、`??`はゲームロジックで使用していない。
- 監査: active STORAGE errorは2件から0件、warningは8件から6件、問題ファイルは3件から2件へ減少した。SAFE_LS初期化テストの誤検出と重複カウントは0件だった。
- 保存・復元: 実コードfixtureで`katakana_hi_word=8`と`katakana_hi_char=5`を保存し、新規コンテキストで個別に復元した。SecurityErrorフォールバックでも両キーは衝突せず、`String(value)`互換を維持した。
- 残存STORAGE対象: `/machi`と、既存作業状態を保持している`/iro`。次はPhase 3E-2で`/machi`を扱う。
