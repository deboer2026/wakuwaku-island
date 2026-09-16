# どうぶつのむら v3 — Phase 5 設計

## 目的

Phase 1〜4 の既存セーブ、農業、料理、住民、探索を変更せず、図鑑・実績・長期進行を `mura_v3.html` に追加する。公開ルート `/mura` は引き続き `mura_v1.html` を参照する。

## セーブ schemaVersion 7

既存フィールドを保持したまま、次を追加する。

```js
encyclopedia: { entries: {}, newEntries: [], rewards: {} },
achievements: { progress: {}, records: {}, unlocked: {}, rewardsClaimed: {}, mementos: [] },
progression: { villageLevel: 1, villageXp: 0, title: "はじまりの なかま" }
```

図鑑エントリは `id`、`category`、`name`、`description`、`iconType`、`discovered`、`firstDiscoveredAt`、`count`、`bestQuality`、`sourceArea`、`hint` を保持する。未知のトップレベルフィールドは既存の `mergeIntoDefaults()` により保持する。

## 図鑑

- 作物 11、料理 12、採集物、魚、住民 8、宝もの、記念品を実データからカタログ化する。
- `registerDiscovery`、`incrementDiscovery`、`updateDiscoveryBest` を共通入口とし、初回発見、回数、最高品質を記録する。
- カテゴリ切替、あたらしい順／なまえ順、未発見の `？？？`、既読化、25/50/75/100% 報酬を提供する。

## 実績と長期進行

- 実績は農業、料理、交流、探索、図鑑、ひみつの 28 件。達成状態と報酬受取状態を分離する。
- 一度解放・受取済みの実績は、再読み込みや復帰時評価で再報酬しない。
- むらレベルは最大 12。農業・料理・探索・住民・図鑑・実績から XP を得る。
- レベル報酬は一度だけ反映し、称号、クラウン、既存ワードローブ ID の解放を行う。

## 既存イベントとの接続

種まき／収穫、料理完成（★品質を含む）、初会話、依頼、仲良しイベント、地域到着、採集、釣り、宝箱を既存のタイミングのまま共通登録関数へ接続する。常時ループ内で図鑑・実績評価は行わず、状態変更イベント時だけ評価する。

## UI 方針

HUD の 📖 と 🏅 から既存モーダルを再利用して開く。モーダルは Esc と閉じるボタンに対応し、通知はキュー化して重なりを防ぐ。新しい常時 DOM 更新や requestAnimationFrame は追加しない。
