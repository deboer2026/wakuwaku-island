# どうぶつのむら v3 Phase 4 設計

## 目的

村から森・川・海へ移動できる探索基盤を追加する。公開ルートは引き続き `mura_v1.html` であり、v3 は検証用HTMLである。

## 地域とライフサイクル

`currentArea` は `village`、既存の `interior:*`、`forest`、`river`、`beach` を扱う。地域グループは一度だけ構築し、遷移時は可視性を切り替える。村での位置と地域ごとの位置は `exploration.returnPositions` に保存する。

森は木・低木・岩・採集物・宝箱、川は水面・飛び石・橋・水辺の採集物、海は砂浜・海面・桟橋・漂着物を持つ。入退場中にゲームループを増やさず、既存の単一 `requestAnimationFrame` を継続使用する。

## 採集・釣り・クエスト

地域採集物は、既存の平坦な `inv` を壊さない `gathered` に保存する。各ノードは採集時刻を `exploration.nodes` に保存し、ノード定義ごとの待ち時間で再出現する。宝箱は地域ごとの一回限りのノードである。

釣りは時間で往復するゲージに合わせて操作する。成功時だけ `riverFish` を与え、同一ノードのクールダウンを開始する。モーダル終了時はタイマーを停止する。

森・川・海に各2件、計6件の地域クエストを用意する。通常依頼・住民依頼とは別の `exploration.quests` に完了状態を保存し、完了時には対象地域素材を消費してクラウンと探索XPを一度だけ与える。判定対象は現在地域だけで、未解放地域の依頼を先回りで完了しない。

## 保存互換性

schemaVersion 5 以下は `mergeIntoDefaults()` で schemaVersion 6 へ移行する。旧 `inv`、`plots`、`dishes`、住民・室内状態は既存の正規化を維持する。未知のトップレベル項目は `Object.assign` により残る。無効な `currentArea` は村へ戻す。

`gathered`、`exploration.nodes`、`exploration.quests`、`exploration.treasures`、`exploration.returnPositions`、`progression.explorationRank/Xp` を追加する。メモリ保存フォールバック時は再読込後に消える既存SAFE_LS仕様を維持する。

## BGM と照明

共有 `WakuwakuBGM` の実在テーマのみを使う。村は `happy`、森は `forest`、川は `adventure`、海は `ocean` とし、村復帰時は `happy` に戻す。時間帯の既存 sky/light 更新は地域でも継続し、室内扱いにはしない。
