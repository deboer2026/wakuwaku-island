# ゲーム監査

## 目的

ゲームの正規ルート、トップページ、React ラッパー、ゲーム HTML の登録関係と共通実装を静的に検査し、UI・UX 改善前の基準点を作ります。この監査は既存ゲームを変更するものではありません。

## 実行方法

リポジトリルートで次のいずれかを実行します。

```powershell
node scripts/audit-games.mjs
npm run audit:games
```

実行のたびに `reports/game-audit.json` を上書きします。致命的な不整合が1件以上あれば終了コードは `1`、なければ `0` です。警告だけの場合は `0` です。

## エラーと警告

- エラー: 登録漏れ、参照先ファイルの欠落、無条件の BGM 生成、ゲームロジックからの localStorage 直接利用など、静的に致命的と判断できる問題です。
- 警告: 戻る操作、safe-area、画面向き、変数経由の Canvas 絵文字など、実装意図や実機確認が必要で断定できない問題です。

## 現在の検査項目

- `gameMeta.js`: ルート形式・重複、必須メタデータ、年齢範囲、既知カテゴリ
- `App.jsx`: Route、`GAME_ROUTES`、正規ルートとエイリアス、ゲームラッパー import と利用関係
- `TopPage.jsx`: `GAMES` の route・id・num・category、`GAME_SVGS` の参照整合性
- `src/games/*.jsx`: iframe の参照先、正規 route、ナビゲーション／ブリッジ hook、allow、sandbox
- `public/games/*.html`: Canvas 絵文字、localStorage、WakuwakuBGM、戻る操作、safe-area、画面向き、基本 HTML

## 誤検出の可能性

この監査は Node.js 標準機能だけを使う軽量な静的解析です。動的に組み立てた JSX 属性、変数経由の Canvas 描画、SAFE_LS 初期化テスト、CSS の固定レイアウト、独自の戻る UI や画面向き制御は完全には判定できません。断定できない結果は原則として警告にしています。

## 自動修正について

監査は検出とレポート生成だけを行い、ゲーム HTML、ルート、メタデータ、localStorage キーを自動修正しません。問題は実機確認と影響範囲の整理後に個別対応します。

## 次フェーズ

誤検出の除外ルールとエラー基準を整理し、必要に応じてパーサー精度、ブラウザテスト、共通ゲームシェルの検査を追加します。基準が安定した段階で CI やビルドへの組み込みを検討します。

## JSON レポート

機械可読な結果は `reports/game-audit.json` に出力されます。集計、エラー、警告のほか、各ゲームの登録・ラッパー・HTML の対応状況を `games` に収録します。
