# mura_v3.html Phase 1 監査（基盤・セーブ・v1完全互換）

本監査は、実際に `public/games/mura_v1.html`（2777行）と `public/games/mura_v2.html`（1846行）を
最初から最後まで読んだ上で作成した。ユーザー提供の下書き
`C:\Users\favor\Downloads\MURA_V3_COMPATIBILITY_AUDIT.md` と
`C:\Users\favor\Downloads\CLAUDE_CODE_MURA_V3_FINAL.md` は参照したが、
食い違いがある箇所は §4 に file:line で明記する。

## 1. 今回のスコープ

`CLAUDE_CODE_MURA_V3_FINAL.md` 16節の指示どおり、今回は **Phase 1（基盤・セーブ・v1完全互換）のみ** を実施した。
家の中に入る、村外3地域、料理の多工程化、成長上限の撤廃などは Phase 2 以降であり、
今回の `mura_v3.html` には含めていない（意図的なスコープ外）。

## 2. v1 にあってv3で維持したもの（すべて確認済み）

- 作物5種: ninjin/tomato/ichigo/corn/komugi（mura_v1.html:259-265、時間・lv一致）
- 料理6種: salad/soup/popcorn/omelet/cake/pan（mura_v1.html:266-273、needKomugiフラグ含め一致）
- 住民5体: neko/usagi/kuma/kitsune/panda（mura_v1.html:274-280）
- LEVELS/MAX_LV/MAX_PLOTS_BY_LV/LEVEL_MSG（mura_v1.html:281-290）
- 卵: EGG_INTERVAL=90, EGG_MAX=3（mura_v1.html:291-292）
- TREASURES 4種（mura_v1.html:293-298）
- defaultState() の全フィールド（mura_v1.html:324-341）
- save()/load() の寛容な Object.assign マージパターン（mura_v1.html:343-361）
- ミッション: MISSIONS 18件 + REPEAT_MISSIONS 5件、文言・報酬・条件を一字一句一致（mura_v1.html:404-430）
- missionCatchup()（mura_v1.html:481-491）→ v3の `missionCatchup()` として移植
- startWelcome()（mura_v1.html:2746-2758）→ v3の `showWelcomeBack()` として移植（帰還60秒超・収穫可能数・卵の有無の判定式は同一）
- 8スロットの着せ替えデータ: OUTFITS/HEADS/FACES/NECKS/HANDS/SHOES/PETS/FXS（mura_v1.html:687-759、価格・名称すべて一致）
- 性別選択（prince/princess）、BGM(`WakuwakuBGM`)ガード、`SAFE_LS` シム、`goBack` postMessage 規約

## 3. v2 から素直に流用できたもの（そのまま/軽微な拡張で再利用）

v2は既にv1のデータ層（CROPS/RECIPES/ANIMALS/LEVELS/セーブ形状/ミッション/畑/キッチン/配達/宝探し/レベルアップ）を
かなり忠実に再実装済みであり、これらはv3のベースとしてそのまま採用した。
3D基盤（地形起伏、川と橋、小道、木・花・岩の散布、昼夜サイクル、雲・星・ほたる・窓明かり、
追従カメラ、バーチャルスティック+WASD、動物AI徘徊、パーティクル演出）もv2からそのまま流用。

v2で不足していた部分をv1準拠で追加：

- 着せ替え: v2は outfit/head/pet の3カテゴリしか売買・装着できなかった。v3では FACES/NECKS/HANDS/SHOES/FXS
  を追加し、`WSLOTS` を8スロット構成にして、おようふくやさんのタブ・購入・装着・保存・3Dモデルへの反映を実装した
  （`buildFaceAcc`/`buildNeckAcc`/`buildHandAcc`/靴の色替えを新規追加。fxトレイルは元々 `S.wardrobe.fx` を汎用参照していたため無改修で有効化された）。
- セーブキー: v2は `mura_progress` を v1 と共用していたため上書き事故のリスクがあった。v3は新キー
  `mura_v3_progress` を持ち、旧キーは読み取り専用の移行元にとどめた（§5参照）。
- 復帰時ケア: v2の `bootWorld()` には missionCatchup 相当・おかえりなさい通知がなかった。v3で追加。
- 戻るボタン: v2は `parent.postMessage` のみだったが、iframe外で開かれた場合に備え
  `window.parent !== window` の分岐と `history.back()` フォールバックを追加（v1の記法に統一）。
- orientation postMessage リスナーを追加（v1・v2いずれにも実装がなかったが、指示書の一般規約として追加。害はない）。

## 4. ユーザー下書き監査との相違点（file:line 付き）

1. 下書き §5-1「v2の画面・描画は主に outfit/head/pet に縮小」という指摘は実コードで確認できた
   （mura_v2.html:654 `const CATS = { outfit:..., head:..., pet:... }`）。これは正しい。今回のv3で解消済み。
2. 下書き §7「旧キーは削除しません」との方針は妥当だが、下書きには
   **冪等性（何度読み込んでも二重移行しない）の具体的なガード方法が記載されていない**。
   実装では v3キー (`mura_v3_progress`) が既に存在する場合は移行処理そのものをスキップする
   ガードを `migrateFromLegacyIfNeeded()` に実装した（後述の移行ドキュメント参照）。これは下書きにない具体策であり、
   今回の実装で補完した点として明記する。
3. 下書きは v1 の `missionCatchup()`/`startWelcome()` の存在は把握しているが（§5-6）、
   実際に mura_v1.html:2746 の `startWelcome()` は「離脱60秒超 かつ (収穫可能 or 卵あり)」の場合のみ
   モーダルを出し、それ以外かつ `totalCrowns===0` の場合はヒントを出す、という条件分岐であることまでは
   明記されていなかった。v3の `showWelcomeBack()` はこの条件分岐をそのまま再現している。
4. 下書き §3「着せ替え」一覧は正しくv1の8スロットと一致していることを実コード（mura_v1.html:760-769の`WSLOTS`）で確認した。相違なし。
5. その他、下書きのCROPS/RECIPES/ANIMALS/LEVELSの記述は実コードと完全一致しており、相違点なし。

## 5. 今回作らなかったもの（意図的なスコープ外、Phase 2以降）

- 住民宅・プレイヤー宅・キッチン・お店の「中に入る」室内シーン
- 村外3地域（森・川上・海岸）
- 畑12区画以上・作物10種以上など成長上限の拡張
- 図鑑・実績・ストーリー等の新規進行軸

これらは `CLAUDE_CODE_MURA_V3_FINAL.md` の想定でも Phase 2〜6 に割り振られており、今回のPhase 1では対象外とした。

**訂正（実プレイ検証後）**：当初この節に「料理の複数工程化（切る＋火加減など）」を
スコープ外として記載していたが、これは誤りだった。`CLAUDE_CODE_MURA_V3_FINAL.md` の
Phase 1要件（v1完全互換）は料理の2工程化を含んでおり、実際に `mura_v1.html:2404-2477` の
`startCooking`/`startPanPhase`/`finishCooking` を確認したところ、初回実装は単一の
タイミングゲージ1工程（v2と同じ簡略版）に後退していた。ユーザーによる実プレイ検証の
指摘を受けて、v1と同じ「切る（3タップ）→焼く（ゲージストップ）」の2工程へ書き直した。
詳細は `MURA_V3_PHASE1_TEST_PLAN.md` §3を参照。

## 6. 実プレイ検証で発見・修正したバグ

コード確認のみでは気づけず、実際にブラウザで動かして初めて発覚したバグが2件あった。
詳細な再現手順・修正内容は `MURA_V3_PHASE1_TEST_PLAN.md` を参照。

1. **料理の「焦げ」判定が星評価に反映されない**：書き直した2工程クッキングの
   `finishCook(burnt)` が `burnt` 引数を無視しており、焼きすぎ（自動タイムアウト）でも
   星評価が下がらなかった。`if(!burnt){...スコア計算...}` ガードを追加して修正。
2. **復帰時「おかえりなさい」通知が絶対に表示されない**：`save()` が呼ばれるたびに
   `S.lastSeen` を現在時刻へ上書きする仕様だが、`bootWorld()` 自身と、タイトル画面の
   `startBtn` クリックハンドラの両方が、離脱時間を判定する `showWelcomeBack()` より
   **先に** `save()` を呼んでいたため、離脱時間が常にほぼ0と計算されていた。
   `init()` の `load()` 直後（まだ一度もsaveしていない時点）の `lastSeen` を
   `prevLastSeen` として確保し、`bootWorld(prevLastSeen)` → `showWelcomeBack(prevLastSeen)`
   まで引き回す形に修正。

いずれも「コード上に存在する」だけでは検出できず、実際にlocalStorageを操作して
離脱状態を再現し、実際のUIボタンをクリックする実プレイ検証によって初めて発見できた。

## 7. 着せ替え8カテゴリの3D表示（追加の実ブラウザ確認）

初回検証では face/shoes/fx の3D反映についてコード確認と間接確認に留まっていたため、
追従カメラを撮影直前だけ一時的に無効化する手法（ファイル変更なし。詳細は
`MURA_V3_PHASE1_TEST_PLAN.md` §8参照）で、装着前後の同一アングル比較・斜め角度・
歩行追従・再読み込み後の維持を全カテゴリで明確に目視確認した。

- face（face_maru）：装着前は何もなかった目の位置に、装着後は茶色い丸めがねが明確に出現
- shoes（shoes_red）：装着前の紺色から明確な赤色へ変化。地面への埋没なし、歩行後も追従
- fx（fx_kira）：歩行中に淡い黄色の粒子がプレイヤー位置基準で生成され、モーダルを開いても
  残存し、静止後は自然消滅（残留なし）、`bootWorld()`5連続実行でも多重生成なし
- pet（pet_chou）：実際の歩行移動でプレイヤーへ遅延追従（テレポートではなく滑らかな追従）

## 8. 検証結果

- 抽出した `<script>` ブロックに対して `node --check` を実行し、構文エラーなしを確認した。
- `npm run build` を実行し、成功（`dist/` 一式・SSRプリレンダーとも正常終了）を確認した。
- `npm run audit:games` を実行し、PASSED。`mura_v3.html` に対する新規警告は
  `id "mClose" が6回定義されている`（各モーダルが`openModal()`によるinnerHTML全置換方式のため
  実行時に共存せず実害なし）のみ。
- ビルド後、`package-lock.json` / `reports/game-audit.json` に差分は発生しなかった
  （`reports/game-audit.json` は一時的に差分が出たため `git checkout --` で復元した）。
- `src/games/Mura.jsx` / `src/seo/gameMeta.js` / `src/pages/TopPage.jsx` / `public/games/mura_v1.html` /
  `public/games/mura_v2.html` は一切変更していない。
- git add / commit / push は行っていない。
- 実プレイでの詳細な検証項目・結果は `MURA_V3_PHASE1_TEST_PLAN.md` を参照。

---

# Phase 2 監査（入れる家・室内・住民8体）

対象は「入れる家・室内・住民8体」のみ。畑拡張・料理追加・村外地域・公開ルート切替は
今回のスコープ外（意図的）。設計の詳細は `MURA_V3_PHASE2_DESIGN.md`、実プレイ検証の
詳細は `MURA_V3_PHASE2_TEST_PLAN.md` を参照。

## 9. 実装内容の要約

- 入室先11か所（プレイヤー宅・キッチン・服屋・既存住民5軒・新規住民3軒）を
  データ駆動（`INTERIORS`/`RESIDENTS`）で実装し、単一の巨大if文にはしていない。
- キッチン・服屋の室内アクションは、Phase 1の `openKitchenModal()`/`openShopModal()`を
  **そのまま呼び出す**形で再利用し、料理・着せ替えのロジックを複製していない。
  料理在庫・着せ替え状態は村・室内で単一のまま分裂しない。
- 住民8体（新規：りす/ふくろう/かわうそ）はデータ駆動の`RESIDENTS`に性格・好物・
  会話・個別依頼を定義。仲良し度・移住状態の実体は引き続き`S.friends[id]`のみとし、
  `S.residents[id]`は依頼進行・イベント既読のみを持つ（二重の状態源を作らない設計）。
- セーブは`schemaVersion:4`に更新し、`currentArea`/`buildings`/`residents`/`interiors`を
  追加。Phase 1形式のセーブ（これらのキーが存在しない）でも欠損なく補完されることを
  実ブラウザで確認済み（`MURA_V3_SAVE_MIGRATION.md` §7参照）。

## 10. 実プレイ検証で発見・修正した重大バグ（4件）

実装直後、室内へ入る操作を初めて試したところ、以下が連鎖して発生し、
**ゲームループ全体が停止する**致命的な状態になっていた。コード確認だけでは
気づけず、実際に入室して初めて発覚した。

1. 室内で`scene.fog = null`にした結果、`updateSky()`が毎フレーム
   `scene.fog.color.copy()`で例外を投げ、`tick()`が描画まで到達できなくなっていた
2. 村を隠す処理が`HemisphereLight`/`DirectionalLight`（村・室内共通の照明）まで
   誤って非表示にしており、室内でキャラクターが完全な黒いシルエットになっていた
3. 室内カメラの距離が部屋の奥行きを超え、入口付近で壁の外へ出ていた
4. 壁内への単純クランプ後はカメラがプレイヤーへ約0.2mまで接近したため、
   共通の上方固定ドールハウス視点と最低距離4.4へ置き換えた

3件とも修正し、修正後に実際の入退室・会話・個別依頼・仲良しイベント・
セーブ移行を実ブラウザで確認した。詳細は`MURA_V3_PHASE2_TEST_PLAN.md`を参照。

## 11. Phase 2 検証結果

- `node --check`：OK
- `npm run build`：成功
- `npm run audit:games`：PASSED（新規警告は`id "mClose"`の重複定義のみ、実害なし）
- `package-lock.json` / `reports/game-audit.json`：差分なし
  （`reports/game-audit.json`は一時差分を`git checkout --`で復元済み）
- `src/games/MuraGame.jsx` / `src/seo/gameMeta.js` / `src/pages/TopPage.jsx` /
  `public/games/mura_v1.html` / `public/games/mura_v2.html`：無変更
- git add / commit / push は行っていない。

### 11-1. 最終追加確認

- **実ブラウザ確認**：プレイヤー宅・キッチン・うさぎ宅の入室直後／中央／壁際／
  退出直前で、カメラ接近・壁抜けがなく、家具と出口を判別できる
- **実ブラウザ確認**：Phase 1の着せ替えUIで装備したペットが村と3種類の室内で
  1体だけ表示・追従し、10回入退室と再読み込み後も装備・表示を維持する
- **実ブラウザ確認**：ねこに加えてうさぎ固有イベントが発火し、退出・再入室・
  再読み込みで二重発火しない。固有台詞とギフト棚も維持する
- **コード確認**：残り6住民も固有の`homeOnly[1]`／`giftLabel`を持ち、共通の
  `eventSeen`保存ガードを利用する
- **実ブラウザ確認**：同一のうさぎ宅で朝・昼・夕・夜を比較し、白飛び・暗転・
  ライト増殖がなく、退出後は屋外の時間帯表示へ戻る

---

# Phase 3 監査（畑・作物・多工程料理）

## 12. 実装範囲

- 通常畑を既存6区画から12区画へ拡張し、果樹2区画・ハーブ2区画を追加した。
- 作物は既存5種を維持し、じゃがいも・かぼちゃ・たまねぎ・キャベツ・かおりハーブ・
  りんごを追加して合計11種とした。
- 料理は既存6種の材料・解放条件・`dishes: {id, stars}`形式を維持したまま、
  新規6種を追加して合計12種とした。
- 農業ランクと料理ランクを追加し、区画・種・レシピを段階解放する。
- 8住民の既存の好物・依頼・仲良しイベントは変更せず、新料理の好物候補だけを追加した。

詳細は `MURA_V3_PHASE3_DESIGN.md`、実ブラウザ結果は
`MURA_V3_PHASE3_TEST_PLAN.md` を参照。

## 13. Phase 1・2互換性

- セーブキーは引き続き `mura_v3_progress`。移行元の `mura_progress` は読み取り専用で、
  書き換え・削除を行わない。
- schemaVersion 4の6要素畑データを、先頭6区画の作物・植付時刻・成長ブーストを保ったまま、
  16個の固定ID区画へ正規化できることを実ブラウザfixtureで確認した。
- `inv`、既存料理の星、`friends`、`residents.questDone/eventSeen`を維持する。
- `currentArea`、室内11か所、ペットを含む着せ替え状態、住民依頼・イベント処理には
  Phase 3固有の状態源を追加していない。
- 既存6料理の工程は従来どおり `cut` → `heat` の2工程で、材料・保存形式も変更していない。
- `/mura` の公開ラッパー・SEO・TopPageは変更せず、公開先は引き続き `mura_v1.html`。

## 14. 実ブラウザ確認

- 追加10区画を実際の解放モーダルから購入し、二重購入できないことを確認した。
- 通常畑12区画、果樹2区画、ハーブ2区画で作付け・水やり・成長・収穫を確認した。
- 新作物6種をすべて収穫し、りんごは収穫後も木が残って再成長し、2回目を収穫できた。
- 農業ランク1の経験値11から作付けを行い、ランク2へ上がることを確認した。
- 新料理6種を材料消費から全工程・完成まで操作し、料理ランク1の経験値9から
  既存料理を作ってランク2へ上がることを確認した。
- 工程別結果から★1・★2・★3が得られ、加熱を止めない場合は焦げて★1になることを確認した。
- キャベツ料理を10回連続で完成し、進行停止・操作不能・演出の多重化がないことを確認した。
- りすへ★3の新料理を配達し、料理名が注文に表示され、好物・★3の追加反応と報酬が出た。
- schemaVersion 4 fixtureからschemaVersion 5への移行、通常URLでの起動、保存後の再読込を確認した。
- 100回連続収穫後も区画数16を維持し、同時パーティクルは上限160で制限された。

### 14-1. commit前追加確認

- **実ブラウザ確認**：ポテトスープとりんごパイをキッチン内で完成し、通常カメラから
  料理テーブル上の皿・器／生地・具材／格子・湯気を明確に判別できた。
- **実ブラウザ確認**：★3では金色リングとキラキラが通常評価と区別でき、8秒経過、
  次の料理完成、退出の各経路で古いメッシュが破棄された。再入室時の残留もなかった。
- **実ブラウザ確認**：じゃがいもの途中成長、ハーブとりんごの成熟、おかえり通知2件を確認した。
- **実ブラウザ確認**：りんご収穫後も木の作物IDを維持し、離脱時刻を反映して再成熟した。
- **実ブラウザ確認**：直後の再読込ではおかえり通知が二重表示されず、30日相当の離脱でも
  成長率は1を上限とした。schemaVersion 4の旧plots作物も固定IDへ移行して成熟した。
- 上記一連の通常起動・料理・復帰操作後、ブラウザコンソールerrorは0件だった。

## 15. 変更していない範囲

`src/games/MuraGame.jsx`、`src/seo/gameMeta.js`、`src/pages/TopPage.jsx`、
`public/games/mura_v1.html`、`public/games/mura_v2.html` は変更していない。
森・川・海岸、図鑑・実績、公開ルート切替もPhase 3の対象外である。
