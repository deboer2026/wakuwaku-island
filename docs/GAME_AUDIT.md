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
