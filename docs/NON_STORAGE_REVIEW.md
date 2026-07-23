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
