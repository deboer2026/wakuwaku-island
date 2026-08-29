/**
 * capture-thumbs.mjs — ゲーム画面サムネイル自動生成(ローカル実行専用)
 *
 * 本番サイトの各ゲームHTMLを headless Chrome で開き、描画後の画面を
 * public/thumbs/<route>.webp として保存する。ビルドパイプラインには含めない。
 *
 * 準備(依存はpackage.jsonに保存しない):
 *   npm i -D puppeteer sharp --no-save
 *
 * 使い方:
 *   node scripts/capture-thumbs.mjs              # 全ルート(既存webpはスキップ)
 *   node scripts/capture-thumbs.mjs /mura /kart  # 指定ルートのみ
 *   node scripts/capture-thumbs.mjs --force      # 既存を上書き
 *
 * 環境変数:
 *   THUMB_BASE  取得元(既定: https://wakuwakuislands.com)
 *               ローカル検証時は `npx serve public` 等で http://localhost:3000 を指定
 */
import { mkdir, access, copyFile } from 'node:fs/promises';
import path from 'node:path';

const puppeteer = (await import('puppeteer')).default;
const sharp = (await import('sharp')).default;

const BASE = process.env.THUMB_BASE || 'https://wakuwakuislands.com';
const OUT_DIR = path.resolve('public/thumbs');
const VIEWPORT = { width: 800, height: 600 };   // カード比4:3
const THUMB_WIDTH = 480;                         // 出力webp幅
const WEBP_QUALITY = 78;
const DEFAULT_WAIT_MS = 4500;                    // 描画安定待ち(タイトル画面想定)
const FLAT_STDEV = 6;                            // これ未満は「ほぼ単色」= 撮影失敗とみなす
const RETRY_WAIT_MS = 4000;                      // 単色だった場合の追加待ち
const MAX_RETRY = 2;

/* route → ゲームHTML(src/App.jsx + src/games/*.jsx から抽出。
   同一HTMLを共有するエイリアスrouteは1回のキャプチャを複製する) */
const MAP = [
  ['/animal-block', 'doubutsu_block_v3.html'],
  ['/animal-soccer', 'soccer_v7.html'],
  ['/bike', 'wakuwaku_bike_v3.html'],
  ['/block', 'block_kuzushi_v4.html'],
  ['/doubutsu-mura', 'mura_v1.html'],
  ['/doubutsu-puzzle', 'doubutsu_puzzle_v3.html'],
  ['/dressup', 'dressup_v2.html'],
  ['/flag-quiz', 'flag_quiz_v2.html'],
  ['/houki', 'mahou_houki_gp_v5.html'],
  ['/ichigo', 'ichigo_v3.html'],
  ['/iro', 'iro_awase_v3.html'],
  ['/iro-awase', 'iro_awase_v3.html'],
  ['/jewelry-master', 'jewelry_master_v8.html'],
  ['/kakurenbo', 'kakurenbo_v2.html'],
  ['/kart', 'animal_kart_v7.html'],
  ['/katachi', 'katachi_awase_v1.html'],
  ['/katachi-awase', 'katachi_awase_v1.html'],
  ['/katakana-asobi', 'katakana_asobi_v1.html'],
  ['/kazu', 'kazu_asobi_v3.html'],
  ['/kazu-asobi', 'kazu_asobi_v3.html'],
  ['/kokki', 'flag_quiz_v2.html'],
  ['/kotsu-safety', 'kotsu_safety_v5.html'],
  ['/kudamono', 'kudamono_v2.html'],
  ['/kudamono-catch', 'kudamono_v2.html'],
  ['/kyoshitsu', 'sora_kyoshitsu_v1.html'],
  ['/machi', 'machi_v7.html'],
  ['/mahou-meiro', 'meiro_v6.html'],
  ['/mahou-nakama', 'mahou_nakama_v1.html'],
  ['/moji', 'moji_asobi_v2.html'],
  ['/moji-asobi', 'moji_asobi_v2.html'],
  ['/mori', 'mori_v4.html'],
  ['/mura', 'mura_v1.html'],
  ['/neko', 'neko_chou_v1.html'],
  ['/neko-chou', 'neko_chou_v1.html'],
  ['/nurie', 'nurie_oekaki_v1.html'],
  ['/okashi-crossing', 'okashi_crossing.html'],
  ['/otakara-horihori', 'otakara_horihori_v1.html'],
  ['/puzzle', 'doubutsu_puzzle_v3.html'],
  ['/runner', 'runner_v8.html'],
  ['/shabondama', 'shabondama_v3.html'],
  ['/shoot', 'shoot3.html'],
  ['/shooting', 'shoot3.html'],
  ['/sniper', 'sniper_v3.html'],
  ['/soccer', 'soccer_v7.html'],
  ['/sora', 'sora_v3.html'],
  ['/sora-kyoshitsu', 'sora_kyoshitsu_v1.html'],
  ['/sushi', 'sushi_v3.html'],
  ['/tashizan', 'tashizan_v2.html'],
  ['/tokei-yomi', 'tokei_yomi_v1.html'],
  ['/usagi', 'usagi_carrot_v2.html'],
  ['/usagi-carrot', 'usagi_carrot_v2.html'],
];

/* 描画に時間がかかるゲームの個別待ち時間(ms) */
const WAIT_OVERRIDES = {
  'mura_v1.html': 7000,
  'machi_v7.html': 7000,
  'animal_kart_v7.html': 6000,
  'sora_kyoshitsu_v1.html': 6000,
};

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyRoutes = args.filter(a => a.startsWith('/'));

const exists = p => access(p).then(() => true, () => false);
const outPath = route => path.join(OUT_DIR, `${route.replace(/^\//, '')}.webp`);

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // 対象を html 単位にグルーピング(エイリアスは複製で対応)
  const targets = MAP.filter(([r]) => onlyRoutes.length === 0 || onlyRoutes.includes(r));
  const byHtml = new Map();
  for (const [route, html] of targets) {
    if (!byHtml.has(html)) byHtml.set(html, []);
    byHtml.get(html).push(route);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'],
  });

  let done = 0, skipped = 0, failed = 0;
  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    for (const [html, routes] of byHtml) {
      const pending = [];
      for (const r of routes) {
        if (force || !(await exists(outPath(r)))) pending.push(r);
        else skipped++;
      }
      if (pending.length === 0) continue;

      const url = `${BASE}/games/${html}`;
      try {
        const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        if (!res || !res.ok()) throw new Error(`HTTP ${res ? res.status() : 'no response'}`);

        // ゲームのタイトル/セレクト画面はDOMで組まれ <canvas> は display:none の
        // パネル内に隠れていることが多い。canvasを直接撮ると失敗するか真っ白になるため、
        // 常にビューポート全体を撮る。
        let webp = null;
        let stdev = 0;
        const baseWait = WAIT_OVERRIDES[html] ?? DEFAULT_WAIT_MS;

        for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
          await new Promise(r => setTimeout(r, attempt === 0 ? baseWait : RETRY_WAIT_MS));
          const png = await page.screenshot({ type: 'png' });

          // ほぼ単色(=ロード中の白画面など)でないか検査
          const stats = await sharp(png).stats();
          stdev = Math.max(...stats.channels.map(c => c.stdev));
          webp = await sharp(png)
            .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer();

          if (stdev >= FLAT_STDEV) break;
          if (attempt < MAX_RETRY) {
            console.warn(`   ⏳ ${html}: ほぼ単色(stdev ${stdev.toFixed(1)})。待機して再取得…`);
          }
        }

        if (stdev < FLAT_STDEV) {
          throw new Error(`描画されませんでした (stdev ${stdev.toFixed(1)} < ${FLAT_STDEV})`);
        }

        const first = outPath(pending[0]);
        await sharp(webp).toFile(first);
        for (const r of pending.slice(1)) await copyFile(first, outPath(r));

        done += pending.length;
        console.log(`✅ ${html} → ${pending.join(', ')} (${(webp.length / 1024).toFixed(0)}KB, stdev ${stdev.toFixed(1)})`);
      } catch (e) {
        failed += pending.length;
        console.error(`❌ ${html} (${pending.join(', ')}): ${e.message}`);
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`\n完了: ${done}件生成 / ${skipped}件スキップ / ${failed}件失敗`);
  console.log(`出力: ${OUT_DIR}/<route>.webp — TopPageは未配置分を自動でSVGアイコンにフォールバックします`);
  if (failed > 0) process.exitCode = 1;
}

main();
