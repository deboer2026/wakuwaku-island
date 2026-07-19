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
