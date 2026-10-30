# わくわくアイランド ゲーム候補レビュー用ステージング

このディレクトリは、わくわくアイランドへ実装する前のゲーム候補（新規ゲーム／既存ゲーム更新案）をレビューするための一時保管場所です。

## 配置ルール

- 対象: HTML プロトタイプ + 対応する Markdown（仕様・設計・指示書など）
- レビュー完了前は `public/games/` に置かない
- 受領時点では原則として元ファイル名を維持する
- 1候補につき HTML と MD を同じサブディレクトリにまとめる

例:

```text
docs/game-candidates/2026-10/
├─ README.md
├─ 01-<candidate-slug>/
│  ├─ <original>.html
│  └─ <original>.md
├─ 02-<candidate-slug>/
│  ├─ <original>.html
│  └─ <original>.md
└─ ...
```

## レビュー時に判定すること

各候補は、以下のいずれかに分類する。

1. **NEW** — 新規ゲームとして追加
2. **UPDATE** — 既存ゲームの次バージョンとして採用
3. **MERGE** — 既存ゲームへ一部機能・演出のみ統合
4. **HOLD** — 重複・品質・技術制約などにより保留

## 実装へ進める場合

レビュー後に採用された HTML のみ `public/games/` へ移し、必要に応じて以下を更新する。

- `src/App.jsx`
- `src/games/*.jsx`
- `src/seo/gameMeta.js`
- `src/pages/TopPage.jsx`

既存ゲーム更新の場合は、旧 HTML を削除せずロールバック用に保持する。

## 主な確認基準

- 3〜8歳向けとして説明なしでも遊べるか
- 既存ゲームとゲーム機構が重複していないか
- Pointer Events / SAFE_LS / safe area / BGM / 戻る導線に適合するか
- iOS WebView で Canvas 絵文字依存がないか
- 3D は Three.js r128 と低負荷端末基準に適合するか
- 既存ゲーム更新ならセーブ互換性を壊さないか

この staging ディレクトリ自体は本番ゲーム配信先ではない。