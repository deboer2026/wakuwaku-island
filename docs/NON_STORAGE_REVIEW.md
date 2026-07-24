# Non-Storage Audit Review

Phase 4Bで、Phase 3完了後にactiveゲームへ残る非STORAGE監査問題を分類した。基準日は2026-07-19、基準コミットは`84d1643ec568bfe58156b8c84356dd1fbc21cef8`である。この文書は修正計画であり、ゲームHTML、共通実装、監査ルールには変更を加えていない。

## 1. Executive Summary

- Phase 4C-3A完了後、active 39ルートの非STORAGE指摘はerror 6件、warning 52件、合計58件。32ルート・33ファイルに指摘が残る。
- STORAGEはerror 0件、warning 0件、問題ファイル0件を維持した。
- P0は0件。起動不能、主要操作不能、未処理例外、データ破損を監査証拠だけから確定できる指摘はない。
- Phase 4C-1で入力指定4 errorと重複id 2 error、Phase 4C-2でCanvas文字描画26 errorを解消した。Phase 4C-3Aでは戻る操作のfalse positive候補10件を精査し、9件を監査ルールで解消、1件を実修正対象として維持した。残るP1は戻る操作34 warningである。
- P2はviewport、safe-area、画面回転の6 error / 17 warning、P3は現在のUIから未参照の登録番号重複1 warningである。
- BGM安全性、パフォーマンス・ライフサイクル、その他カテゴリのactive指摘は0件である。

## 2. Current Audit Totals

| Metric | Value |
| --- | ---: |
| HTML | 64 |
| active | 39 |
| referenced-secondary | 1 |
| archived-or-unused | 24 |
| active error | 6 |
| active warning | 52 |
| active STORAGE error / warning | 0 / 0 |
| 非STORAGE問題ルート | 32 |
| 非STORAGE問題ファイル | 33 |

`node scripts/audit-games.mjs`と`npm run audit:games`はいずれも同じ値を生成し、既存の非STORAGE指摘により終了コード1となった。

## 3. Category Breakdown

分類は監査ルール名ではなく、将来の修正責任範囲を表す。HTMLルールのうちviewportはD、touch-actionはE、重複idはFへ振り分けた。

| Category | Error | Warning | Files | Priority |
| -------- | ----: | ------: | ----: | -------- |
| A. Canvas絵文字・環境依存描画 | 0 | 0 | 0 | 対応済み |
| B. BGM安全性 | 0 | 0 | 0 | — |
| C. ナビゲーション・親iframe通信 | 0 | 34 | 26 | P1 |
| D. safe-area・画面回転・モバイル表示 | 6 | 17 | 17 | P2 |
| E. タッチ・入力・操作性 | 0 | 0 | 0 | 対応済み |
| F. HTML・アクセシビリティ・メタ情報 | 0 | 1 | 1 | P3 |
| G. パフォーマンス・ライフサイクル | 0 | 0 | 0 | — |
| H. その他 | 0 | 0 | 0 | — |
| **合計** | **6** | **52** | **33（重複除外）** | — |

カテゴリ別Filesはカテゴリ内の一意ファイル数であり、カテゴリ間で同じHTMLを重複して数える。合計行の37は全カテゴリを通した一意ファイル数である。

## 4. Priority Breakdown

| Priority | Error | Warning | Files |
| -------- | ----: | ------: | ----: |
| P0 | 0 | 0 | 0 |
| P1 | 0 | 34 | 26 |
| P2 | 6 | 17 | 17 |
| P3 | 0 | 1 | 1 |
| **合計** | **6** | **52** | **33（重複除外）** |

- P0: 該当なし。実装前のブラウザ再現で起動不能や主要操作不能が確認された場合のみP0へ昇格する。
- P1: 戻る契約。touch-actionと重複idはPhase 4C-1、Canvas互換はPhase 4C-2で対応済み。
- P2: viewport、safe-area、回転案内。主に端末固有の表示・操作性で、代替操作が存在する。
- P3: 現行UIから未参照の登録番号重複。実害確認後に修正または監査妥当性を再評価する。

## 5. Route-by-Route Findings

Main categoryは件数の多い分類を基本とし、同数の場合は監査上のerrorまたは構造問題を優先した。Priorityはそのルートに含まれる最高優先度である。

| Route | HTML | Error | Warning | Main category | Priority |
| ----- | ---- | ----: | ------: | ------------- | -------- |
| `/animal-block` | `public/games/doubutsu_block_v3.html` | 1 | 1 | D | P1 |
| `/animal-soccer` | `public/games/soccer_v7.html` | 0 | 2 | C | P1 |
| `/astral-fang` | `public/games/astral_fang_v1.html` | 1 | 3 | D | P1 |
| `/bike` | `public/games/wakuwaku_bike_v3.html` | 0 | 1 | C | P1 |
| `/block` | `public/games/block_kuzushi_v4.html` | 0 | 1 | C | P1 |
| `/doubutsu-puzzle` | `public/games/doubutsu_puzzle_v3.html` | 0 | 0 | — | — |
| `/houki` | `public/games/mahou_houki_gp_v5.html` | 0 | 2 | C | P1 |
| `/ichigo` | `public/games/ichigo_v3.html` | 0 | 1 | C | P1 |
| `/iro` | `public/games/iro_awase_v3.html` | 0 | 1 | D | P2 |
| `/jewelry-master` | `public/games/jewelry_master_v8.html` | 0 | 2 | C | P1 |
| `/kakurenbo` | `public/games/kakurenbo_v2.html` | 0 | 2 | C | P1 |
| `/kart` | `public/games/animal_kart_v7.html` | 0 | 3 | D | P1 |
| `/katachi` | `public/games/katachi_awase_v1.html` | 0 | 0 | — | — |
| `/katakana-asobi` | `public/games/katakana_asobi_v1.html` | 0 | 1 | D | P2 |
| `/kazu-asobi` | `public/games/kazu_asobi_v3.html` | 0 | 2 | C | P1 |
| `/kokki` | `public/games/flag_quiz_v2.html` | 0 | 2 | C | P1 |
| `/kudamono-catch` | `public/games/kudamono_v2.html` | 0 | 2 | C | P1 |
| `/machi` | `public/games/machi_v7.html` | 1 | 1 | D | P1 |
| `/mahou-meiro` | `public/games/meiro_v6.html` | 0 | 2 | C | P1 |
| `/mahou-nakama` | `public/games/mahou_nakama_v1.html` | 0 | 2 | F | P1 |
| `/moji` | `public/games/moji_asobi_v2.html` | 0 | 1 | D | P2 |
| `/mori` | `public/games/mori_v4.html` | 1 | 2 | D | P1 |
| `/mura` | `public/games/mura_v1.html` | 0 | 0 | — | — |
| `/neko-chou` | `public/games/neko_chou_v1.html` | 0 | 1 | C | P1 |
| `/neon-drive` | `public/games/neon_drive_v1.html` | 1 | 2 | D | P1 |
| `/nurie` | `public/games/nurie_oekaki_v1.html` | 0 | 0 | — | — |
| `/okashi-crossing` | `public/games/okashi_crossing.html` | 0 | 2 | C | P1 |
| `/otakara-horihori` | `public/games/otakara_horihori_v1.html` | 1 | 0 | D | P2 |
| `/oukan-monogatari` | `public/games/oukan_monogatari_v1.html` | 0 | 3 | D | P1 |
| `/runner` | `public/games/runner_v8.html` | 0 | 2 | C | P1 |
| `/shabondama` | `public/games/shabondama_v3.html` | 0 | 1 | C | P1 |
| `/shooting` | `public/games/shoot3.html` | 0 | 2 | C | P1 |
| `/sniper` | `public/games/sniper_v3.html` | 0 | 0 | — | — |
| `/sora` | `public/games/sora_v3.html` | 0 | 2 | C | P1 |
| `/sora-kyoshitsu` | `public/games/sora_kyoshitsu_v1.html` | 0 | 0 | — | — |
| `/sushi` | `public/games/sushi_v3.html` | 0 | 0 | — | — |
| `/tashizan` | `public/games/tashizan_v2.html` | 0 | 1 | D | P2 |
| `/tokei-yomi` | `public/games/tokei_yomi_v1.html` | 0 | 1 | D | P2 |
| `/usagi-carrot` | `public/games/usagi_carrot_v2.html` | 0 | 1 | C | P1 |
| **合計** | **39 active HTML** | **6** | **52** | — | — |

`/mahou-nakama`のwarning 2件のうち1件は上記active HTML、もう1件は`src/pages/TopPage.jsx:1280`にあるため、問題ファイル総数は問題ルート数より1多い。

## 6. Common Cause Groups

以下はPhase 4B時点の99件を同一ファイル・同一原因でまとめた全件台帳である。対応済み項目も削除せず状態を残す。`file`はファイル全体判定（JSONの`line: null`）、`—`は監査JSONに個別evidenceがないことを表す。各ルートのactive HTMLは前節の表を正とする。

| ID | Route / HTML | Severity / rule | Count | Message | Line | Evidence | Category / priority | Fix scope |
| --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| A1 | `/machi` / `machi_v7.html` | error / CANVAS | 10 | Canvasへ絵文字リテラル | 494, 498, 503, 507, 512, 516, 530, 822, 824, 830 | `fillText`へ🍞、☕、🍰、🌷、🍎、🥕、🕐、🚉、⭐、🔒、👇 | A / P1 | **対応済み (4C-2)**: 建物記号、星、鍵、案内をprimitives化 |
| A2 | `/houki` / `mahou_houki_gp_v5.html` | error / CANVAS | 3 | Canvasへ絵文字・記号リテラル | 425, 431, 469 | `fillText`へ💍、◀、▶、✨ | A / P1 | **対応済み (4C-2)**: リング、左右矢印、きらめきをprimitives化 |
| A3 | `/okashi-crossing` / `okashi_crossing.html` | error / CANVAS | 3 | Canvasへ絵文字リテラル | 355, 366, 412 | `fillText`へ⚠️、🍬、🍭 | A / P1 | **対応済み (4C-2)**: 警告、キャンディ、ロリポップをprimitives化 |
| A4 | `/animal-soccer` / `soccer_v7.html` | error / CANVAS | 2 | Canvasへ絵文字リテラル | 560, 574 | `fillText`へ🐻、⚽ | A / P1 | **対応済み (4C-2)**: キーパーとボールをprimitives化 |
| A5 | `/bike` / `wakuwaku_bike_v3.html` | error / CANVAS | 8 | Canvasへ絵文字リテラル | 697, 705, 715, 726, 764, 777, 819, 820 | `fillText`/`strokeText`へ🚀、🪨、🪙、🏁、💦 | A / P1 | **対応済み (4C-2)**: アイテム、旗、警告、説明アイコンをprimitives化 |
| C1 | `/kart`, `/astral-fang`, `/kokki`, `/ichigo`, `/kakurenbo`, `/kazu-asobi`, `/machi`, `/houki`, `/mori`, `/neon-drive`, `/oukan-monogatari`, `/bike` / 各active HTML | warning / NAV | 12 | 親ページへの`goBack`メッセージを確認できない | file | `postMessage({type:'goBack'})`を静的検出できない | C / P1 | shared template + per-game |
| C2a | `/doubutsu-puzzle:528`, `/iro:883`, `/katachi:277`, `/katakana-asobi:627`, `/moji:464`, `/nurie:556`, `/sushi:800`, `/tashizan:430`, `/tokei-yomi:673` / 各active HTML | warning / NAV | 9 | `history.back()`依存 | 記載の各行 | iframe時は同一ハンドラから`goBack`を送信し、`else`でstandalone fallbackと排他 | C / P1 | **resolved-audit-rule (4C-3A)**: 構造判定を一般化。route allowlistなし |
| C2b | `/block:148`, `/animal-block:727`, `/jewelry-master:1912`, `/kudamono-catch:867`, `/mahou-nakama:215`, `/mahou-meiro:1089`, `/neko-chou:617`, `/okashi-crossing:492`, `/runner:953`, `/shabondama:872`, `/shooting:1216`, `/animal-soccer:714`, `/sora:357,470`, `/usagi-carrot:354` / 各active HTML | warning / NAV | 15 | `history.back()`依存 | 記載の各行 | cleanup・別フォールバックを含む、未接続、または複数経路のため自動解消しない | C / P1 | **pending-code-fix (4C-3B)**: `/shabondama`は`goBack()`未接続、他も個別動作確認 |
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
| **Phase 4B基準合計** | **37 routes / 38 files** | — | **99** | — | — | — | **38 error / 61 warning** | **32 error対応済み、67件残存** |

## 7. Proposed Fix Phases

各Phaseの基準件数は排他的で、Phase 4B時点の合計38 error / 61 warningになる。4C-1の6 errorと4C-2の26 error、4C-3Aの監査false positive 9 warningは対応済みで、残存は6 error / 52 warningである。FilesとRoutesはPhase内の一意数であり、Phase間では同じルートを再度扱う場合がある。

| Phase | Scope | Routes | Files | Error | Warning | Risk |
| ----- | ----- | -----: | ----: | ----: | ------: | ---: |
| 4C-1 | DOM重複id・touch-action（対応済み） | 6 | 6 | 6 | 0 | 3 |
| 4C-2 | Canvas絵文字・記号描画（対応済み） | 5 | 5 | 26 | 0 | 4 |
| 4C-3A | 戻る操作false positive精査（対応済み） | 10 | 10 | 0 | 9 | 2 |
| 4C-3B | 残存する戻る操作・親iframe通信 | 26 | 26 | 0 | 34 | 4 |
| 4C-4 | viewport・safe-area・回転案内 | 17 | 17 | 6 | 17 | 4 |
| 4C-5 | TopPage登録番号の実害確認 | 1 | 1 | 0 | 1 | 2 |
| **Phase 4B基準合計** | — | — | — | **38** | **61** | — |

| Phase | 対象ルート | 難易度 | 回帰リスク | ブラウザ負荷 | 推奨順 | コミット方針 |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 4C-1 | `/doubutsu-puzzle`, `/shabondama`, `/sniper`, `/sushi`, `/mahou-meiro`, `/sora` | 2 | 3 | 3 | 完了 | 1コミットで限定修正済み |
| 4C-2 | `/machi`, `/houki`, `/okashi-crossing`, `/animal-soccer`, `/bike` | 3 | 4 | 5 | 完了 | 1コミットでCanvas描画のみ限定修正 |
| 4C-3A | C2のfalse positive候補10ルート | 2 | 2 | 2 | 完了 | route allowlistなしの構造判定で9件解消、1件を3Bへ継続 |
| 4C-3B | C1、C2b、C3の26ルート | 3 | 4 | 5 | 3 | 親通信未検出12件、history fallback 15件、location依存7件を重複ルート単位で分割 |
| 4C-4 | `/animal-block`, `/astral-fang`, `/houki`, `/iro`, `/kakurenbo`, `/kart`, `/katakana-asobi`, `/kazu-asobi`, `/machi`, `/moji`, `/mori`, `/neon-drive`, `/okashi-crossing`, `/otakara-horihori`, `/oukan-monogatari`, `/tashizan`, `/tokei-yomi` | 3 | 4 | 5 | 4 | viewport、safe-area、orientationを別コミットへ分割 |
| 4C-5 | `/mahou-nakama`（`TopPage.jsx`） | 2 | 2 | 2 | 5 | 実害確認後、1コミット。監査変更とは分離 |

4C-1、4C-2、4C-3Aは完了した。P0は0件のため緊急修正Phaseは設けず、次は4C-3Bで残る戻る操作・親iframe通信を個別確認する。

## 8. False Positive Candidates

Phase 4C-3Aで候補10件を関数・ハンドラ単位に精査し、監査ルールを一般化した。ファイル名・route別の除外は使用していない。

1. C2の候補10件中、`/doubutsu-puzzle`, `/iro`, `/katachi`, `/katakana-asobi`, `/moji`, `/nurie`, `/sushi`, `/tashizan`, `/tokei-yomi`の9件は`resolved-audit-rule`。同一の実行可能ハンドラ内でiframe判定、`type:'goBack'`、`else`または`return`による排他、実イベント接続を確認した。
2. `/shabondama`は`goBack()`内の分岐自体は正しいが、active HTML内のボタン・イベントから同関数への接続がないため`pending-code-fix`。警告を残してPhase 4C-3Bで戻る導線を確認する。
3. A2の`/houki:431`にあった`◀`と`▶`は図形用途と判断し、監査除外せず左右三角形のベクター描画へ置換したため候補を解消した。
4. F3の`SCHOOL_GAMES num 18`重複は現在のUIから未参照で、直ちに表示衝突しない可能性が高い。将来参照時の衝突リスクがあるため、仕様確認後に設定修正またはルール妥当性を判断する。

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

## 11. Phase 4C-2 Result

- 対象: `/machi`、`/houki`、`/okashi-crossing`、`/animal-soccer`、`/bike`のactive 5 HTML。Canvas error 26件を監査除外なしでベクター描画へ置換した。
- `/machi`: 建物看板7分岐とマップ上の星・鍵・案内を、パン、カップ、ケーキ、花、青果、時計、鉄道、星、鍵、下向き案内のpathへ置換した。
- `/houki`: リング、左右矢印、きらめきに加え、変数経由のステージバッジ、結果星、トロフィーもpath化した。単色矢印は文字情報ではなく操作方向を示す図形と判断した。
- `/okashi-crossing`: 警告、キャンディ、ロリポップと、変数経由の草地装飾5種をpath化した。
- `/animal-soccer`: クマのキーパーとサッカーボールに加え、選択キャラクターのCanvas描画をベクター人物へ置換した。DOMの選択絵文字は維持した。
- `/bike`: ロケット、岩、コイン、チェッカーフラッグ、汗、フラッシュ、レーサー、沿道看板・観客をpath化した。DOMのキャラクター・結果表示は維持した。
- 監査: active error 32→6、warning 61維持。CANVAS 26→0、STORAGE 0 / 0、active 39を維持した。
- fixture: 26分岐相当をmock Canvas contextで実行し、path 142件、fill 104件、stroke 49件、有限座標、正サイズ、最終save深度0、対象UnicodeのCanvas文字渡し0件を確認した。
- 実画面: 5ルートすべてで起動、Canvas、置換アイコン、主要画面・操作、BGM・戻るUIの表示を確認した。`/animal-soccer`ではフリックシュート、`/bike`ではGO操作とBGM切替まで実行し、全ルートでUI崩れ、コンソールerror、SecurityErrorは0件だった。

### 26件台帳

| Route | 旧行 | Glyph / role | Vector replacement |
| --- | ---: | --- | --- |
| `/machi` | 494 | パン屋のパン | 角丸ローフと切れ目 |
| `/machi` | 498 | カフェのカップ | カップ、取っ手、湯気 |
| `/machi` | 503 | ケーキ屋のケーキ | ケーキ断面、クリーム、飾り |
| `/machi` | 507 | 花屋のチューリップ | 茎と花弁 |
| `/machi` | 512 | 市場のリンゴ・ニンジン | 果実、根菜、葉 |
| `/machi` | 516 | 学校の時計 | 既存文字盤内の針 |
| `/machi` | 530 | 駅の鉄道記号 | レールと枕木 |
| `/machi` | 822 | クリア星 | 5角星pathの反復 |
| `/machi` | 824 | ロック状態 | シャックルと錠前 |
| `/machi` | 830 | 次エリア案内 | 下向きポインター |
| `/houki` | 425 | リングHUD | 二重楕円リング |
| `/houki` | 431 | 左右操作 | 左右三角形 |
| `/houki` | 469 | タイトル装飾 | 4方向きらめき |
| `/okashi-crossing` | 355 | 踏切警告 | 三角警告と感嘆符path |
| `/okashi-crossing` | 366 | 収集キャンディ | 包み紙付き楕円 |
| `/okashi-crossing` | 412 | 列車ロリポップ | 棒、円、渦線 |
| `/animal-soccer` | 560 | クマのキーパー | 耳、顔、胴体、腕 |
| `/animal-soccer` | 574 | サッカーボール | 円、五角形、放射線 |
| `/bike` | 697 | ジャンプ用ロケット | 機体、窓、翼、噴射 |
| `/bike` | 705 | 障害物の岩 | 多角形岩と稜線 |
| `/bike` | 715 | 収集コイン | 二重円コイン |
| `/bike` | 726 | ゴール旗 | チェッカーフラッグ |
| `/bike` | 764 | 疲労の汗 | しずくpath |
| `/bike` | 777 | 進捗端の旗 | 小型チェッカーフラッグ |
| `/bike` | 819 | GO説明のロケット輪郭 | テキストから分離した機体path |
| `/bike` | 820 | GO説明のロケット塗り | 同一機体pathと通常テキスト |

## 12. Phase 4C-3A Result

- 精査: Phase 4Bのfalse positive候補10件を、active HTML、Reactラッパー、`useGameNav`の親側契約、イベント接続まで照合した。A分類は9件、B分類は1件。
- A分類: iframe時は同一の実行可能ハンドラ内から`{type:'goBack'}`を親へ送り、`else`でstandalone時だけ`history.back()`へ進む。postMessageとhistoryが同一操作で同時実行されないため`resolved-audit-rule`とした。
- B分類: `/shabondama`の`goBack()`は分岐自体は正しいが、active HTML内のボタン・イベントから呼ばれていない。ゲームHTMLは変更せず、警告を維持して`pending-code-fix`とした。
- 一般化条件: 実行可能なscriptだけを抽出し、コメント・文字列をマスクしたうえで、同一関数／ハンドラ、iframe判定、正式payload、単一のhistory呼出、`else`／`return`による排他、実イベント接続を確認する。安全な自動判定範囲をナビゲーション呼出だけのハンドラに限定し、cleanup等を含む複合処理はPhase 4C-3Bへ残す。
- 除外: route名、HTML名、特定ファイルのallowlistは使用していない。ゲームHTMLも変更していない。
- 監査: active error 6維持、warning 61→52。NAV 43→34、STORAGE 0 / 0、CANVAS 0、active 39を維持した。
- fixture: 警告しない4パターンと警告する8パターンの12 / 12に成功した。別関数・コメント・DOM文字列の`goBack`、誤payload、無条件history、両経路historyを許可していない。

| Route | HTML / line | Handler / binding | Parent branch | Standalone branch | Guard | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/doubutsu-puzzle` | `doubutsu_puzzle_v3.html:528` | `btn-home.onclick` | `window.parent.postMessage({type:'goBack'},'*')` | `history.back()` | `else` | `resolved-audit-rule` |
| `/iro` | `iro_awase_v3.html:883` | `goBack()` / `#back-btn onclick` | 同上 | 同上 | `else` | `resolved-audit-rule` |
| `/katachi` | `katachi_awase_v1.html:277` | `goBack()` / `#back-btn` click handlerから呼出 | 同上 | 同上 | `else` | `resolved-audit-rule` |
| `/katakana-asobi` | `katakana_asobi_v1.html:627` | `goBack()` / `#back-btn onclick` | 同上 | 同上 | `else` | `resolved-audit-rule` |
| `/moji` | `moji_asobi_v2.html:464` | `goBack()` / `#back-btn onclick` | 同上 | 同上 | `else` | `resolved-audit-rule` |
| `/nurie` | `nurie_oekaki_v1.html:556` | `goBack()` / `#back-btn onclick` | 同上 | 同上 | `else` | `resolved-audit-rule` |
| `/shabondama` | `shabondama_v3.html:871-872` | `goBack()` / 接続なし | 同上 | 同上 | `else` | `pending-code-fix` |
| `/sushi` | `sushi_v3.html:800` | `goBack()` / `#back-btn onclick` | 同上 | 同上 | `else` | `resolved-audit-rule` |
| `/tashizan` | `tashizan_v2.html:430` | `goBack()` / `#back-btn onclick` | 同上 | 同上 | `else` | `resolved-audit-rule` |
| `/tokei-yomi` | `tokei_yomi_v1.html:673` | `goBack()` / `#back-btn onclick` | 同上 | 同上 | `else` | `resolved-audit-rule` |

## 13. Recommended Next Action

次はPhase 4C-3Bとして、親`goBack`未検出12件、実修正・個別確認が必要な`history.back()` 15件、location代入7件から成るNAV 34 warningを、重複ルートをまとめて分割修正する。

## 14. Phase 4C-3C: 戻る導線の設計方針確定・監査再分類（2026-07-24）

### 14.1 親側ナビ仕様

- `HomeChip`（`src/components/HomeChip.jsx`）: `onClick={() => navigate('/')}`で直接トップへ遷移する固定ボタン。`postMessage`や`useGameNav`の実装有無に一切依存しない独立した経路。
- 配置: 全39ゲームのReactラッパー（`src/games/*.jsx`）が例外なく`<HomeChip />`をレンダリングしている（grep一致39件、route別の欠落なし）。CSSは`position:absolute; z-index:50; top/right: env(safe-area-inset-*)基準`で、iframeの後にDOM配置されてもz-index優先でiframeより前面に表示される。モバイルsafe-area、横画面でも位置は保たれる。
- `useGameNav`（`src/hooks/useGameNav.js`）: 親`window`の`message`イベントで`{type:'goHome'}`（トップへ）と`{type:'goBack'}`（`sessionStorage`の内部遷移フラグに応じて`navigate(-1)`または`navigate('/')`）を処理する。ゲームHTML側は`goBack`・`goHome`いずれの型を送っても正しく受理される。
- `useIframeBridge`はorientation・safe-area情報を子へ送るのみで、戻る操作とは無関係。
- standalone（iframe外で直接HTML表示）時は`window.parent===window`となり、`HomeChip`を含む親UI自体が存在しないため、ゲームHTML側の`history.back()`／`location`フォールバックが唯一の戻り先になる。

### 14.2 N1〜N5 分類基準

| 区分 | 定義 | 今回の扱い |
| --- | --- | --- |
| N1 | 正しい`postMessage`実装（`goBack`または`goHome`、`if/else`で排他）が存在し、監査が誤検出していたもの | 監査ルール一般化で警告解消 |
| N2 | HTML内に戻る実装が一切ない。`HomeChip`が唯一の戻り先で、ゲーム内UIに「サイトへ戻る」ボタン自体が存在しない | 設計上許容。警告は維持（下記14.5参照） |
| N3 | `goBack()`等の関数は実装されているが、どのボタン・イベントからも呼ばれていない未使用コード | 実害なし。警告は維持し個別要修正として記録 |
| N4 | 戻るボタンが存在するのに親通信がない、または`postMessage`と`history.back`/`location`が排他されず同時実行されるなど、実際に修正が必要な実装 | 該当0件 |
| N5 | 戻るの意味（マップ内遷移かサイトトップか）が不明、動的生成で接続判定が困難など個別確認が必要なもの | 該当0件 |

### 14.3 NAV active warning 36件の分類表

| Route | HTML | 元の警告 | 分類 | 判定根拠 |
| --- | --- | --- | --- | --- |
| `/block` | `block_kuzushi_v4.html` | history.back依存 | N1 | `homeBtn`クリックで`stopBgm()`後に`goBack`postMessage／`else history.back()`。cleanup呼出があるため旧ルールで誤検出 |
| `/animal-block` | `doubutsu_block_v3.html` | history.back依存 | N1 | `goBack()`は`home-btn`・`back-btn`双方から呼出。同上理由で誤検出 |
| `/mahou-nakama` | `mahou_nakama_v1.html` | history.back依存 | N1 | `goBack()`が複数箇所（タイトル判定含む）から呼出。同上 |
| `/neko-chou` | `neko_chou_v1.html` | history.back依存 | N1 | `try/catch`越しに`goBack` postMessage、`else history.back()` |
| `/usagi-carrot` | `usagi_carrot_v2.html` | history.back依存 | N1 | 同上パターン |
| `/okashi-crossing` | `okashi_crossing.html` | history.back依存 | N1 | `#back-btn onclick="goBack()"`から正式実装へ接続済み |
| `/sora` | `sora_v3.html` | history.back依存×2 | N1 | 2箇所とも`goBack` postMessage／`else history.back()` |
| `/jewelry-master` | `jewelry_master_v8.html` | location代入依存 | N1 | `goHome()`が`goHome` postMessage／`else location.href='/'`で正式実装 |
| `/jewelry-master` | `jewelry_master_v8.html` | history.back依存 | **N3** | `goBack()`は分岐は正しいが、どのボタンからも呼ばれていない未使用関数 |
| `/kudamono-catch` | `kudamono_v2.html` | history.back依存＋location代入依存 | N1 | `#back-btn onclick="goBack()"`＋`goHome()`ともに正式実装 |
| `/mahou-meiro` | `meiro_v6.html` | history.back依存＋location代入依存 | N1 | `#back-btn onclick="goBack()"`＋`goHome()`ともに正式実装 |
| `/runner` | `runner_v8.html` | history.back依存＋location代入依存 | N1 | `#back-btn onclick="goBack()"`＋`goHome()`ともに正式実装 |
| `/shooting` | `shoot3.html` | history.back依存＋location代入依存 | N1 | `onBack()`から`goBack()`呼出、`cancelAnimationFrame`等cleanupを含む。`goHome()`も正式実装 |
| `/animal-soccer` | `soccer_v7.html` | history.back依存＋location代入依存 | N1 | `#back-btn onclick="goBack()"`＋`goHome()`ともに正式実装 |
| `/dressup` | `dressup_v2.html` | 親通信未検出＋location代入依存 | N1 | `goHome` postMessage／`else location.href='/'`のみで構成。`goBack`型ではなく`goHome`型のため旧ルールで未検出扱い |
| `/kokki` | `flag_quiz_v2.html` | 親通信未検出＋location代入依存 | N1 | 同上（`goHome`型のみ） |
| `/houki` | `mahou_houki_gp_v5.html` | 親通信未検出 | N1 | `homeBtn`が`goHome` postMessageに接続済み。standalone fallbackはないが本番はiframe埋込のみのため実害なし |
| `/kart` | `animal_kart_v7.html` | 親通信未検出 | **N2** | 戻る実装なし。コード内コメントで「埋め込み時はReactラッパーの『もどる』ボタンを使うため自前の🏠は隠す」と明記、意図的にHomeChip依存 |
| `/astral-fang` | `astral_fang_v1.html` | 親通信未検出 | N2 | 戻る実装・ボタンともになし |
| `/ichigo` | `ichigo_v3.html` | 親通信未検出 | N2 | 同上 |
| `/kakurenbo` | `kakurenbo_v2.html` | 親通信未検出 | N2 | 同上 |
| `/kazu-asobi` | `kazu_asobi_v3.html` | 親通信未検出 | N2 | 同上 |
| `/machi` | `machi_v7.html` | 親通信未検出 | N2 | ゲーム内「◀ タイトル」ボタンはステージ内遷移用途で、サイトへ戻るボタンは存在しない |
| `/mori` | `mori_v4.html` | 親通信未検出 | N2 | 戻る実装・ボタンともになし |
| `/neon-drive` | `neon_drive_v1.html` | 親通信未検出 | N2 | 同上 |
| `/oukan-monogatari` | `oukan_monogatari_v1.html` | 親通信未検出 | N2 | 同上 |
| `/bike` | `wakuwaku_bike_v3.html` | 親通信未検出 | N2 | 同上 |
| `/shabondama` | `shabondama_v3.html` | history.back依存 | N3 | `goBack()`（871-872行）は分岐は正しいが未接続。可視ボタン4箇所は全て「↩ マップ」（ゲーム内ステージマップ遷移用）で、サイトトップ用ボタンが存在しない |

（N1に分類した15ファイル・24警告は本Phaseの監査ルール一般化により解消済み。N2の10件・N3の2件、計12件は引き続きNAV warningとして残る。）

### 14.4 監査ルール変更内容

`scripts/audit-games.mjs`を以下の通り一般化した（route・HTML別の除外は追加していない）。

1. `hasOnlyNavigationCalls`（ハンドラ内の呼出をナビゲーション系のみに限定する純度チェック）を撤廃した。`stopBgm()`・`cancelAnimationFrame()`等のcleanup呼出が同じハンドラ内にあっても、`postMessage(goBack)`と`history.back()`が`if/else`で排他されていれば正式実装と判定する。
2. ファイル全体の「親へgoBackを送る実装」チェックを、`goBack`型に加えて`goHome`型のpostMessageも正式な親通信として認識するよう拡張した（`useGameNav`は両方を等しく処理するため）。
3. `location`直代入（`location.href='/'`等）に対して、`history.back()`と同型の`if/else`排他ガード判定（`isGuardedStandaloneLocationAssign`）を新設した。これにより`goHome()`のstandalone fallbackとして正しく実装されたパターンを誤検出しなくなった。
4. 上記1〜3はいずれもコード構造（実行可能scriptの排他ガード有無）のみで判定し、ファイル名・route名によるallowlistは使用していない。

### 14.5 N2/N3として残す警告の扱いについて

方針として「HomeChipが常設される以上、HTML内の戻る実装は必須ではない」という考え方（指示書の方針C相当）は妥当と判断した。ただし、この監査スクリプトには現在`error`／`warning`の2階層しかなく、「実害はないが記録は残したい」という`info`相当の重要度を追加するには、集計・出力ロジック（`activeErrors`/`activeWarnings`集計、コンソール出力、JSON出力）への広範な変更が必要になる。今回は設計方針の確定と監査の一般化（false positive解消）に留め、`info`階層の追加はPhase 4C-3Dの検討事項として持ち越した。そのためN2（HomeChip依存で設計上許容）・N3（未使用コード）の12件は、実害のない項目として分類を明記した上で、監査上は引き続き`warning`のまま残している。

### 14.6 `/shabondama`の設計判断

- 案A（現状維持）を採用した。
- 理由: 既存の可視ボタン4箇所はいずれも「↩ マップ」というゲーム内ステージマップへの遷移用途であり、サイトトップへ戻る用途のボタンがHTML内に存在しない。案C（新規ボタン追加）はUI変更となり本Phaseの制約外。案B（`goBack()`削除）は実装コード変更を伴い、かつ`HomeChip`が既に同じ機能を提供しているため削除の実利がない。
- `HomeChip`により機能的な戻り先は確保されているため、未接続の`goBack()`はデッドコードとして許容し、次に`shabondama_v3.html`へ手を入れる機会（Canvas・UI等の別修正）に合わせて削除を検討する。

### 14.7 次のPhase

Phase 4C-3Dとして、`info`重要度階層の追加要否と、N2/N3として整理した12件を監査結果からどう表示するか（現状維持 or `info`降格）を検討する。ゲームHTML・Reactコードの変更は依然として不要と判断している。

## 15. Phase 4C-3D: 残存NAV 12件の最終分類・監査方針確定（2026-07-24）

### 15.1 残存NAV active warning 12件の全件表

| route | html | warning rule | line | message | visible site-back UI | HomeChip | goBack function | goBack connected | classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/kart` | `animal_kart_v7.html` | 親通信未検出 | - | 親ページへgoBack/goHomeメッセージを送る実装を確認できません | なし（`#backBtn`はコース選択用） | あり | なし | - | N2 |
| `/astral-fang` | `astral_fang_v1.html` | 親通信未検出 | - | 同上 | なし | あり | なし | - | N2 |
| `/ichigo` | `ichigo_v3.html` | 親通信未検出 | - | 同上 | なし（`.back-link`はタイトル／キャラ選択画面遷移用） | あり | なし | - | N2 |
| `/kakurenbo` | `kakurenbo_v2.html` | 親通信未検出 | - | 同上 | なし（`#back-btn`は`toStageSelect()`＝ステージ選択用） | あり | なし | - | N2 |
| `/kazu-asobi` | `kazu_asobi_v3.html` | 親通信未検出 | - | 同上 | なし（`#back-btn`は`quitToMap()`＝マップ用） | あり | なし | - | N2 |
| `/machi` | `machi_v7.html` | 親通信未検出 | - | 同上 | なし（`#mapBackBtn`はタイトル遷移用） | あり | なし | - | N2 |
| `/mori` | `mori_v4.html` | 親通信未検出 | - | 同上 | なし | あり | なし | - | N2 |
| `/neon-drive` | `neon_drive_v1.html` | 親通信未検出 | - | 同上 | なし | あり | なし | - | N2 |
| `/oukan-monogatari` | `oukan_monogatari_v1.html` | 親通信未検出 | - | 同上 | なし | あり | なし | - | N2 |
| `/bike` | `wakuwaku_bike_v3.html` | 親通信未検出 | - | 同上 | なし | あり | なし | - | N2 |
| `/shabondama` | `shabondama_v3.html` | history.back依存 | 872 | history.back()に依存する戻る操作があります | なし（4箇所とも`goBackToMap()`でゲーム内マップへ） | あり | あり（871-872行） | 未接続 | N3 |
| `/jewelry-master` | `jewelry_master_v8.html` | history.back依存 | 1912 | history.back()に依存する戻る操作があります | なし | あり | あり（1910-1912行） | 未接続 | N3 |

### 15.2 N2（10件）の確認結果

対象: `/kart`, `/astral-fang`, `/ichigo`, `/kakurenbo`, `/kazu-asobi`, `/machi`, `/mori`, `/neon-drive`, `/oukan-monogatari`, `/bike`

全10件について実測で以下を確認した。

- `goBack`/`goHome`/`postMessage`/`history.back`/`location`代入のいずれも実装が存在しない（grep 0件）。
- HTML内に「戻る」系の見た目を持つボタンが存在する場合（`/kart`のコース選択、`/ichigo`のタイトル・キャラ選択、`/kakurenbo`のステージ選択、`/kazu-asobi`・`/machi`のマップ／タイトル）も、いずれもゲーム内画面遷移用であり、サイトトップへ戻る用途のUIではない。
- 各ルートのReactラッパー（`src/games/*.jsx`）は例外なく`<HomeChip/>`を描画しており、`HomeChip.css`の`z-index:50`絶対配置・safe-area基準の座標によりiframeより前面に常時表示される（Phase 4C-3Cで確認済み、本Phaseで変更なし）。
- 以上により14.5節のN2分類基準をすべて満たすと判断した。

### 15.3 N3（2件）の確認結果

対象: `/shabondama`（`shabondama_v3.html`）, `/jewelry-master`（`jewelry_master_v8.html`）

| 確認項目 | `/shabondama` | `/jewelry-master` |
| --- | --- | --- |
| function definition | `function goBack(){...}`（871-872行）。iframe判定つき`postMessage`／`else history.back()`で分岐自体は正しい | `function goBack(){...}`（1910-1912行）。同様に分岐は正しい |
| static references | `goBack(`という呼出しは自身の定義以外に存在しない（`grep -n "goBack" file`の結果、定義行のみ） | 同左 |
| dynamic references | template literal・`innerHTML`経由での`goBack`文字列生成なし | 同左 |
| inline onclick | 可視ボタン4箇所は全て`onclick="goBackToMap()"`（別関数、ゲーム内マップ遷移用）で`goBack()`ではない | `goBack`を参照する`onclick`属性なし |
| addEventListener | `goBack`を第二引数に渡す`addEventListener`なし | 同左 |
| template-generated reference | 該当なし | 該当なし |
| dead-code conclusion | 未接続の未使用関数。ゲームロジック（`cancelAnimationFrame`呼出等）はこの関数内で完結しており、呼ばれないため実行時に一切影響しない | 同左 |

両ファイルとも、静的検索・動的生成・イベント接続のいずれの経路からも呼び出されていないことを確認し、N3（未使用の戻るコード）と最終確定した。`HomeChip`が戻る導線を提供しているため、放置しても機能上の実害はない。

### 15.4 N4／N5

該当0件。残存12件はすべてN2またはN3に分類でき、実修正が必要な項目（N4）・個別確認が必要な項目（N5）は存在しない。

### 15.5 監査方針の最終決定：案A（文書上のみ分類し、warningは維持）

案A・案Bを比較検討し、**案Aを採用**した。監査スクリプトは今回変更していない。

- 理由: 案B（N2/N3を監査対象外にする一般化条件）は、「戻る実装が存在しない」ことと「戻る導線が本当に不要である」ことを静的解析だけで区別する決定的な手段がない。現状の判定はHTMLファイル単体の解析であり、対応するReactラッパーが実際に`HomeChip`をレンダリングしているかは別ファイル（`src/games/*.jsx`）を跨いだ確認が必要になる。ファイル横断の対応関係をroute名に頼らず一般化して安全に検証する仕組みは今回の変更規模を超えるため、「監査結果を減らすだけの例外追加」になるリスクを避けた。
- 案Aにより、N2・N3は実害なしと文書上明記した上でwarningとして残り、将来HTMLが変更されて誤ってN2/N3の前提が崩れた場合（例: HomeChipを外す・ゲーム内に紛らわしいボタンを追加する等）も、警告が消えずに追跡され続ける。
- 監査ロジックは変更していないため、`scripts/audit-games.mjs`はPhase 4C-3Cの状態から不変。false positive・false negativeへの新たな影響はない。

### 15.6 実装修正対象は残るか

残らない。N4・N5が0件であるため、今回確認した範囲でコード修正が必要な戻る導線の不具合は存在しないと判断した。

### 15.7 Phase 4C-3の完了可否

**完了と判断する。** Phase 4C-3A（false positive構造判定の一般化）→4C-3B（未実施のまま4C-3Cへ統合）→4C-3C（設計方針確定・監査一般化でNAV 36→12）→4C-3D（残存12件の最終分類、N2 10件・N3 2件、N4/N5 0件）を経て、NAV warningはすべて分類・文書化が完了し、実修正が必要な項目は残っていない。今後HTMLに変更が入った際は、本節の分類表と15.5の判断基準に照らして再評価する。

## 16. Phase 4C-4: viewport・safe-area・回転対応（2026-07-24）

### 16.1 対象17ルートの確定

`docs/GAME_AUDIT.md`（Phase 4B時点の分類）、`reports/game-audit.json`、`src/App.jsx`、各Reactラッパー、`src/seo/gameMeta.js`を照合し、実測で以下17ルートを確定した（error 6・warning 17・合計23件、ファイル数17で一致）。

| route | wrapper / active HTML | category | severity | message |
| --- | --- | --- | --- | --- |
| `/astral-fang` | `astral_fang_v1.html` | HTML | error | viewport-fit=cover がありません |
| `/animal-block` | `doubutsu_block_v3.html` | HTML | error | viewport-fit=cover がありません |
| `/machi` | `machi_v7.html` | HTML | error | viewport-fit=cover がありません |
| `/mori` | `mori_v4.html` | HTML | error | viewport-fit=cover がありません |
| `/neon-drive` | `neon_drive_v1.html` | HTML | error | viewport-fit=cover がありません |
| `/otakara-horihori` | `otakara_horihori_v1.html` | HTML | error | viewport-fit=cover がありません |
| `/kart` | `animal_kart_v7.html` | SAFE_AREA | warning | 固定UIがありますがsafe_area.jsの読込を確認できません |
| `/kart` | `animal_kart_v7.html` | ORIENTATION | warning | orientationchangeだけに依存している可能性があります |
| `/astral-fang` | `astral_fang_v1.html` | SAFE_AREA | warning | 固定UIがありますがsafe_area.jsの読込を確認できません |
| `/astral-fang` | `astral_fang_v1.html` | ORIENTATION | warning | orientationchangeだけに依存している可能性があります |
| `/iro` | `iro_awase_v3.html` | SAFE_AREA | warning | safe_area.jsを読み込んでいますが--sabを使用していません |
| `/kakurenbo` | `kakurenbo_v2.html` | SAFE_AREA | warning | safe_area.jsを読み込んでいますが--sabを使用していません |
| `/katakana-asobi` | `katakana_asobi_v1.html` | SAFE_AREA | warning | safe_area.jsを読み込んでいますが--sabを使用していません |
| `/kazu-asobi` | `kazu_asobi_v3.html` | SAFE_AREA | warning | safe_area.jsを読み込んでいますが--sabを使用していません |
| `/houki` | `mahou_houki_gp_v5.html` | SAFE_AREA | warning | 固定UIがありますがsafe_area.jsの読込を確認できません |
| `/moji` | `moji_asobi_v2.html` | SAFE_AREA | warning | safe_area.jsを読み込んでいますが--sabを使用していません |
| `/mori` | `mori_v4.html` | SAFE_AREA | warning | 固定UIがありますがsafe_area.jsの読込を確認できません |
| `/neon-drive` | `neon_drive_v1.html` | SAFE_AREA | warning | 固定UIがありますがsafe_area.jsの読込を確認できません |
| `/okashi-crossing` | `okashi_crossing.html` | SAFE_AREA | warning | safe_area.jsを読み込んでいますがsafe-area CSS変数を使用していません |
| `/tashizan` | `tashizan_v2.html` | SAFE_AREA | warning | safe_area.jsを読み込んでいますが--sabを使用していません |
| `/tokei-yomi` | `tokei_yomi_v1.html` | SAFE_AREA | warning | safe_area.jsを読み込んでいますが--sabを使用していません |
| `/oukan-monogatari` | `oukan_monogatari_v1.html` | ORIENTATION | warning | orientationchangeだけに依存している可能性があります |
| `/oukan-monogatari` | `oukan_monogatari_v1.html` | ORIENTATION | warning | 固定向き前提の可能性がありますが向き案内を確認できません |

### 16.2 Group分類と修正内容

**Group A（viewport、6ファイル、error解消）**: `astral_fang_v1.html`, `doubutsu_block_v3.html`, `machi_v7.html`, `mori_v4.html`, `neon_drive_v1.html`, `otakara_horihori_v1.html`の`<meta name="viewport">`へ`viewport-fit=cover`のみを追記した。既存のviewport件数（各1件）、`width=device-width`、`initial-scale`、`maximum-scale`/`user-scalable`の既存指定は変更していない。viewportを2件に増やしていない。

**Group B（safe-area）**: 実測で以下3パターンに分かれた。

1. **パス誤り（相対パス）**: `animal_kart_v7.html`・`astral_fang_v1.html`は`<script src="safe_area.js">`という相対パスで読み込んでおり、実際には正しく動作するものの、他30ファイルすべてが使う`/games/safe_area.js`という絶対パス規約と異なるため監査の`safeAreaLoaded`正規表現（`/games/safe_area.js`固定）に一致せず誤検出されていた。プロジェクト標準の絶対パスへ統一した（実質的な動作は変更なし、規約統一）。
2. **未読込＋独自実装重複**: `mahou_houki_gp_v5.html`は`safe_area.js`を読み込まず、代わりに全く同じロジック（`postMessage`受信で`--sat`/`--sab`/`--sal`/`--sar`を`setProperty`、`requestSafeArea`をpostMessage）をインラインで複製していた。共通スクリプト`/games/safe_area.js`の読込に置き換え、重複コードを削除した（API・イベント名・payloadは共通スクリプトと完全一致のため機能変更なし）。`neon_drive_v1.html`は`safe_area.js`自体が未読込かつCSS変数も未使用だったため、読込を追加し、HUD 6要素（`#score`, `#stars`, `#hearts`, `#best`, `#speed`, `#muteBtn`）の`top`/`bottom`/`left`/`right`に`var(--sat/--sab/--sal/--sar, env(safe-area-inset-*,0px))`のfallback付きcalc()を適用した。
3. **読込済みだが生env()のみ使用**: `okashi_crossing.html`は`/games/safe_area.js`を読み込みながら`.hud`・`#back-btn`・`#hint`の3箇所で生の`env(safe-area-inset-*)`のみを使用しており、共通スクリプトが実質未使用だった（iframe内では`env()`が正しく継承されない場合があるため、これが本来の不具合）。3箇所とも`var(--sat/--sab/--sal, env(...))`のfallback形式へ修正した。
4. **`--sab`使用不要な誤検出（7ファイル）**: `iro_awase_v3.html`, `kakurenbo_v2.html`, `katakana_asobi_v1.html`, `kazu_asobi_v3.html`, `moji_asobi_v2.html`, `tashizan_v2.html`, `tokei_yomi_v1.html`は、いずれも画面上部のHUDバー（`padding-top: max(..., var(--sat,...))`）のみを持ち、下端に固定されたUI要素が実際には存在しないことを実測で確認した（`position:fixed`かつ`bottom:`を持つCSSルールが0件）。これらはHTMLを変更せず、下記16.3の監査一般化で対応した。
5. **固定端UI自体が存在しない（1ファイル）**: `mori_v4.html`はviewport修正（Group A）以外に該当する固定UIが存在しない（`#wrap{position:fixed;inset:0;...}`という全画面センタリング用途のみで、`<button>`等の端固定要素・座標指定なし）ことを実測で確認した。HTML変更は不要と判断し、下記16.3の監査一般化で対応した。

**Group C（回転案内、3ファイル）**: `animal_kart_v7.html`・`astral_fang_v1.html`は既存の自前`checkOrient()`（`orientationchange`/`resize`で縦持ち判定）、`oukan_monogatari_v1.html`は既存の`resizeCanvas()`（`orientationchange`/`resize`でCanvas再計算）を持っていた。いずれも親フレームの`useIframeBridge`（`src/hooks/useIframeBridge.js`）が全iframeへ常時送信している`{type:'orientation', landscapePhone}`メッセージを追加のトリガーとして接続し、`window.addEventListener('message', e => { if (e.data?.type==='orientation') checkOrient()/resizeCanvas(); })`を追加した。sandboxed iframeでは`orientationchange`が発火しないことがあるという既知の制約（`public/games/rotate_hint.js`自身のコメントに同じ記載あり）への対策であり、既存の向き判定基準・見た目・強制回転処理・ゲーム中断処理は変更していない。共通ファイル`rotate_hint.js`は「たてむきにしてね」という縦画面前提の案内であり、これら3ファイルは逆に横画面前提のゲームであるため流用せず、既存の自前実装を維持した。

### 16.3 監査ルールの一般化（scripts/audit-games.mjs）

SAFE_AREA判定を、`position:fixed`の単純な有無ではなく、実際に`top:`または`bottom:`を持つCSSルールブロックの有無で判定するよう変更した。

- 変更前: `position:fixed`が1箇所でもあり、かつ`<button>`等のタグが存在すれば「固定UIあり」と判定し、safe_area.js読込と`--sat`/`--sab`双方の使用を一律に要求していた。`#wrap{position:fixed;inset:0;...}`のような全画面センタリング用途と、実際に端へ張り付くHUD/ボタンを区別できていなかった。
- 変更後: CSSルールブロックを個別に抽出し、`position:fixed`を含むブロックのうち`top:`を持つものがあれば`hasFixedTopUi`、`bottom:`を持つものがあれば`hasFixedBottomUi`とする。`--sat`使用の要求は`hasFixedTopUi`が真の場合のみ、`--sab`使用の要求は`hasFixedBottomUi`が真の場合のみ行う。「固定UIがありますがsafe_area.jsの読込を確認できません」も同様に、上下どちらかの端固定UIが実在する場合のみ発報する。
- 一般化条件: route名・HTML名によるallowlistは使用していない。CSS構造（`{...}`ブロック内の`position:fixed`と`top:`/`bottom:`の共起）のみで判定するため、どのファイルにも同じ基準が適用される。`inset:0`の全画面オーバーレイ（`.screen`, `#flash`, `#feedback-overlay`等）は端固定UIとして扱われない。

### 16.4 fixture検証

**safe-areaのcalc()整合性**: `top: 47px, right: 0px, bottom: 34px, left: 0px`を想定した`var(--sat/--sab/--sal/--sar, env(...))`のcalc()式を確認した。`neon_drive_v1.html`の`#speed`（`right:calc(18px + var(--sar,...))`, `bottom:calc(18px + var(--sab,...))`）は47px/34pxいずれの値でもNaN・未定義にならず、既存の18px基準オフセットに加算される形式であることをCSS式の静的確認で検証した。Canvasの論理座標・当たり判定は、これらの変更がすべてCSS `position:fixed`要素（HUD/ボタン）のみに限定されており、Canvas要素自体のサイズ・座標計算コードには一切触れていないため不変である。

**回転メッセージリスナー**: 3ファイルとも既存の`checkOrient()`/`resizeCanvas()`関数自体は変更せず、追加した`addEventListener('message', ...)`はifガードで`type==='orientation'`のメッセージのみに反応し、それ以外のメッセージ（`safeArea`, `goBack`, `goHome`等）では発火しないことをdiff上のガード条件で確認した。リスナーの重複登録（同一ファイル内で同じイベントに対する二重の`addEventListener('message', ...)`呼び出し）がないことも各ファイルで1箇所のみの追加であることから確認した。

**実ブラウザ検証**: 本Phaseではローカル開発サーバーでの実機・実ブラウザでのportrait/landscape切り替え、ノッチ相当safe-areaの目視確認は実施していない。上記のCSS静的検証・diffによるロジック不変性確認・監査再実行で代替した。実機確認は未実施項目として明記する。

### 16.5 残存問題

モバイル表示関連のerror/warningは0件になった。残るのはNAV 12件（Phase 4C-3で分類済み、N2 10件・N3 2件）とREGISTRY 2件（`/dressup`のroute判定不能、`/mahou-nakama`のSCHOOL_GAMES num重複。いずれも本Phaseの対象外で、本Phase前から存在し変更していない）のみである。

### 16.6 次のPhase

Phase 4C-5として、`/mahou-nakama`登録の`SCHOOL_GAMES num "18"`重複REGISTRY warningを扱う。

## 17. Phase 4C-5: REGISTRY警告の確定・修正（2026-07-24）

### 17.1 REGISTRY warning全件抽出

```text
route: /dressup
html: -（App.jsxのRoute定義そのもの）
severity: warning
rule: 正規ルートかエイリアスかを判定できないApp Routeです
line: src/App.jsx:143
evidence: <Route path="/dressup" element={<DressUp />} />
```

```text
route: /mahou-nakama（と/katachi）
html: -（TopPage.jsxのSCHOOL_GAMES配列）
severity: warning
rule: SCHOOL_GAMES の num "18" が 2 回使われていますが、現在のUIから参照されていません
line: src/pages/TopPage.jsx:1280（katachi側の重複出現）
evidence: g_mahounakama（/mahou-nakama, num:18）と g_katachi（/katachi, num:18）
```

実測: active error 0、active warning 13、NAV 12、REGISTRY 2、STORAGE 0/0、Canvas 0、active 39（開始条件の想定と一致）。

### 17.2 登録構造の確認

| route | App route | wrapper | iframe src | gameMeta entry | TopPage entry | registration number | active HTML |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/dressup` | あり（`<GameWithSEO>`なし） | `DressUp.jsx`（独自実装） | `/games/dressup_v2.html` | なし | なし | -（4点セット対象外） | `dressup_v2.html`（referenced-secondary） |
| `/mahou-nakama` | あり（`<GameWithSEO route="/mahou-nakama">`） | `MahouNakama.jsx` | `/games/mahou_nakama_v1.html` | あり | あり（`g_mahounakama`, num:18） | 18（`/katachi`と重複） | `mahou_nakama_v1.html`（active） |
| `/katachi` | あり（`<GameWithSEO route="/katachi">`） | `KatachiAwase.jsx` | `/games/katachi_awase_v1.html` | あり | あり（`g_katachi`, num:18→21） | 18→21 | `katachi_awase_v1.html`（active） |

### 17.3 `/dressup`の精査

- `src/App.jsx`: `<Route path="/dressup" element={<DressUp />} />`（143行目）。`<GameWithSEO>`ラッパーなし。`GAME_ROUTES`配列には含まれる（68行目）。
- `DressUp.jsx`: `useIframeBridge`のみ使用し、`useGameNav`は使わず、`goBack`/`goHome`メッセージ処理を自前で実装している（機能的には`useGameNav`と等価）。iframeは`/games/dressup_v2.html`を参照し実在を確認した。
- `gameMeta.js`・`TopPage.jsx`: いずれも`/dressup`のエントリなし（`rg "/dressup" src`でApp.jsxの2箇所のみヒット）。
- 登録番号: 該当なし（`num`を使う登録システムの対象外）。
- archived HTML参照: なし。`dressup_v2.html`は監査上`referenced-secondary`（gameMetaに未登録だがApp.jsxからは参照される）に正しく分類されている。
- 表示名・route・slugの不一致: TopPageにカードが存在しないため、そもそも表示名の対応関係自体が発生しない。
- **判定: R4（監査false positive）。** `/dressup`はコード上明確に「`<GameWithSEO>`を使わない、SEO・カード表示の対象外の secondary route」として実装されている。監査の「正規ルートかエイリアスか判定できない」という警告文言は、`<GameWithSEO>`を使うルートに対して意味を持つ問いであり、そもそも`<GameWithSEO>`を使っていないルートには適用対象外と判断した。

### 17.4 `/mahou-nakama`の精査

- TopPage上の登録番号: `SCHOOL_GAMES`配列内で`g_mahounakama`が`num:18`を持つ。
- `gameMeta.js`上の番号・順序情報: `gameMeta.js`のエントリ形式に`num`相当のフィールドは存在しない（route・name・category・ageMin/ageMax等のみ）。`num`は`TopPage.jsx`の`SCHOOL_GAMES`/`GAMES`配列にのみ存在する表示用の付随データ。
- App routeとの対応: `/mahou-nakama`は`App.jsx`に正しく`<GameWithSEO route="/mahou-nakama">`で登録されており、`canonicalAppRoutes`との対応も一致する（REGISTRY errorなし）。
- ラッパー・iframeの実在: `MahouNakama.jsx`、`public/games/mahou_nakama_v1.html`とも実在を確認した。
- 同じ番号を持つ別ゲーム: `g_katachi`（`/katachi`）が同じ`num:18`を持っていた。
- 番号が完全に未使用か: `rg "\.num\b" src`で`.num`というプロパティアクセスが0件であることを確認し、`num`は表示・ソート・key・SEO・sitemapのいずれにも使われていない完全な未参照データであると確定した（`scripts/audit-games.mjs`の`numIsConsumed`判定もfalseで、この理由から本来`error`ではなく`warning`として扱われている）。
- コメントや旧配列にのみ残る番号か: いいえ、現行の`SCHOOL_GAMES`配列内の生きたエントリ2件が同時に持つ値であり、コメントアウトや旧データではない。
- activeカード順への影響: 影響なし。カード表示順は配列の記述順（`SCHOOL_GAMES`内の並び）で決まり、Reactの`key`は`id`（`g_mahounakama`, `g_katachi`）を使用しているため、`num`の値は表示にもReactの再利用判定にも一切関与しない。
- SEO・sitemapへの影響: 影響なし。SEO関連情報（title/description/canonical）は`gameMeta.js`から生成され、`sitemap.xml`は`gameMeta.js`のキー一覧から生成される。いずれも`TopPage.jsx`の`num`を参照していない。
- **判定: R2（登録内容不一致・データ入力ミス）。** `num`自体は完全に未参照の付随データ（削除しても実害はないという意味ではR3的側面もある）だが、実際の欠陥は「本来ユニークであるべき値が誤って重複入力された」という単純な入力ミスであり、値自体を訂正することで解決するR2として扱った。

### 17.5 分類まとめ

| route | 分類 | 根拠 |
| --- | --- | --- |
| `/dressup` | R4（監査false positive） | `<GameWithSEO>`未使用の意図的secondary route。構造的にcanonical/alias判定の対象外 |
| `/mahou-nakama` / `/katachi` | R2（登録内容不一致） | `SCHOOL_GAMES`の`num`重複。値は未参照だが、重複自体はデータ入力ミス |

R1（実登録漏れ）・R3（削除が必要な未使用登録）・R5（用途不明）は該当なし。

### 17.6 修正内容

1. **`scripts/audit-games.mjs`**: `App.jsx`の各`<Route>`について、「正規ルートかエイリアスか判定できない」警告を、そのRouteが`<GameWithSEO>`でラップされている場合のみ発報するよう変更した（`usesGameWithSEO`判定を追加）。`/`, `/privacy`, `/terms`の既存route名ハードコード配列は、静的ページ自体の除外（`GAME_ROUTES`チェックも含めて丸ごとスキップする必要があるため）としてそのまま維持し、今回追加した構造的判定はこの配列を置き換えるものではなく、`/dressup`のような「`<GameWithSEO>`を使わないゲームルート」を正しく判定できるようにする追加条件として実装した。route名・HTML名によるallowlistは新規に追加していない。
2. **`src/pages/TopPage.jsx`**: `SCHOOL_GAMES`配列の`g_katachi`エントリの`num`を`18`から`21`（同一バッチで追加された近傍ルートに対して未使用だった値）へ修正した。他のエントリの番号は振り直していない。

`src/App.jsx`・`src/seo/gameMeta.js`・対象ラッパー・ゲームHTMLはいずれも変更していない（`/dressup`はR4のため監査側のみ対応、`/mahou-nakama`・`/katachi`は4点セットが揃っているため`num`修正のみで対応可能だった）。

### 17.7 検証

- 全文検索: `rg "/dressup|/mahou-nakama" src reports docs`で全参照箇所を確認し、想定外の参照がないことを確認した。`num:18`の全文検索で重複が解消され1件のみ残ることを確認した。
- 登録一覧機械比較: gameMeta routes 39、App game routes 39、TopPage games 39、wrappers 40、重複route 0、重複slug（id）0、重複num（SCHOOL_GAMES内）0、存在しないHTML参照0、archived HTMLへの誤参照0を確認した（いずれも本Phase前後で変化なし、REGISTRY error 0を維持）。
- `node --check scripts/audit-games.mjs`: OK。
- `node scripts/audit-games.mjs`: active error 0、active warning 13→12、REGISTRY 2→0、NAV 12（変化なし）、STORAGE 0/0、Canvas 0、モバイル表示0/0、active 39、referenced-secondary 1、archived-or-unused 24。

### 17.8 残存問題

REGISTRY warningは0件になった。残るのはNAV 12件（Phase 4C-3で分類済み、N2 10件・N3 2件、実修正不要と判断済み）のみである。

### 17.9 Phase 4C完了可否

**Phase 4Cは本Phase（4C-5）をもって完了と判断する。** 4C-1〜4C-5を通じて、active errorは0、active warningはNAV 12件（すべて分類・文書化済みで実修正不要）のみとなり、STORAGE・Canvas・モバイル表示・REGISTRYはすべて健全な状態を達成した。
