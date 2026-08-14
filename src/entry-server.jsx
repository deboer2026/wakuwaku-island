import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'

export async function render(url) {
  const helmetContext = {}
  const { prelude } = await prerenderToNodeStream(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  )
  let html = ''
  for await (const chunk of prelude) html += chunk.toString()
  return { html, helmet: helmetContext.helmet }
}
