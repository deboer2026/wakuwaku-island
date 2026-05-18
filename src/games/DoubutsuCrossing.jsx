import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ensureAudioStarted, playCrossingBgm, stopBgm,
  toggleMute, playSoundCorrect, playSoundWrong,
} from '../utils/audio'
import './DoubutsuCrossing.css'

const W      = 360
const H      = 480
const LANE_H = 60
const COLS   = 7
const COL_W  = W / COLS          // ≈ 51.4
const PSIZ   = 50                // player emoji size
// Player center on screen (fixed): slightly below mid
const PLAYER_SCR_Y = H - LANE_H * 1.5  // 390

const CHARS = ['🐔', '🐰', '🐸']

// Deterministic lane type for a given row (seeded by row)
function laneType(row) {
  if (row === 0) return 'grass'
  // seed-based: produces a stable, varied sequence
  const seq = [
    'road','road','grass',
    'road','road','grass',
    'river','river','grass',
    'road','grass',
    'road','road','grass',
    'river','grass',
    'train','grass',
    'road','road','grass',
    'river','river','grass',
  ]
  // delay trains until after row 10
  const t = seq[row % seq.length]
  if (t === 'train' && row < 10) return 'grass'
  return t
}

function makeLane(row) {
  const type = laneType(row)
  const items = []

  if (type === 'road') {
    const goRight = (row % 3) !== 1
    const vx = (goRight ? 1 : -1) * (1.8 + (row % 7) * 0.25)
    const count = 2 + (row % 3)
    const carEmojis = ['🚗', '🚕', '🚙', '🚌', '🚎']
    const emoji = carEmojis[row % carEmojis.length]
    const spacing = W / count
    for (let i = 0; i < count; i++) {
      const offset = ((row * 37 + i * 19) % Math.floor(spacing * 0.6))
      items.push({
        x: i * spacing + spacing * 0.2 + offset,
        vx, w: emoji === '🚌' ? 64 : 52, emoji,
        state: 'moving',
      })
    }
  } else if (type === 'river') {
    const goRight = (row % 2) === 0
    const vx = (goRight ? 1 : -1) * (0.9 + (row % 5) * 0.15)
    const count = 2 + (row % 2)
    const logW = 80 + ((row * 17) % 40)
    const spacing = W / count
    for (let i = 0; i < count; i++) {
      const offset = ((row * 53 + i * 29) % Math.floor(spacing * 0.4))
      items.push({
        x: i * spacing + offset,
        vx, w: logW, emoji: '🪵',
        state: 'moving',
      })
    }
  } else if (type === 'train') {
    const goRight = (row % 2) === 0
    const vx = goRight ? 14 : -14
    items.push({
      x: goRight ? W + 80 : -80,
      vx, w: 90, emoji: '🚂',
      state: 'waiting',
      timer: 2 + (row % 4),
    })
  }

  return { row, type, items }
}

export default function DoubutsuCrossing() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const rafRef    = useRef(null)
  const touchRef  = useRef(null)

  const [screen,     setScreen]     = useState('title')
  const [muted,      setMuted]      = useState(() => localStorage.getItem('wakuwaku_muted') === '1')
  const [charIdx,    setCharIdx]    = useState(0)
  const [uiScore,    setUiScore]    = useState(0)
  const [resultData, setResultData] = useState(null)

  const hiKey = 'crossing_hi'

  /* ── row screen coords ────────────────────────────── */
  function rowCenterY(playerRow, r) {
    return PLAYER_SCR_Y - (r - playerRow) * LANE_H
  }

  /* ── draw ─────────────────────────────────────────── */
  function drawScene(g) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, W, H)

    /* sky background */
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H)
    skyGrad.addColorStop(0, '#87CEEB')
    skyGrad.addColorStop(1, '#c8eaff')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, W, H)

    /* lanes — draw from bottom up (player.row-2 to player.row+8) */
    const pr = g.player.row
    for (let r = pr - 2; r <= pr + 8; r++) {
      if (r < 0) continue
      if (!g.lanes[r]) g.lanes[r] = makeLane(r)
      const lane = g.lanes[r]
      const cy   = rowCenterY(pr, r)
      const top  = cy - LANE_H / 2
      if (top > H + 4 || top + LANE_H < -4) continue

      /* lane background */
      switch (lane.type) {
        case 'grass':
          ctx.fillStyle = r % 2 === 0 ? '#5aab35' : '#4d9429'
          ctx.fillRect(0, top, W, LANE_H)
          /* grass tufts */
          ctx.fillStyle = 'rgba(120,200,60,0.22)'
          for (let i = 0; i < 10; i++) {
            const gx = ((r * 137 + i * 53) % (W - 8)) + 4
            const gy = top + ((r * 71 + i * 37) % (LANE_H - 8)) + 4
            ctx.beginPath()
            ctx.arc(gx, gy, 5, 0, Math.PI * 2)
            ctx.fill()
          }
          break
        case 'road':
          ctx.fillStyle = r % 2 === 0 ? '#686868' : '#5a5a5a'
          ctx.fillRect(0, top, W, LANE_H)
          /* dashed center line */
          ctx.fillStyle = 'rgba(255,255,150,0.55)'
          for (let dx = 0; dx < W; dx += 36) {
            ctx.fillRect(dx, cy - 2, 22, 4)
          }
          /* sidewalks */
          ctx.fillStyle = 'rgba(200,190,170,0.25)'
          ctx.fillRect(0, top, W, 5)
          ctx.fillRect(0, top + LANE_H - 5, W, 5)
          break
        case 'river':
          ctx.fillStyle = r % 2 === 0 ? '#2288cc' : '#1e7ab8'
          ctx.fillRect(0, top, W, LANE_H)
          /* subtle wave pattern */
          ctx.strokeStyle = 'rgba(150,220,255,0.22)'
          ctx.lineWidth = 2
          for (let wx = 0; wx < W; wx += 48) {
            const ox = ((r * 83 + wx) % 24)
            ctx.beginPath()
            ctx.arc(wx + ox, cy, 14, 0, Math.PI)
            ctx.stroke()
          }
          break
        case 'train':
          ctx.fillStyle = '#7a5a30'
          ctx.fillRect(0, top, W, LANE_H)
          /* rails */
          ctx.fillStyle = '#aaa'
          ctx.fillRect(0, cy - 10, W, 5)
          ctx.fillRect(0, cy + 5,  W, 5)
          /* ties */
          ctx.fillStyle = '#6a4a20'
          for (let tx = 0; tx < W; tx += 20) {
            ctx.fillRect(tx, cy - 12, 12, 24)
          }
          break
        default: break
      }

      /* row divider */
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(0, top, W, 2)

      /* lane items */
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'

      lane.items.forEach(item => {
        if (lane.type === 'train') {
          if (item.state === 'warning') {
            /* flashing ⚠️ */
            const blink = Math.floor(Date.now() / 200) % 2 === 0
            ctx.globalAlpha = blink ? 1 : 0.35
            ctx.font = '28px serif'
            ctx.fillText('⚠️', W / 2 - 30, cy)
            ctx.fillText('⚠️', W / 2 + 30, cy)
            ctx.globalAlpha = 1
            /* timer text */
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 14px sans-serif'
            ctx.fillText(`${Math.ceil(item.timer)}s`, W / 2, cy)
            return
          }
          if (item.state === 'waiting') return
        }

        ctx.globalAlpha = 1
        if (lane.type === 'river') {
          /* log plank */
          ctx.fillStyle = 'rgba(120,72,28,0.55)'
          const lx = item.x - item.w / 2
          const ly = cy - 10
          const lw = item.w
          const lh = 20
          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(lx, ly, lw, lh, 4)
          } else {
            ctx.rect(lx, ly, lw, lh)
          }
          ctx.fill()
          ctx.shadowColor = 'rgba(255,255,255,0.85)'; ctx.shadowBlur = 8
          ctx.font = '28px serif'
          ctx.fillText('🪵', item.x, cy)
          ctx.shadowBlur = 0
        } else {
          ctx.shadowColor = 'rgba(255,255,255,0.85)'; ctx.shadowBlur = 8
          ctx.font = '39px serif'
          ctx.fillText(item.emoji, item.x, cy)
          ctx.shadowBlur = 0
        }
      })
    }

    /* player */
    const px  = g.player.x
    const pcy = rowCenterY(pr, pr)
    if (!g.dead) {
      ctx.globalAlpha = 1
      ctx.font        = `${PSIZ}px serif`
      ctx.textAlign   = 'center'
      ctx.textBaseline = 'middle'
      /* shadow */
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.ellipse(px, pcy + PSIZ * 0.42, 18, 7, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillText(g.player.char, px, pcy - 2)
    } else {
      /* death animation */
      const t = 1 - Math.max(0, g.deadTimer / 1.2)
      ctx.globalAlpha = Math.max(0, 1 - t * 1.8)
      ctx.save()
      ctx.translate(px, pcy)
      ctx.rotate(t * Math.PI * 3)
      ctx.scale(1 + t * 0.5, 1 + t * 0.5)
      ctx.font = `${PSIZ}px serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('💥', 0, 0)
      ctx.restore()
      ctx.globalAlpha = 1
      ctx.fillStyle = `rgba(255,40,40,${Math.min(0.45, t * 0.6)})`
      ctx.fillRect(0, 0, W, H)
    }

    ctx.globalAlpha = 1
  }

  /* ── start game ───────────────────────────────────── */
  async function startGame() {
    cancelAnimationFrame(rafRef.current)
    await ensureAudioStarted()
    playCrossingBgm()

    const lanes = {}
    for (let r = 0; r < 20; r++) lanes[r] = makeLane(r)

    const g = {
      player: {
        row: 0,
        x: COL_W * 3 + COL_W / 2,
        char: CHARS[charIdx],
        moveCooldown: 0,
        rowChangeCooldown: 0,  // grace period after row change
      },
      lanes,
      maxGenRow: 20,
      score: 0,
      dead: false,
      deadTimer: 1.2,
      lastTick: performance.now(),
    }
    stateRef.current = g
    setUiScore(0)
    setScreen('game')

    function killPlayer() {
      if (g.dead) return
      g.dead = true
      g.deadTimer = 1.2
      playSoundWrong()
    }

    function tick() {
      rafRef.current = requestAnimationFrame(tick)
      const now = performance.now()
      const dt  = Math.min((now - g.lastTick) / 1000, 0.05)
      g.lastTick = now

      if (g.dead) {
        g.deadTimer -= dt
        if (g.deadTimer <= 0) {
          cancelAnimationFrame(rafRef.current)
          const hi = Math.max(g.score, parseInt(localStorage.getItem(hiKey) || '0'))
          localStorage.setItem(hiKey, String(hi))
          setResultData({ score: g.score, hi })
          setScreen('result')
          return
        }
        drawScene(g)
        return
      }

      /* move cooldown */
      g.player.moveCooldown = Math.max(0, g.player.moveCooldown - dt)
      g.player.rowChangeCooldown = Math.max(0, (g.player.rowChangeCooldown || 0) - dt)

      /* ensure lanes generated ahead */
      const pr = g.player.row
      if (pr + 15 > g.maxGenRow) {
        for (let r = g.maxGenRow; r < g.maxGenRow + 12; r++) {
          if (!g.lanes[r]) g.lanes[r] = makeLane(r)
        }
        g.maxGenRow += 12
      }

      /* update items */
      for (let r = Math.max(0, pr - 2); r <= pr + 9; r++) {
        if (!g.lanes[r]) continue
        const lane = g.lanes[r]

        if (lane.type === 'road') {
          lane.items.forEach(item => {
            item.x += item.vx
            const hw = item.w / 2 + 10
            if (item.vx > 0 && item.x - hw > W)  item.x = -hw
            if (item.vx < 0 && item.x + hw < 0)  item.x = W + hw
          })
        } else if (lane.type === 'river') {
          lane.items.forEach(item => {
            item.x += item.vx
            const hw = item.w / 2 + 10
            if (item.vx > 0 && item.x - hw > W)  item.x = -hw
            if (item.vx < 0 && item.x + hw < 0)  item.x = W + hw
          })
        } else if (lane.type === 'train') {
          lane.items.forEach(item => {
            if (item.state === 'waiting') {
              item.timer -= dt
              if (item.timer <= 0) { item.state = 'warning'; item.timer = 2.2 }
            } else if (item.state === 'warning') {
              item.timer -= dt
              if (item.timer <= 0) {
                item.state = 'moving'
                item.x = item.vx > 0 ? -item.w : W + item.w
              }
            } else {
              item.x += item.vx
              const offLeft  = item.vx < 0 && item.x + item.w / 2 < -10
              const offRight = item.vx > 0 && item.x - item.w / 2 > W + 10
              if (offLeft || offRight) {
                item.state = 'waiting'
                item.timer = 5 + Math.random() * 4
                item.x = item.vx > 0 ? W + 80 : -80
              }
            }
          })
        }
      }

      /* collision + river carrying */
      const curLane = g.lanes[pr]
      const skipCollision = (g.player.rowChangeCooldown || 0) > 0
      if (curLane && !skipCollision) {
        const px = g.player.x
        const hitR = PSIZ * 0.42

        if (curLane.type === 'river') {
          let onLog = false
          let carryVx = 0
          curLane.items.forEach(item => {
            const left  = item.x - item.w / 2 - 4
            const right = item.x + item.w / 2 + 4
            if (px >= left && px <= right) { onLog = true; carryVx = item.vx }
          })
          if (!onLog) { killPlayer(); }
          else {
            g.player.x += carryVx
            if (g.player.x < 4 || g.player.x > W - 4) killPlayer()
          }
        } else if (curLane.type === 'road') {
          curLane.items.forEach(item => {
            const left  = item.x - item.w / 2
            const right = item.x + item.w / 2
            if (px + hitR > left && px - hitR < right) killPlayer()
          })
        } else if (curLane.type === 'train') {
          curLane.items.forEach(item => {
            if (item.state !== 'moving') return
            const left  = item.x - item.w / 2
            const right = item.x + item.w / 2
            if (px + hitR > left && px - hitR < right) killPlayer()
          })
        }
      }

      drawScene(g)
    }

    /* expose killPlayer via closure; stash in ref so move handler can call it */
    g._kill = killPlayer
    tick()
  }

  /* ── movement ─────────────────────────────────────── */
  function handleMove(dir) {
    const g = stateRef.current
    if (!g || g.dead || g.player.moveCooldown > 0) return
    g.player.moveCooldown = 0.13

    if (dir === 'up') {
      g.player.row++
      g.player.rowChangeCooldown = 0.18  // 180ms grace after row advance
      if (g.player.row > g.score) {
        g.score = g.player.row
        setUiScore(g.score)
        playSoundCorrect()
      }
    } else if (dir === 'left') {
      g.player.x = Math.max(COL_W * 0.5, g.player.x - COL_W)
    } else if (dir === 'right') {
      g.player.x = Math.min(W - COL_W * 0.5, g.player.x + COL_W)
    }
  }

  /* ── touch handlers ───────────────────────────────── */
  function onTouchStart(e) {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() }
  }
  function onTouchEnd(e) {
    if (!touchRef.current) return
    const t  = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    touchRef.current = null
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) { handleMove('up'); return }
    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(dx > 0 ? 'right' : 'left')
    } else if (dy < -10) {
      handleMove('up')
    }
  }

  /* ── cleanup ──────────────────────────────────────── */
  useEffect(() => () => { cancelAnimationFrame(rafRef.current); stopBgm() }, [])

  const hiVal = parseInt(localStorage.getItem(hiKey) || '0')

  /* ── title ────────────────────────────────────────── */
  if (screen === 'title') return (
    <div className="crossing-wrap crossing-title-screen">
      <div className="crossing-title-icon">🐔</div>
      <div className="crossing-title-text">どうぶつクロッシング</div>
      <div className="crossing-title-desc">
        {'どうろ・かわ・でんしゃを わたろう！\nタップで まえに すすむよ\n⬅️➡️ で よこに うごこう'}
      </div>
      <div className="crossing-char-select">
        {CHARS.map((c, i) => (
          <button
            key={c}
            className={`crossing-char-btn${charIdx === i ? ' on' : ''}`}
            onClick={() => setCharIdx(i)}
          >
            {c}
          </button>
        ))}
      </div>
      {hiVal > 0 && <div className="crossing-hi">🏆 ハイスコア: {hiVal}</div>}
      <button className="crossing-start-btn" onClick={startGame}>スタート ▶</button>
      <button className="ww-back-btn" onClick={() => { stopBgm(); navigate('/') }}>
        🏠 トップへもどる
      </button>
    </div>
  )

  /* ── result ───────────────────────────────────────── */
  if (screen === 'result') return (
    <div className="crossing-wrap crossing-result-screen">
      <div className="crossing-result-icon">🐔</div>
      <div className="crossing-result-text">ゲームオーバー</div>
      <div className="crossing-result-score">スコア: {resultData?.score}</div>
      <div className="crossing-result-hi">🏆 ハイスコア: {resultData?.hi}</div>
      <button className="crossing-start-btn" onClick={startGame}>もういちど</button>
      <button className="ww-back-btn" onClick={() => { stopBgm(); navigate('/') }}>
        🏠 トップへもどる
      </button>
    </div>
  )

  /* ── game ─────────────────────────────────────────── */
  return (
    <div className="crossing-wrap">
      <div className="crossing-hud">
        <button className="crossing-hud-btn" onClick={() => { stopBgm(); navigate('/') }}>🏠</button>
        <span className="crossing-hud-title">クロッシング</span>
        <span className="crossing-hud-stat">⭐ {uiScore}</span>
        <span className="crossing-hud-stat">🏆 {hiVal}</span>
        <button className="crossing-hud-btn" onClick={() => { const m = toggleMute(); setMuted(m) }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="crossing-field">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="crossing-canvas"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onPointerDown={e => { if (e.pointerType !== 'touch') handleMove('up') }}
        />
      </div>

      <div className="crossing-controls">
        <button className="crossing-ctrl-btn" onPointerDown={() => handleMove('left')}>⬅️</button>
        <button className="crossing-ctrl-btn crossing-ctrl-up" onPointerDown={() => handleMove('up')}>⬆️</button>
        <button className="crossing-ctrl-btn" onPointerDown={() => handleMove('right')}>➡️</button>
      </div>
    </div>
  )
}
