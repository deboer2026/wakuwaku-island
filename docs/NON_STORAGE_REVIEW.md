# Non-Storage Audit Review

Phase 4Bで、Phase 3完了後にactiveゲームへ残る非STORAGE監査問題を分類した。基準日は2026-07-19、基準コミットは`84d1643ec568bfe58156b8c84356dd1fbc21cef8`である。この文書は修正計画であり、ゲームHTML、共通実装、監査ルールには変更を加えていない。

## 1. Executive Summary

- Phase 4C-1完了後、active 39ルートの非STORAGE指摘はerror 32件、warning 61件、合計93件。36ルート・37ファイルに指摘が残る。
- STORAGEはerror 0件、warning 0件、問題ファイル0件を維持した。
- P0は0件。起動不能、主要操作不能、未処理例外、データ破損を監査証拠だけから確定できる指摘はない。
- Phase 4C-1で入力指定4 errorと重複id 2 errorを解消した。残るP1はCanvas文字描画26 errorと戻る操作43 warningで、次はCanvas描画を扱う。
- P2はviewport、safe-area、画面回転の6 error / 17 warning、P3は現在のUIから未参照の登録番号重複1 warningである。
- BGM安全性、パフォーマンス・ライフサイクル、その他カテゴリのactive指摘は0件である。

## 2. Current Audit Totals

| Metric | Value |
| --- | ---: |
| HTML | 64 |
| active | 39 |
| referenced-secondary | 1 |
| archived-or-unused | 24 |
| active error | 32 |
| active warning | 61 |
| active STORAGE error / warning | 0 / 0 |
| 非STORAGE問題ルート | 36 |
| 非STORAGE問題ファイル | 37 |

`node scripts/audit-games.mjs`と`npm run audit:games`はいずれも同じ値を生成し、既存の非STORAGE指摘により終了コード1となった。

## 3. Category Breakdown

分類は監査ルール名ではなく、将来の修正責任範囲を表す。HTMLルールのうちviewportはD、touch-actionはE、重複idはFへ振り分けた。

| Category | Error | Warning | Files | Priority |
| -------- | ----: | ------: | ----: | -------- |
| A. Canvas絵文字・環境依存描画 | 26 | 0 | 5 | P1 |
| B. BGM安全性 | 0 | 0 | 0 | — |
| C. ナビゲーション・親iframe通信 | 0 | 43 | 35 | P1 |
| D. safe-area・画面回転・モバイル表示 | 6 | 17 | 17 | P2 |
| E. タッチ・入力・操作性 | 0 | 0 | 0 | 対応済み |
| F. HTML・アクセシビリティ・メタ情報 | 0 | 1 | 1 | P3 |
| G. パフォーマンス・ライフサイクル | 0 | 0 | 0 | — |
| H. その他 | 0 | 0 | 0 | — |
| **合計** | **32** | **61** | **37（重複除外）** | — |

カテゴリ別Filesはカテゴリ内の一意ファイル数であり、カテゴリ間で同じHTMLを重複して数える。合計行の37は全カテゴリを通した一意ファイル数である。

## 4. Priority Breakdown

| Priority | Error | Warning | Files |
| -------- | ----: | ------: | ----: |
| P0 | 0 | 0 | 0 |
| P1 | 26 | 43 | 35 |
| P2 | 6 | 17 | 17 |
| P3 | 0 | 1 | 1 |
| **合計** | **32** | **61** | **37（重複除外）** |

- P0: 該当なし。実装前のブラウザ再現で起動不能や主要操作不能が確認された場合のみP0へ昇格する。
- P1: Canvas互換と戻る契約。touch-actionと重複idはPhase 4C-1で対応済み。
- P2: viewport、safe-area、回転案内。主に端末固有の表示・操作性で、代替操作が存在する。
- P3: 現行UIから未参照の登録番号重複。実害確認後に修正または監査妥当性を再評価する。

## 5. Route-by-Route Findings

Main categoryは件数の多い分類を基本とし、同数の場合は監査上のerrorまたは構造問題を優先した。Priorityはそのルートに含まれる最高優先度である。

| Route | HTML | Error | Warning | Main category | Priority |
| ----- | ---- | ----: | ------: | ------------- | -------- |
| `/animal-block` | `public/games/doubutsu_block_v3.html` | 1 | 1 | D | P1 |
| `/animal-soccer` | `public/games/soccer_v7.html` | 2 | 2 | A | P1 |
| `/astral-fang` | `public/games/astral_fang_v1.html` | 1 | 3 | D | P1 |
| `/bike` | `public/games/wakuwaku_bike_v3.html` | 8 | 1 | A | P1 |
| `/block` | `public/games/block_kuzushi_v4.html` | 0 | 1 | C | P1 |
| `/doubutsu-puzzle` | `public/games/doubutsu_puzzle_v3.html` | 0 | 1 | C | P1 |
| `/houki` | `public/games/mahou_houki_gp_v5.html` | 3 | 2 | A | P1 |
| `/ichigo` | `public/games/ichigo_v3.html` | 0 | 1 | C | P1 |
| `/iro` | `public/games/iro_awase_v3.html` | 0 | 2 | C | P1 |
| `/jewelry-master` | `public/games/jewelry_master_v8.html` | 0 | 2 | C | P1 |
| `/kakurenbo` | `public/games/kakurenbo_v2.html` | 0 | 2 | C | P1 |
| `/kart` | `public/games/animal_kart_v7.html` | 0 | 3 | D | P1 |
| `/katachi` | `public/games/katachi_awase_v1.html` | 0 | 1 | C | P1 |
| `/katakana-asobi` | `public/games/katakana_asobi_v1.html` | 0 | 2 | C | P1 |
| `/kazu-asobi` | `public/games/kazu_asobi_v3.html` | 0 | 2 | C | P1 |
| `/kokki` | `public/games/flag_quiz_v2.html` | 0 | 2 | C | P1 |
| `/kudamono-catch` | `public/games/kudamono_v2.html` | 0 | 2 | C | P1 |
| `/machi` | `public/games/machi_v7.html` | 11 | 1 | A | P1 |
| `/mahou-meiro` | `public/games/meiro_v6.html` | 0 | 2 | C | P1 |
| `/mahou-nakama` | `public/games/mahou_nakama_v1.html` | 0 | 2 | F | P1 |
| `/moji` | `public/games/moji_asobi_v2.html` | 0 | 2 | C | P1 |
| `/mori` | `public/games/mori_v4.html` | 1 | 2 | D | P1 |
| `/mura` | `public/games/mura_v1.html` | 0 | 0 | — | — |
| `/neko-chou` | `public/games/neko_chou_v1.html` | 0 | 1 | C | P1 |
| `/neon-drive` | `public/games/neon_drive_v1.html` | 1 | 2 | D | P1 |
| `/nurie` | `public/games/nurie_oekaki_v1.html` | 0 | 1 | C | P1 |
| `/okashi-crossing` | `public/games/okashi_crossing.html` | 3 | 2 | A | P1 |
| `/otakara-horihori` | `public/games/otakara_horihori_v1.html` | 1 | 0 | D | P2 |
| `/oukan-monogatari` | `public/games/oukan_monogatari_v1.html` | 0 | 3 | D | P1 |
| `/runner` | `public/games/runner_v8.html` | 0 | 2 | C | P1 |
| `/shabondama` | `public/games/shabondama_v3.html` | 0 | 1 | C | P1 |
| `/shooting` | `public/games/shoot3.html` | 0 | 2 | C | P1 |
| `/sniper` | `public/games/sniper_v3.html` | 0 | 0 | — | — |
| `/sora` | `public/games/sora_v3.html` | 0 | 2 | C | P1 |
| `/sora-kyoshitsu` | `public/games/sora_kyoshitsu_v1.html` | 0 | 0 | — | — |
| `/sushi` | `public/games/sushi_v3.html` | 0 | 1 | C | P1 |
| `/tashizan` | `public/games/tashizan_v2.html` | 0 | 2 | C | P1 |
| `/tokei-yomi` | `public/games/tokei_yomi_v1.html` | 0 | 2 | C | P1 |
| `/usagi-carrot` | `public/games/usagi_carrot_v2.html` | 0 | 1 | C | P1 |
| **合計** | **39 active HTML** | **32** | **61** | — | — |

`/mahou-nakama`のwarning 2件のうち1件は上記active HTML、もう1件は`src/pages/TopPage.jsx:1280`にあるため、問題ファイル総数は問題ルート数より1多い。

## 6. Common Cause Groups

以下はPhase 4B時点の99件を同一ファイル・同一原因でまとめた全件台帳である。対応済み項目も削除せず状態を残す。`file`はファイル全体判定（JSONの`line: null`）、`—`は監査JSONに個別evidenceがないことを表す。各ルートのactive HTMLは前節の表を正とする。

| ID | Route / HTML | Severity / rule | Count | Message | Line | Evidence | Category / priority | Fix scope |
| --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| A1 | `/machi` / `machi_v7.html` | error / CANVAS | 10 | Canvasへ絵文字リテラル | 494, 498, 503, 507, 512, 516, 530, 822, 824, 830 | `fillText`へ🍞、☕、🍰、🌷、🍎、🥕、🕐、🚉、⭐、🔒、👇 | A / P1 | per-game |
| A2 | `/houki` / `mahou_houki_gp_v5.html` | error / CANVAS | 3 | Canvasへ絵文字・記号リテラル | 425, 431, 469 | `fillText`へ💍、◀、▶、✨ | A / P1 | per-game; line 431はfalse-positive候補 |
| A3 | `/okashi-crossing` / `okashi_crossing.html` | error / CANVAS | 3 | Canvasへ絵文字リテラル | 355, 366, 412 | `fillText`へ⚠️、🍬、🍭 | A / P1 | per-game |
| A4 | `/animal-soccer` / `soccer_v7.html` | error / CANVAS | 2 | Canvasへ絵文字リテラル | 560, 574 | `fillText`へ🐻、⚽ | A / P1 | per-game |
| A5 | `/bike` / `wakuwaku_bike_v3.html` | error / CANVAS | 8 | Canvasへ絵文字リテラル | 697, 705, 715, 726, 764, 777, 819, 820 | `fillText`/`strokeText`へ🚀、🪨、🪙、🏁、💦 | A / P1 | per-game |
| C1 | `/kart`, `/astral-fang`, `/kokki`, `/ichigo`, `/kakurenbo`, `/kazu-asobi`, `/machi`, `/houki`, `/mori`, `/neon-drive`, `/oukan-monogatari`, `/bike` / 各active HTML | warning / NAV | 12 | 親ページへの`goBack`メッセージを確認できない | file | `postMessage({type:'goBack'})`を静的検出できない | C / P1 | shared template + per-game |
| C2 | `/block:148`, `/animal-block:727`, `/doubutsu-puzzle:528`, `/iro:883`, `/jewelry-master:1912`, `/katachi:277`, `/katakana-asobi:627`, `/kudamono-catch:867`, `/mahou-nakama:215`, `/mahou-meiro:1089`, `/moji:464`, `/neko-chou:617`, `/nurie:556`, `/okashi-crossing:475`, `/runner:953`, `/shabondama:872`, `/shooting:1216`, `/animal-soccer:708`, `/sora:357,470`, `/sushi:800`, `/tashizan:430`, `/tokei-yomi:673`, `/usagi-carrot:354` / 各active HTML | warning / NAV | 24 | `history.back()`依存 | 記載の各行 | `else history.back()`または`window.history.back()`。うち10件は同じ関数内に親`postMessage`あり | C / P1 | shared template + per-game; 10件はfalse-positive候補 |
| C3 | `/kokki:1079`, `/jewelry-master:1922`, `/kudamono-catch:885`, `/mahou-meiro:1135`, `/runner:957`, `/shooting:1220`, `/animal-soccer:725` / 各active HTML | warning / NAV | 7 | `location`代入依存 | 記載の各行 | `window.location.href='/'` | C / P1 | shared template + per-game |
| D1 | `/astral-fang`, `/animal-block`, `/machi`, `/mori`, `/neon-drive`, `/otakara-horihori` / 各active HTML | error / HTML | 6 | `viewport-fit=cover`なし | file | viewport metaに指定なし | D / P2 | shared template + per-game |
| D2 | `/kart`, `/astral-fang`, `/houki`, `/mori`, `/neon-drive` / 各active HTML | warning / SAFE_AREA | 5 | 固定UIがあるが`safe_area.js`なし | file | 読込を静的検出できない | D / P2 | shared template + per-game |
| D3 | `/iro`, `/kakurenbo`, `/katakana-asobi`, `/kazu-asobi`, `/moji`, `/tashizan`, `/tokei-yomi` / 各active HTML | warning / SAFE_AREA | 7 | `safe_area.js`読込済みだが`--sab`未使用 | file | `--sab`参照を静的検出できない | D / P2 | shared template + per-game |
| D4 | `/okashi-crossing` / `okashi_crossing.html` | warning / SAFE_AREA | 1 | safe-area CSS変数未使用 | file | 対象変数参照を静的検出できない | D / P2 | per-game |
| D5 | `/kart`, `/astral-fang`, `/oukan-monogatari` / 各active HTML | warning / ORIENTATION | 3 | `orientationchange`だけに依存する可能性 | file | resize等との併用を静的検出できない | D / P2 | shared template + per-game |
| D6 | `/oukan-monogatari` / `oukan_monogatari_v1.html` | warning / ORIENTATION | 1 | 固定向き前提だが向き案内なし | file | rotate hintを静的検出できない | D / P2 | per-game |
| E1 | `/doubutsu-puzzle`, `/shabondama`, `/sniper`, `/sushi` / 各active HTML | error / HTML | 4 | `touch-action`指定なし | file | CSS指定を静的検出できない | E / P1 | **対応済み (4C-1)**: `.card`は`manipulation`、操作Canvasは`none` |
| F1 | `/mahou-meiro` / `meiro_v6.html` | error / HTML | 1 | id `char-label`が2回 | 336 | `<div id="char-label">` | F / P1 | **対応済み (4C-1)**: 2見出しを`.option-label`へclass化 |
| F2 | `/sora` / `sora_v3.html` | error / HTML | 1 | id `backBtn`が2回 | 181 | `<button ... id="backBtn">` | F / P1 | **対応済み (4C-1)**: タイトル側を`titleBackBtn`へ変更 |
| F3 | `/mahou-nakama` / `src/pages/TopPage.jsx` | warning / REGISTRY | 1 | `SCHOOL_GAMES`のnum `18`が重複し現UIから未参照 | 1280 | `{ id:'g_katachi', ... num:18 ... }` | F / P3 | audit false positive candidate / per-game config |
| **Phase 4B基準合計** | **37 routes / 38 files** | — | **99** | — | — | — | **38 error / 61 warning** | **6 error対応済み、93件残存** |

## 7. Proposed Fix Phases

各Phaseの基準件数は排他的で、Phase 4B時点の合計38 error / 61 warningになる。4C-1の6 errorは対応済みで、残存は32 error / 61 warningである。FilesとRoutesはPhase内の一意数であり、Phase間では同じルートを再度扱う場合がある。

| Phase | Scope | Routes | Files | Error | Warning | Risk |
| ----- | ----- | -----: | ----: | ----: | ------: | ---: |
| 4C-1 | DOM重複id・touch-action（対応済み） | 6 | 6 | 6 | 0 | 3 |
| 4C-2 | Canvas絵文字・記号描画 | 5 | 5 | 26 | 0 | 4 |
| 4C-3 | 戻る操作・親iframe通信 | 35 | 35 | 0 | 43 | 4 |
| 4C-4 | viewport・safe-area・回転案内 | 17 | 17 | 6 | 17 | 4 |
| 4C-5 | TopPage登録番号の実害確認 | 1 | 1 | 0 | 1 | 2 |
| **合計** | — | — | — | **38** | **61** | — |

| Phase | 対象ルート | 難易度 | 回帰リスク | ブラウザ負荷 | 推奨順 | コミット方針 |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 4C-1 | `/doubutsu-puzzle`, `/shabondama`, `/sniper`, `/sushi`, `/mahou-meiro`, `/sora` | 2 | 3 | 3 | 完了 | 1コミットで限定修正済み |
| 4C-2 | `/machi`, `/houki`, `/okashi-crossing`, `/animal-soccer`, `/bike` | 3 | 4 | 5 | 2 | 描画差が大きいためゲーム単位または2〜3バッチへ分割 |
| 4C-3 | C1〜C3の35ルート | 3 | 4 | 5 | 3 | 戻る契約を先に確定し、5〜8ゲーム程度のバッチへ分割 |
| 4C-4 | `/animal-block`, `/astral-fang`, `/houki`, `/iro`, `/kakurenbo`, `/kart`, `/katakana-asobi`, `/kazu-asobi`, `/machi`, `/moji`, `/mori`, `/neon-drive`, `/okashi-crossing`, `/otakara-horihori`, `/oukan-monogatari`, `/tashizan`, `/tokei-yomi` | 3 | 4 | 5 | 4 | viewport、safe-area、orientationを別コミットへ分割 |
| 4C-5 | `/mahou-nakama`（`TopPage.jsx`） | 2 | 2 | 2 | 5 | 実害確認後、1コミット。監査変更とは分離 |

4C-1は6ファイルの限定修正として完了した。P0は0件のため緊急修正Phaseは設けず、次は4C-2のCanvas描画へ進む。

## 8. False Positive Candidates

今回は監査ルールや除外を変更しない。候補は実装前にブラウザ挙動とルール意図を照合する。

1. C2のうち`/doubutsu-puzzle`, `/iro`, `/katachi`, `/katakana-asobi`, `/moji`, `/nurie`, `/shabondama`, `/sushi`, `/tashizan`, `/tokei-yomi`の10件は、同じ関数内でiframe時に`postMessage({type:'goBack'})`を実行し、standalone時だけ`history.back()`へフォールバックする。親通信不足という意味では候補だが、standaloneの戻り先不定という警告意図は残る。
2. A2の`/houki:431`にある`◀`と`▶`の2件は、カラー絵文字ではなく単色記号として描く意図の可能性がある。ただしCanvasフォント依存は残るため、実機描画確認なしに除外しない。
3. F3の`SCHOOL_GAMES num 18`重複は現在のUIから未参照で、直ちに表示衝突しない可能性が高い。将来参照時の衝突リスクがあるため、仕様確認後に設定修正またはルール妥当性を判断する。

## 9. Validation Requirements

- 全Phase共通: `node scripts/audit-games.mjs`、`npm run audit:games`、インラインscriptの`node --check`、client/SSR build、39ルートプリレンダ。
- 4C-1: 対象DOM取得、戻るボタン、タッチスクロール抑止、主要Pointer/Touch操作を実機相当で確認する。
- 4C-2: Windows、iOS Safari、Android WebView相当でCanvas比較画像を取得し、文字幅・ベースライン・色・拡大率を確認する。
- 4C-3: iframe内、直URL、履歴なし直URLの3経路で戻る先を確認し、親メッセージを1つの契約へ統一する。
- 4C-4: iPhoneノッチ、Android、タブレット、portrait/landscape、resize、orientationchangeを確認する。
- 4C-5: TopPageの現行・将来データ参照箇所を確認し、表示順、番号表示、選択状態に影響がないことを確認する。
- 各PhaseでSTORAGE 0 / 0、保存キー・形式、BGM、ゲームロジックの非変更を維持する。

## 10. Phase 4C-1 Result

- 重複id: `/mahou-meiro`の2見出しを`.option-label`へclass化し、`/sora`のタイトルボタンを`titleBackBtn`へ変更してHUDボタンとイベントを分離した。静的・生成文字列を含む重複idは0件、リテラルID参照は整合した。
- touch-action: `/doubutsu-puzzle`の`.card`へ`manipulation`、`/shabondama`・`/sniper`・`/sushi`の操作Canvasへ`none`を設定した。`html`/`body`には追加せず、既存スクロール領域と入力イベントを変更していない。
- 監査: active error 38→32、warning 61維持。対象6 errorは0、STORAGEは0 / 0、active 39を維持した。
- 検証: 全6インラインscriptの`node --check`、HEAD正規化比較、ID・参照整合、touch-action競合、DOM／イベントfixture 22項目に成功した。
- ブラウザ: ホスト側の開発サーバーは最新HTMLを200で返したが、Browser環境から専用ローカルURLへの接続が拒否されたため実画面操作は未実施。安全制約を迂回せずfixtureで補完した。

## 11. Recommended Next Action

次はPhase 4C-2として、`/machi`、`/houki`、`/okashi-crossing`、`/animal-soccer`、`/bike`のCanvas絵文字・記号描画26 errorをゲーム単位または2〜3バッチへ分割して修正する。
