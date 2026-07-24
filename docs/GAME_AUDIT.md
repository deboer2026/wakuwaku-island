# ゲーム監査

## 目的

ゲームの正規ルート、トップページ、React ラッパー、ゲーム HTML の登録関係と共通実装を静的に検査し、UI・UX 改善前の基準点を作ります。この監査は既存ゲームを変更するものではありません。

## 実行方法

リポジトリルートで次のいずれかを実行します。

```powershell
node scripts/audit-games.mjs
npm run audit:games
```

実行のたびに `reports/game-audit.json` を上書きします。公開中の `active` 対象に致命的な不整合が1件以上あれば終了コードは `1`、なければ `0` です。警告だけの場合や、保管HTMLだけに問題がある場合は `0` です。

## HTML の分類

- `active`: `gameMeta.js` の正規ルートから App Route とReactラッパーを経由して、現在参照されているHTMLです。終了コードを決める主監査対象です。
- `referenced-secondary`: 正規ルートではないApp Routeや別ラッパーから参照されるHTMLです。参考結果として扱います。
- `archived-or-unused`: 公開ルートやラッパーから参照されない旧版・試作・保管HTMLです。走査は継続しますが、その問題だけで監査を失敗させません。

## エラーと警告

- エラー: 登録漏れ、参照先ファイルの欠落、無条件の BGM 生成、ゲームロジックからの localStorage 直接利用など、静的に致命的と判断できる問題です。
- 警告: 戻る操作、safe-area、画面向き、変数経由の Canvas 絵文字など、実装意図や実機確認が必要で断定できない問題です。

## 現在の検査項目

- `gameMeta.js`: ルート形式・重複、必須メタデータ、年齢範囲、既知カテゴリ
- `App.jsx`: Route、`GAME_ROUTES`、正規ルートとエイリアス、ゲームラッパー import と利用関係
- `TopPage.jsx`: `GAMES` の route・id・num・category、`GAME_SVGS` の参照整合性
- `src/games/*.jsx`: iframe の参照先、正規 route、ナビゲーション／ブリッジ hook、allow、sandbox
- `public/games/*.html`: Canvas 絵文字、localStorage、WakuwakuBGM、戻る操作、safe-area、画面向き、基本 HTML

localStorage の利用可否を確認する `setItem` → `removeItem` → `return localStorage` 相当のテストや、SAFE_LS初期化内のアクセスは許容します。キーが静的に確定できない直接アクセスは警告、ゲーム用キーの直接アクセスを確定できる場合はエラーにします。

Phase 3Aでは、単一キーかつ少数の直接アクセスだけを持つactiveゲームを第1バッチとして選び、各HTML内のローカル`SAFE_LS`へ移行します。監査レポートの`localStorage`では、activeの問題をファイル数と呼び出し箇所数に分けて集計します。`SAFE_LS`自身の利用可否テストは問題箇所に数えません。保存キー、値形式、読み書きのタイミングは変更しません。

Phase 3Bでは、`block_kuzushi_v4`、`doubutsu_block_v3`、`doubutsu_puzzle_v3`、`flag_quiz_v2`、`kakurenbo_v2`、`mori_v4`、`sniper_v3`、`usagi_carrot_v2`の8件・17箇所を同じ`SAFE_LS`基準へ移行しました。activeのlocalStorage残件はエラー28件・警告12件・9ファイルです。複数キー、キー移行、既存未コミット差分などを含む処理はPhase 3C以降へ残します。

Phase 3Cでは残存9ファイル・40箇所を実コードと照合し、誤検出0件、重複0件を確認しました。ゲームHTMLと監査ロジックは変更せず、複数キー7件、動的キー1件、既存未コミット状態1件に主分類しました。詳細な互換性・リスク評価とPhase 3D〜3Fのバッチ案は [`STORAGE_REVIEW.md`](./STORAGE_REVIEW.md) を参照してください。

Phase 3D-1では`ichigo_v3`と`runner_v8`の2件・8箇所を標準`SAFE_LS`へ移行しました。activeのlocalStorage残件はエラー20件・警告12件・7ファイルです。runnerはキャラクター番号とハイスコアのリロード復元を確認し、ichigoは実プレイでステージ1クリア、進行・ハイスコア保存まで確認しました。ichigoのリロード後UI確認はブラウザURL安全ポリシーで遮断されたため、キー・JSON・呼出経路の静的fixtureで補完し、次のPhase 3D-2は`shoot3`と`sora_v3`を対象とします。

Canvas は `fillText` / `strokeText` の第1引数が絵文字リテラルと確定する場合をエラーにします。絵文字を含む可能性がある変数経由の描画は警告、`textContent` や `innerHTML` などDOM上の絵文字は対象外です。

## 誤検出の可能性

この監査は Node.js 標準機能だけを使う軽量な静的解析です。動的に組み立てた JSX 属性、変数経由の Canvas 描画、SAFE_LS 初期化テスト、CSS の固定レイアウト、独自の戻る UI や画面向き制御は完全には判定できません。断定できない結果は原則として警告にしています。

## 自動修正について

監査は検出とレポート生成だけを行い、ゲーム HTML、ルート、メタデータ、localStorage キーを自動修正しません。問題は実機確認と影響範囲の整理後に個別対応します。

Phase 2の実修正は、`active` ゲームの無条件WakuwakuBGM生成、実際に欠けているReactナビゲーション連携、小さなベクターへ安全に置換できる明白なCanvas絵文字に限定します。localStorage、safe-area、画面向き、戻るUI、主要キャラクターとして使われるCanvas絵文字などの残件は自動修正せず、次フェーズへ回します。

## 次フェーズ

残った警告・エラーの実機確認を進め、必要に応じてパーサー精度、ブラウザテスト、共通ゲームシェルの検査を追加します。基準が安定した段階で CI やビルドへの組み込みを検討します。

## JSON レポート

機械可読な結果は `reports/game-audit.json` に出力されます。集計、エラー、警告、Phase 1との比較のほか、正規ゲームを `games`、全HTMLの分類を `htmlFiles` に収録します。

## Phase 3D-2 実施結果

- 対象: `/shooting`（`public/games/shoot3.html`）と`/sora`（`public/games/sora_v3.html`）の直接localStorage get 4件・set 4件。
- 結果: 両HTMLへ標準`SAFE_LS`を1件ずつ追加し、ゲームロジック内の直接get/setを0件にした。保存キー、JSON構造、数値変換、読込・保存タイミング、分岐は変更していない。
- 監査: active STORAGE errorは20件から14件、warningは12件から10件、問題ファイルは7件から5件へ減少した。active全体はerror 52件・warning 71件で、39ゲームを維持している。
- 保存・復元: `/shooting`はブラウザでマップ進行表示を新規ページでも確認し、`shooting_hs2`と`shooting_v3_progress`は実コードfixtureで保存・再読込を確認した。`/sora`はブラウザでキャラクター変更を新規ページでも復元し、進行JSONと`best`は実コードfixtureで確認した。両ゲームとも起動・Canvas・BGM・SecurityErrorなしを確認した。
- 次バッチ: Phase 3D-3で`public/games/shabondama_v3.html`と`public/games/jewelry_master_v8.html`を扱う。

## Phase 3D-3 実施結果

- 対象: `/shabondama`（`public/games/shabondama_v3.html`）と`/jewelry-master`（`public/games/jewelry_master_v8.html`）の直接localStorage get 7件・set 7件。
- 結果: 両HTMLへ標準`SAFE_LS`を1件ずつ追加し、ゲームロジック内の直接get/setを0件にした。保存キー、JSON構造、数値変換、読込・保存タイミング、分岐は変更していない。
- 監査: active STORAGE errorは14件から2件、warningは10件から8件、問題ファイルは5件から3件へ減少した。active全体はerror 40件・warning 69件で、39ゲームを維持している。
- 保存・復元: `/shabondama`はブラウザでキャラクター変更を新規ページでも復元し、進行JSONとハイスコアは実コードfixtureで確認した。`/jewelry-master`は実プレイでコインとコレクションを保存し、新規ページで復元した。SAVE JSON、コレクション、ハイスコアは実コードfixtureでも確認した。
- 次段階: Phase 3Eで動的キーの`katakana_asobi_v1.html`と、頻繁な同期保存を持つ`machi_v7.html`を個別に扱う。

## Phase 3E-1 実施結果

- 対象: `/katakana-asobi`（`public/games/katakana_asobi_v1.html`）の直接localStorage get 3件・set 1件。
- 動的キー: `mode==='word'?'katakana_hi_word':'katakana_hi_char'`を変更せず維持し、実キー`katakana_hi_word`と`katakana_hi_char`が衝突しないことを確認した。
- 結果: HTMLへ標準`SAFE_LS`を1件追加し、ゲームロジック内の直接get/setを0件にした。数値文字列形式、`parseInt(...||'0')`、読込・保存タイミング、条件分岐は変更していない。
- 監査: active STORAGE errorは2件から0件、warningは8件から6件、問題ファイルは3件から2件へ減少した。active全体はerror 38件・warning 67件で、39ゲームを維持している。
- 保存・復元: 実コードfixtureでword=8、char=5を別キーへ保存し、新規コンテキストから個別に復元した。SecurityError時もword=12、char=3をメモリ上で分離して保存・読込でき、値が文字列化されることを確認した。
- 次段階: Phase 3E-2で`/machi`（`public/games/machi_v7.html`）を扱う。

## Phase 3E-2 実施結果

- 対象: `/machi`（`public/games/machi_v7.html`）。直接localStorage get 2件・set 2件を標準`SAFE_LS`へ移行し、ゲームロジック内の直接アクセスを0件にした。
- 互換性: `machi_v3_story`のJSON objectと、旧`machi_v6.html`とも共有する`machi_v3_coins`の数値文字列を維持した。初期読込、建築・報酬・破壊時の即時コイン更新、画面遷移、`visibilitychange`、`pagehide`の保存順序は変更していない。
- 監査: active STORAGE errorは0件のまま、warningは6件から2件、問題ファイルは2件から1件へ減少した。active全体はerror 38件・warning 63件、active 39件を維持した。
- 保存・復元: fixtureでstory JSONと共有コインを新規コンテキストから復元し、v6形式の数値文字列37の読込と42の書込互換、非表示時のBGM停止→保存、`pagehide`保存でコインが重複増減しないこと、SecurityError時の同一セッション内復元を確認した。
- 残存STORAGE対象は既存差分を保持している`/iro`のみ。次はPhase 3Fで個別に扱う。

## Phase 3F 実施結果

- 対象: `/iro`（`public/games/iro_awase_v3.html`）。開始時は変更扱いだったが、HEAD blobと作業ファイルのハッシュはともに`42c8eb1c62ee714b103d92f44e092e8f04760d79`で、内容差分は0行だった。
- 採用変更: 標準`SAFE_LS`を1件追加し、`getHi()`と`saveHi()`の直接localStorage get 1件・set 1件だけを置換した。除外・復元した既存変更はない。
- 互換性: `iro_hi`と`iro_hi_hard`、数値文字列、`parseInt(...||'0')`、既定値0、タイトル表示時の読込、ゲーム終了時に`score>hi`の場合だけ保存する条件を維持した。
- 監査: active STORAGE error 0件・warning 2件から、error 0件・warning 0件になった。active全体はerror 38件・warning 61件、active 39件を維持し、Phase 3のSTORAGE対応を完了した。
- 保存・復元: fixtureでeasy=8、hard=5を独立保存し、新規コンテキストから復元した。SecurityError時もeasy=7、hard=3を分離して保存・読込でき、null・文字列化・removeItem互換を確認した。

## Phase 4A: Phase 3完了監査（2026-07-19）

- 最終構成: HTML 64件、active 39件、referenced-secondary 1件、archived-or-unused 24件を維持した。
- STORAGEカテゴリ: active error 0件、warning 0件、問題ファイル0件。SAFE_LS初期化テストの誤検出と重複カウントも0件で、Phase 3のactive STORAGE対応を完了とする。
- 実装集計: Phase 3で25ゲーム・74件（get 39、set 35）の直接localStorageアクセスを解消した。現在のactiveではSAFE_LS使用34ゲーム、ストレージ未使用5ゲーム、ゲームロジック内の直接get/set/remove/clear・列挙APIはいずれも0件である。
- SecurityError: SAFE_LS使用34ゲームすべてに、localStorage利用不可時もscriptを継続するメモリ退避経路がある。メモリ値は同一ページセッション内だけ有効で、ページ再読込後に失われることは仕様とする。
- 保存互換性: 既存キー、JSON構造、数値・文字列形式、既定値、読込・保存タイミング、ハイスコア更新条件を維持した。固定キー、複数キー、旧版共有キー、動的キー、ページライフサイクル保存は個別fixtureとHEAD比較で確認した。
- 残る非STORAGE問題: active error 38件（HTML 12、CANVAS 26）、warning 61件（REGISTRY 1、NAV 43、SAFE_AREA 13、ORIENTATION 4）。次のPhase 4Bで優先順位を付ける。
- 運用: 新規ゲームは初回実装からSAFE_LSを使用し、直接localStorageを追加しない。監査、構文検査、正常保存・復元、SecurityErrorフォールバックを登録・変更時の必須確認とする。

## Phase 4B: 非STORAGE問題の分類（2026-07-19）

- activeの非STORAGE指摘38 error / 61 warningを全件分類した。STORAGEは0 / 0を維持している。
- 主な内訳はCanvas描画26 error、戻る操作43 warning、モバイル表示6 error / 17 warning、入力4 error、HTML・メタ2 error / 1 warningである。
- P0は0件、P1は32 error / 43 warning。P2は6 error / 17 warning、P3は1 warningと判定した。
- 詳細なルート別台帳、共通原因、false positive候補、修正単位は`docs/NON_STORAGE_REVIEW.md`を参照する。
- 次はPhase 4C-1として重複idとtouch-actionの6ファイルを限定修正し、その後Canvas、戻る操作、モバイル表示の順に進める。

## Phase 4C-1: 重複ID・touch-action修正（2026-07-19）

- 対象: `/mahou-meiro`、`/sora`の重複id 2件と、`/doubutsu-puzzle`、`/shabondama`、`/sniper`、`/sushi`のtouch-action不足4件を最小差分で修正した。
- ID: `/mahou-meiro`の同種見出しをclass化し、`/sora`のタイトル用とHUD用の戻るボタンを一意IDと独立イベントへ分離した。重複idは0件になった。
- 入力: タップ専用パズルカードへ`touch-action: manipulation`、操作Canvasへ`touch-action: none`を限定設定し、ページ全体、イベントリスナー、`preventDefault`は変更していない。
- 監査: active error 38→32、warning 61維持。STORAGE 0 / 0、active 39を維持した。
- 検証: 全script構文、HEAD正規化比較、ID参照、DOM／イベントfixture 22項目、client/SSRビルド、39ルートプリレンダを確認した。ブラウザ実画面は専用ローカルURLへの接続拒否により未実施で、fixtureで補完した。
- 次はPhase 4C-2として、5ゲームのCanvas絵文字・記号描画26 errorを扱う。

## Phase 4C-2: Canvas環境依存描画の除去（2026-07-23）

- 対象: `/machi`（`public/games/machi_v7.html`）、`/houki`（`public/games/mahou_houki_gp_v5.html`）、`/okashi-crossing`（`public/games/okashi_crossing.html`）、`/animal-soccer`（`public/games/soccer_v7.html`）、`/bike`（`public/games/wakuwaku_bike_v3.html`）。
- 置換: Canvasへ文字として渡していたパン、カップ、ケーキ、花、青果、時計、鉄道、星、鍵、案内、リング、矢印、きらめき、警告、菓子、クマ、ボール、ロケット、岩、コイン、旗、汗をCanvas primitivesによるpathへ置換した。DOM上の絵文字・文言は変更していない。
- 変数経由: `/houki`のステージバッジ・結果星、`/okashi-crossing`の草地装飾、`/animal-soccer`の選択キャラクター、`/bike`のレーサー・フラッシュ・沿道装飾もCanvas文字描画から除外し、対象Unicodeが実行時に`fillText`／`strokeText`へ到達しない構造にした。
- `/houki`判断: 単色の`◀`／`▶`は文字情報ではなく操作方向を示す図形用途と判断し、false positive除外を行わず左右三角形へ置換した。
- 監査: active error 32→6、warning 61維持。Canvas error 26→0、STORAGE 0 / 0、HTML 64、active 39、referenced-secondary 1、archived-or-unused 24を維持した。
- fixture: 5ルート・26分岐相当をmock Canvas contextで実行し、path生成、fill/stroke、有限座標、正サイズ、対象UnicodeのCanvas文字渡し0件、最終save/restore深度0、未処理例外なしを確認した。
- 実画面: 5ルートすべてをローカル開発サーバーで起動し、`/machi`はマップ・ゲーム画面、`/houki`はタイトル・キャラクター選択・プレイ、`/okashi-crossing`・`/animal-soccer`・`/bike`はプレイ画面と主要操作まで確認した。図形は背景と識別でき、UI崩れ、コンソールerror、SecurityErrorはなかった。全ルートでBGM・戻るUIの表示を確認し、`/bike`ではBGM切替操作も確認した。
- 次はPhase 4C-3として、戻る操作・親iframe通信の43 warningを扱う。

## Phase 4C-3A: 戻る操作false positive精査（2026-07-23）

- 対象: Phase 4Bで候補にした`/doubutsu-puzzle`、`/iro`、`/katachi`、`/katakana-asobi`、`/moji`、`/nurie`、`/shabondama`、`/sushi`、`/tashizan`、`/tokei-yomi`の`history.back()`警告10件を精査した。
- 分類: 9件は、同一ハンドラ内でiframe時に正式な`{type:'goBack'}`を送信し、`else`でstandalone時だけ`history.back()`へ進む実装としてA（`resolved-audit-rule`）と判定した。`/shabondama`は`goBack()`が実ボタン・イベントに接続されていないためB（`pending-code-fix`）として警告を維持した。
- 監査一般化: 実行可能scriptの同一関数／ハンドラ内で、iframe判定、正式payload、単一のhistory呼出、`else`／`return`による排他、イベント接続を確認する。コメント・文字列は判定対象外とし、cleanup等を含む複合ハンドラは自動解消しない。route・HTML別allowlistは使用していない。
- 監査: active error 6維持、warning 61→52。NAV 43→34、STORAGE 0 / 0、CANVAS 0、HTML 64、active 39、referenced-secondary 1、archived-or-unused 24を維持した。
- fixture: 許容4パターン、非許容8パターンの12 / 12に成功し、別関数・コメント・DOM文字列の`goBack`、誤payload、無条件history、両経路historyを誤って許可しないことを確認した。
- ゲームHTMLは変更していない。次はPhase 4C-3Bで、親通信未検出、未接続・複合fallback、location代入を含む残存NAV 34 warningを個別に扱う。

## Phase 4C-3C: 戻る導線の設計方針確定・監査再分類（2026-07-24）

- 対象: 実測NAV active warning 36件（4C-3A時点34件から新規ゲーム追加分を含む）を全件、N1（false positive）／N2（HomeChip依存で設計上許容）／N3（未使用コード）／N4（実修正が必要）／N5（用途不明）へ再分類した。ゲームHTML・Reactコードは変更していない。
- 親側仕様確認: `HomeChip`は全39ゲームルートのReactラッパーで無条件に描画される固定戻るボタンで、`postMessage`実装の有無に依存せず単独で機能する。iframeより後（DOM順）に配置されても`z-index:50`の絶対配置でiframeの上に常時表示される。
- 監査一般化: `hasOnlyNavigationCalls`によるハンドラ内呼出の純度制限（`stopBgm()`等のcleanup呼出があると誤検出する原因）を撤廃し、`goBack`と`goHome`いずれの`postMessage`型も正式な親通信実装として認識し、`location`直代入にも`goBack()`と同型の`if/else`排他ガード判定を追加した。route・HTML別のallowlistは使用していない。
- 監査: active error 6維持、warning 52→30。NAV 36→12（N1解消24件、残存はN2 10件・N3 2件）、STORAGE 0 / 0、CANVAS 0、active 39を維持した。
- `/shabondama`: 未接続`goBack()`は案A（現状維持）を採用。既存の可視ボタンは全て「マップへ」用途でありサイトトップ用ボタンが存在しないため、UI変更なしに接続できる先がない。`HomeChip`が機能的に代替しており実害はないため、コード変更は見送った。
- 詳細な36件の分類表、HomeChip依存許容条件、監査方針の比較検討は`docs/NON_STORAGE_REVIEW.md`を参照する。
- 次はPhase 4C-3Dとして、N2/N3として整理した12件について、監査へ「info」重要度階層を追加するかどうかを検討する（今回は追加していない）。
