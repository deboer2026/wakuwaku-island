import fs from 'node:fs'
import path from 'node:path'
const { render } = await import('./dist-server/entry-server.js')
const GAME_META = (await import('./src/seo/gameMeta.js')).default
const TOP_GAME_COUNT = Object.keys(GAME_META).length

// トップ + 案内・ポリシー + 全ゲーム正規ルート（エイリアスは canonical に集約するため除外）
const routes = ['/', '/parents', '/privacy', '/terms', ...Object.keys(GAME_META)]

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

// React 19 + renderToString では <title>/<meta>/<link>/ld+json が body 内に
// そのまま出力されるため、head へ引き上げる（canonical を Google に確実に認識させる）
const HOIST_RE = /<title>[\s\S]*?<\/title>|<meta\s[^>]*?>|<link rel="canonical"[^>]*?>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g

function hoistHeadTags(html) {
  const tags = []
  const body = html.replace(HOIST_RE, (m) => { tags.push(m); return '' })
  return { hoisted: tags.join('\n    '), body }
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

function syncTopGameCount(html) {
  return html
    .replace(/無料ミニゲームが\d+種類以上/g, `無料ミニゲームが${TOP_GAME_COUNT}種類`)
    .replace(/など\d+種類以上のミニゲーム/g, `など${TOP_GAME_COUNT}種類のミニゲーム`)
}

for (const url of routes) {
  const { html, helmet } = render(url)
  const { hoisted, body } = hoistHeadTags(html)
  let page
  if (url === '/') {
    // トップは既存の静的 head を維持し、本文だけ差し込む（hoisted は静的 head と重複するため破棄）
    page = syncTopGameCount(template.replace(ROOT, `<div id="root">${body}</div>`))
  } else {
    const headTags = [buildHead(helmet), hoisted].filter(Boolean).join('\n    ')
    page = stripTopHead(template)
      .replace('</head>', `  ${headTags}\n  </head>`)
      .replace(ROOT, `<div id="root">${body}</div>`)
  }
  const dir = url === '/' ? 'dist' : path.join('dist', url.replace(/^\//, ''))
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), page)
  console.log('prerendered', url)
}
