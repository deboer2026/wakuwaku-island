// src/utils/transition.js
// ===== Screen transition effects =====
import { trackGameSelect } from './analytics'

const STAR_EMOJIS = ['⭐', '🌟', '✨', '💫']

/**
 * Top → Game transition: gold disc expands from click point + star burst (600ms)
 */
export function transitionTo(navigate, path, cx, cy, analytics = {}) {
  if (window._wwTransitioning) return
  window._wwTransitioning = true
  trackGameSelect({ route: path, ...analytics }, analytics.sourceContext || analytics.source_context || 'unknown')

  const x = cx ?? window.innerWidth / 2
  const y = cy ?? window.innerHeight / 2
  const w = window.innerWidth
  const h = window.innerHeight
  const maxDist = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))

  const overlay = document.createElement('div')
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;pointer-events:all;overflow:hidden;'
  document.body.appendChild(overlay)

  // Gold disc that expands from click point to cover the screen
  const DISC_SIZE = 8
  const discScale = Math.ceil((maxDist * 2.5) / DISC_SIZE)
  const disc = document.createElement('div')
  disc.style.cssText =
    `position:absolute;border-radius:50%;will-change:transform,opacity;` +
    `background:radial-gradient(circle,#FFF176 0%,#FFE033 35%,#FF8C00 100%);` +
    `width:${DISC_SIZE}px;height:${DISC_SIZE}px;` +
    `left:${x - DISC_SIZE / 2}px;top:${y - DISC_SIZE / 2}px;` +
    `--scale:${discScale};` +
    `animation:ww-gold-expand 0.65s cubic-bezier(0.2,0.8,0.2,1) 0.05s both;`
  overlay.appendChild(disc)

  // Star particles burst outward from click point
  const COUNT = 22
  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2
    const dist = maxDist * (0.75 + Math.random() * 0.4)
    const el = document.createElement('div')
    el.style.cssText =
      `position:absolute;pointer-events:none;will-change:transform,opacity;line-height:1;` +
      `left:${x}px;top:${y}px;` +
      `font-size:${(14 + Math.random() * 14).toFixed(0)}px;` +
      `--dx:${(Math.cos(angle) * dist).toFixed(1)}px;` +
      `--dy:${(Math.sin(angle) * dist).toFixed(1)}px;` +
      `--rot:${(Math.random() * 360).toFixed(0)}deg;` +
      `animation:ww-star-burst 0.55s cubic-bezier(0.25,0.46,0.45,0.94) ${(i * 0.018).toFixed(3)}s both;`
    el.textContent = STAR_EMOJIS[i % STAR_EMOJIS.length]
    overlay.appendChild(el)
  }

  setTimeout(() => {
    navigate(path)
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove()
      window._wwTransitioning = false
    }, 200)
  }, 600)
}

/**
 * Game → Top transition: blue wave rises from bottom (500ms)
 */
export function transitionBack(navigate) {
  if (window._wwTransitioning) return
  window._wwTransitioning = true

  const overlay = document.createElement('div')
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;pointer-events:all;overflow:hidden;'
  document.body.appendChild(overlay)

  const wave = document.createElement('div')
  wave.style.cssText =
    'position:absolute;inset:0;will-change:transform;' +
    'animation:ww-wave-rise 0.5s cubic-bezier(0.22,1,0.36,1) both;'
  wave.innerHTML =
    `<svg viewBox="0 0 200 40" preserveAspectRatio="none" ` +
    `style="position:absolute;top:-36px;left:-1%;width:102%;height:40px;display:block;fill:#29b6f6;">` +
    `<path d="M0,40 C40,5 80,30 120,12 C160,-5 180,28 200,40 Z"/></svg>` +
    `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#29b6f6 0%,#0277bd 100%);"></div>`
  overlay.appendChild(wave)

  setTimeout(() => {
    navigate('/')
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove()
      window._wwTransitioning = false
    }, 200)
  }, 500)
}
