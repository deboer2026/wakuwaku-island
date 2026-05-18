// どうぶつブロック — テトリス風ゲーム
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playTetrisBgm, stopBgm, playSoundCorrect, playSoundClear,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { addCoins } from '../utils/coins';
import { trackGameStart } from '../utils/analytics';
import { getLang, t } from '../utils/i18n';
import './DoubutsuBlock.css';

/* ── Board constants ─────────────────────────────────────── */
const BW = 10, BH = 20, CELL = 28;

/* ── Piece definitions ───────────────────────────────────── */
const PDEFS = [
  { s: [[1,1,1,1]],           e:'🐟', c:'#4FC3F7' }, // I
  { s: [[1,1],[1,1]],         e:'🐱', c:'#F48FB1' }, // O
  { s: [[0,1,0],[1,1,1]],     e:'🐸', c:'#A5D6A7' }, // T
  { s: [[0,1,1],[1,1,0]],     e:'🐰', c:'#FFF176' }, // S
  { s: [[1,1,0],[0,1,1]],     e:'🦊', c:'#FFAB91' }, // Z
  { s: [[1,0,0],[1,1,1]],     e:'🐼', c:'#CE93D8' }, // J
  { s: [[0,0,1],[1,1,1]],     e:'🐧', c:'#80DEEA' }, // L
];
const SCORE_TABLE = [0, 100, 300, 500, 800];

/* ── Pure helpers ────────────────────────────────────────── */
function rotate(shape) {
  const r = shape.length, c = shape[0].length;
  const out = Array.from({length:c}, () => Array(r).fill(0));
  for (let i=0;i<r;i++) for (let j=0;j<c;j++) out[j][r-1-i] = shape[i][j];
  return out;
}
function mkBoard()  { return Array.from({length:BH}, () => Array(BW).fill(null)); }
function randPiece(){ const d=PDEFS[Math.floor(Math.random()*PDEFS.length)]; return {shape:d.s,e:d.e,c:d.c}; }
function spawnPiece(def) {
  return { shape:def.shape, e:def.e, c:def.c,
           x: Math.floor(BW/2) - Math.floor(def.shape[0].length/2), y: 0 };
}
function fits(board, piece, dx=0, dy=0, shape=piece.shape) {
  for (let r=0;r<shape.length;r++) for (let c=0;c<shape[0].length;c++) {
    if (!shape[r][c]) continue;
    const nx=piece.x+c+dx, ny=piece.y+r+dy;
    if (nx<0||nx>=BW||ny>=BH) return false;
    if (ny>=0 && board[ny][nx]) return false;
  }
  return true;
}
function lock(board, piece) {
  const b=board.map(r=>[...r]);
  for (let r=0;r<piece.shape.length;r++) for (let c=0;c<piece.shape[0].length;c++) {
    if (!piece.shape[r][c]) continue;
    const ny=piece.y+r; if (ny>=0) b[ny][piece.x+c]={e:piece.e,c:piece.c};
  }
  return b;
}
function sweep(board) {
  const kept = board.filter(row=>row.some(c=>!c));
  const n    = BH - kept.length;
  return { board:[...Array.from({length:n},()=>Array(BW).fill(null)), ...kept], cleared:n };
}
function ghostY(board, piece) {
  let dy=0;
  while (fits(board,piece,0,dy+1)) dy++;
  return piece.y+dy;
}
function dropInterval(lv) { return Math.max(80, 900-(lv-1)*80); }

/* ── Canvas renderer ─────────────────────────────────────── */
function drawBoard(canvas, board, piece, ghost) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, BW*CELL, BH*CELL);
  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  for (let r=0;r<BH;r++) { ctx.beginPath(); ctx.moveTo(0,r*CELL); ctx.lineTo(BW*CELL,r*CELL); ctx.stroke(); }
  for (let c=0;c<BW;c++) { ctx.beginPath(); ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,BH*CELL); ctx.stroke(); }
  // Placed cells
  for (let r=0;r<BH;r++) for (let c=0;c<BW;c++) {
    const cell=board[r][c]; if (!cell) continue;
    const px=c*CELL, py=r*CELL;
    ctx.fillStyle=cell.c; ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
    ctx.font=`${Math.round(CELL*0.6)}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(cell.e, px+CELL/2, py+CELL/2);
  }
  // Ghost piece
  if (ghost && piece) {
    const gy = ghostY(board, piece);
    if (gy !== piece.y) {
      for (let r=0;r<piece.shape.length;r++) for (let c=0;c<piece.shape[0].length;c++) {
        if (!piece.shape[r][c]) continue;
        const py=(gy+r)*CELL; if (py<0) continue;
        ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1.5;
        ctx.strokeRect((piece.x+c)*CELL+2, py+2, CELL-4, CELL-4);
      }
    }
  }
  // Active piece
  if (piece) {
    for (let r=0;r<piece.shape.length;r++) for (let c=0;c<piece.shape[0].length;c++) {
      if (!piece.shape[r][c]) continue;
      const py=(piece.y+r)*CELL; if (py<0) continue;
      const px=(piece.x+c)*CELL;
      ctx.fillStyle=piece.c; ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
      // Shine
      const g=ctx.createLinearGradient(px,py,px+CELL,py+CELL);
      g.addColorStop(0,'rgba(255,255,255,0.35)'); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
      ctx.font=`${Math.round(CELL*0.6)}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(piece.e, px+CELL/2, py+CELL/2);
    }
  }
}

function drawNext(canvas, def) {
  const N=24;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#0d0d1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  if (!def) return;
  const ox=Math.floor((canvas.width/N - def.shape[0].length)/2);
  const oy=Math.floor((canvas.height/N - def.shape.length)/2);
  for (let r=0;r<def.shape.length;r++) for (let c=0;c<def.shape[0].length;c++) {
    if (!def.shape[r][c]) continue;
    const px=(ox+c)*N, py=(oy+r)*N;
    ctx.fillStyle=def.c; ctx.fillRect(px+1,py+1,N-2,N-2);
    ctx.font=`${Math.round(N*0.6)}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(def.e, px+N/2, py+N/2);
  }
}

/* ══════════════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════════════ */
export default function DoubutsuBlock() {
  const navigate  = useNavigate();
  const lang = getLang();
  const canvasRef = useRef(null);
  const nextRef   = useRef(null);
  const rafRef    = useRef(null);
  const timerRef  = useRef(null);
  const touchRef  = useRef(null);

  // All mutable game state in one ref
  const G = useRef(null);

  const [screen,  setScreen]  = useState('title');
  const [muted,   setMuted]   = useState(getMuteState);
  const [score,   setScore]   = useState(0);
  const [lines,   setLines]   = useState(0);
  const [level,   setLevel]   = useState(1);
  const [gameOver,setGameOver]= useState(false);
  const [hiScore, setHiScore] = useState(() => parseInt(localStorage.getItem('db_hi')||'0'));

  useEffect(() => () => { clearInterval(timerRef.current); cancelAnimationFrame(rafRef.current); stopBgm(); }, []);

  /* ─── RAF render loop ────── */
  function renderLoop() {
    const g=G.current; if(!g) return;
    if (canvasRef.current) drawBoard(canvasRef.current, g.board, g.piece, true);
    if (nextRef.current)   drawNext(nextRef.current, g.next);
    rafRef.current = requestAnimationFrame(renderLoop);
  }

  /* ─── Lock piece + spawn next ─── */
  function lockAndSpawn() {
    const g=G.current;
    g.board = lock(g.board, g.piece);
    const {board:nb, cleared} = sweep(g.board);
    g.board = nb;
    if (cleared>0) {
      const pts = (SCORE_TABLE[Math.min(cleared,4)]||0) * g.level;
      g.score += pts; g.lines += cleared;
      const newLv = Math.floor(g.lines/10)+1;
      if (newLv !== g.level) {
        g.level = newLv;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(tick, dropInterval(newLv));
        setLevel(newLv);
      }
      setScore(g.score); setLines(g.lines);
      if (cleared>=4) playSoundClear(); else playSoundCorrect();
    }
    // Spawn
    g.piece = { ...g.next, x: Math.floor(BW/2)-Math.floor(g.next.shape[0].length/2), y:0 };
    g.next  = randPiece();
    if (!fits(g.board, g.piece)) {
      g.piece = null;
      clearInterval(timerRef.current); cancelAnimationFrame(rafRef.current);
      const hi = parseInt(localStorage.getItem('db_hi')||'0');
      if (g.score > hi) { localStorage.setItem('db_hi', String(g.score)); setHiScore(g.score); }
      addCoins(Math.floor(g.score/50));
      setGameOver(true);
    }
  }

  /* ─── Drop timer tick ────── */
  function tick() {
    const g=G.current; if(!g||g.gameOver) return;
    if (fits(g.board, g.piece, 0, 1)) { g.piece.y++; }
    else lockAndSpawn();
  }

  /* ─── Controls ────────────── */
  function moveLeft()  { const g=G.current; if(g?.piece && fits(g.board,g.piece,-1,0)) g.piece.x--; }
  function moveRight() { const g=G.current; if(g?.piece && fits(g.board,g.piece,1,0))  g.piece.x++; }
  function doRotate()  {
    const g=G.current; if(!g?.piece) return;
    const r=rotate(g.piece.shape);
    const kicks=[0,1,-1,2,-2];
    for (const k of kicks) {
      if (fits(g.board, {...g.piece,shape:r}, k, 0)) { g.piece.shape=r; g.piece.x+=k; break; }
    }
  }
  function softDrop()  { tick(); }
  function hardDrop()  {
    const g=G.current; if(!g?.piece) return;
    let dy=0; while(fits(g.board,g.piece,0,dy+1)) dy++;
    g.piece.y += dy; lockAndSpawn();
  }

  /* ─── Keyboard ───────────── */
  useEffect(() => {
    if (screen !== 'game') return;
    function onKey(e) {
      switch(e.key) {
        case 'ArrowLeft':  e.preventDefault(); moveLeft();  break;
        case 'ArrowRight': e.preventDefault(); moveRight(); break;
        case 'ArrowUp':    e.preventDefault(); doRotate();  break;
        case 'ArrowDown':  e.preventDefault(); softDrop();  break;
        case ' ':          e.preventDefault(); hardDrop();  break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen]);

  /* ─── Touch ──────────────── */
  function onTouchStart(e) {
    const t=e.touches[0];
    touchRef.current={x:t.clientX, y:t.clientY, t:Date.now()};
  }
  function onTouchEnd(e) {
    const s=touchRef.current; if(!s) return;
    const t=e.changedTouches[0];
    const dx=t.clientX-s.x, dy=t.clientY-s.y, dt=Date.now()-s.t;
    if (Math.hypot(dx,dy)<18 && dt<250) { doRotate(); return; }
    if (Math.abs(dx)>Math.abs(dy)) { if(dx>25) moveRight(); else if(dx<-25) moveLeft(); }
    else { if(dy>40) hardDrop(); }
  }

  /* ─── Start ──────────────── */
  async function startGame() {
    try { await ensureAudioStarted(); playTetrisBgm(); } catch {}
    trackGameStart('DoubutsuBlock'); addCoins(1);
    const first = randPiece();
    G.current = { board:mkBoard(), piece:spawnPiece(first), next:randPiece(), score:0, lines:0, level:1 };
    setScore(0); setLines(0); setLevel(1); setGameOver(false);
    setScreen('game');
    setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(renderLoop);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(tick, dropInterval(1));
    }, 60);
  }

  /* ─── Title ──────────────── */
  if (screen === 'title') return (
    <div className="db-wrap db-title">
      <div className="db-title-icon">🧱</div>
      <h1 className="db-title-h1">どうぶつブロック</h1>
      <p className="db-title-desc">{'どうぶつブロックをつんで\nれつをそろえよう！\nスワイプで うごかすよ'}</p>
      <div className="db-hi-badge">🏆 {t(lang, 'hiScore')}: {hiScore}</div>
      <button className="db-start-btn" onClick={startGame}>▶ {t(lang, 'start')}！</button>
      <button className="ww-back-btn" onClick={() => navigate('/')}>{t(lang, 'back')}</button>
    </div>
  );

  /* ─── Game ───────────────── */
  return (
    <div className="db-wrap">
      <div className="db-hud">
        <button className="db-hud-btn" onClick={() => { stopBgm(); navigate('/'); }}>🏠</button>
        <div className="db-hud-center">
          <span className="db-hud-stat">スコア <b>{score}</b></span>
          <span className="db-hud-stat">Lv <b>{level}</b></span>
          <span className="db-hud-stat">ライン <b>{lines}</b></span>
        </div>
        <button className="db-hud-btn" onClick={() => { const m=toggleMute(); setMuted(m); if(!m) playTetrisBgm(); }}>
          {muted?'🔇':'🔊'}
        </button>
      </div>

      <div className="db-body">
        {/* Board */}
        <canvas ref={canvasRef} className="db-canvas"
          width={BW*CELL} height={BH*CELL}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          style={{touchAction:'none'}}
        />
        {/* Side */}
        <div className="db-side">
          <div className="db-next-box">
            <div className="db-next-label">NEXT</div>
            <canvas ref={nextRef} width={4*24} height={4*24} className="db-next-canvas"/>
          </div>
          <div className="db-side-hi"><div className="db-side-label">BEST</div>{hiScore}</div>
          <div className="db-side-info">
            <div className="db-side-label">HOW TO</div>
            <div className="db-side-tip">← → 移動</div>
            <div className="db-side-tip">↑ 回転</div>
            <div className="db-side-tip">↓ ドロップ</div>
            <div className="db-side-tip">タップ 回転</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="db-controls">
        <button className="db-btn" onPointerDown={moveLeft}>◀</button>
        <button className="db-btn db-btn-rot" onPointerDown={doRotate}>🔄</button>
        <button className="db-btn" onPointerDown={softDrop}>▼</button>
        <button className="db-btn db-btn-drop" onPointerDown={hardDrop}>⬇⬇</button>
        <button className="db-btn" onPointerDown={moveRight}>▶</button>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="db-overlay">
          <div className="db-overlay-card">
            <div style={{fontSize:48}}>💀</div>
            <h2>{t(lang, 'gameOver')}</h2>
            <div className="db-go-score">スコア: <b>{score}</b>てん</div>
            {score >= hiScore && score > 0 && <div className="db-go-new">🏆 ニューレコード！</div>}
            <button className="db-start-btn" onClick={startGame}>{t(lang, 'retry')}</button>
            <button className="ww-back-btn" style={{marginTop:8}} onClick={() => { stopBgm(); navigate('/'); }}>🏠 もどる</button>
          </div>
        </div>
      )}
    </div>
  );
}
