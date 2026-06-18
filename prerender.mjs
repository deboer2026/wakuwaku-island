import fs from 'node:fs'
import path from 'node:path'
const { render } = await import('./dist-server/entry-server.js')

const routes = ['/']                       // 今回はトップのみ
const template = fs.readFileSync('dist/index.html', 'utf-8')
const ROOT = '<div id="root"></div>'       // 実際の dist/index.html の root div 文字列に必ず一致させること

if (!template.includes(ROOT)) throw new Error('root div が一致しません。ROOT を dist/index.html の実際の記述に合わせてください')

for (const url of routes) {
  const { html } = render(url)
  const out = template.replace(ROOT, `<div id="root">${html}</div>`)
  const dir = url === '/' ? 'dist' : path.join('dist', url.replace(/^\//, ''))
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), out)
  console.log('prerendered', url)
}
