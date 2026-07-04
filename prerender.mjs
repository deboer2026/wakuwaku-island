import fs from 'node:fs'
import path from 'node:path'
const { render } = await import('./dist-server/entry-server.js')
const GAME_META = (await import('./src/seo/gameMeta.js')).default

// トップ + 全ゲーム正規ルート（エイリアスは canonical に集約するため除外）
const routes = ['/', ...Object.keys(GAME_META)]

const template = fs.readFileSync('dist/index.html', 'utf-8')
const ROOT = '<div id="root"></div>'
if (!template.includes(ROOT)) throw new Error('root div が一致しません。ROOT を dist/index.html の実際の記述に合わせてください')

// react-helmet-async の出力を head 文字列へ
function buildHead(helmet) {
  if (!helmet) return ''
  return [
    helmet.title?.toString() || '',
    helmet.meta?.toString() || '',
    helmet.link?.toString() || '',
    helmet.script?.toString() || '',
  ].filter(Boolean).join('\n    ')
}

// トップ固有の head タグ（title/desc/canonical/og/twitter）とサイト全体FAQを除去
function stripTopHead(html) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace(/\s*<meta property="og:title"[^>]*>/, '')
    .replace(/\s*<meta property="og:description"[^>]*>/, '')
    .replace(/\s*<meta property="og:url"[^>]*>/, '')
    .replace(/\s*<meta property="og:image"[^>]*>/, '')
    .replace(/\s*<meta name="twitter:title"[^>]*>/, '')
    .replace(/\s*<meta name="twitter:description"[^>]*>/, '')
    .replace(/\s*<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?<\/script>/, '')
}

for (const url of routes) {
  const { html, helmet } = render(url)
  let page
  if (url === '/') {
    // トップは既存の静的 head を維持し、本文だけ差し込む
    page = template.replace(ROOT, `<div id="root">${html}</div>`)
  } else {
    page = stripTopHead(template)
      .replace('</head>', `  ${buildHead(helmet)}\n  </head>`)
      .replace(ROOT, `<div id="root">${html}</div>`)
  }
  const dir = url === '/' ? 'dist' : path.join('dist', url.replace(/^\//, ''))
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), page)
  console.log('prerendered', url)
}
