// どうぶつランナー — 横スクロールゲーム
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playRunnerBgm, stopBgm, playSoundCorrect, playSoundClear,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { addCoins } from '../utils/coins';
import { trackGameStart } from '../utils/analytics';
import { getLang, t } from '../utils/i18n';
import './DoubutsuRunner.css';

const W = 400, H = 240;
const GROUND_Y = 185;
const GRAVITY     = 0.55;   // 元の値に戻す
const JUMP_V      = -10.6;  // -12.5 × 0.85 → 頂点がH×35%以内に収まる
const APEX_THRESH = -3;     // この速度より遅い（頂点付近）なら重力を半分に
const PLAYER_X  = 72;
const PLAYERS   = ['🐱','🐰','🦊','🐸','🐧'];
const OBSTACLES  = ['🌵','🪨','💣','🌊','🌴'];
const COINS_EM   = ['⭐','🌟','💫'];

function mkPlayer(emoji) {
  return { emoji, x:PLAYER_X, y:GROUND_Y, vy:0, onGround:true, jumps:0, size:36, dead:false };
}

function spawnObstacle(speed) {
  const h = 28 + Math.random()*24;
  return { x:W+20, y:GROUND_Y+36-h, w:28, h, emoji:OBSTACLES[Math.floor(Math.random()*OBSTACLES.length)], scored:false };
}

function spawnCoin() {
  const y = GROUND_Y - 40 - Math.random()*60;
  return { x:W+20, y, r:12, emoji:COINS_EM[Math.floor(Math.random()*COINS_EM.length)], scored:false };
}

/* ── Canvas renderer ─────────────────────────────────────── */
function drawFrame(canvas, g) {
  const ctx = canvas.getContext('2d');
  const t   = g.time;

  // Sky gradient (day→night based on score)
  const nightRatio = Math.min(g.score/500, 1);
  const skyTop  = lerpColor([135,206,235],[20,20,60],nightRatio);
  const skyBot  = lerpColor([200,230,255],[40,20,80],nightRatio);
  const grad = ctx.createLinearGradient(0,0,0,GROUND_Y);
  grad.addColorStop(0, rgb(skyTop)); grad.addColorStop(1, rgb(skyBot));
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  // Stars (night)
  if (nightRatio > 0.3) {
    ctx.globalAlpha = (nightRatio-0.3)/0.7;
    for (let i=0;i<20;i++) {
      const sx=(((i*137+t/3)|0)%W), sy=((i*73+10)%80)+10;
      const br=(Math.sin(t*0.05+i)*0.5+0.5);
      ctx.fillStyle=`rgba(255,255,255,${0.4+br*0.5})`;
      ctx.beginPath(); ctx.arc(sx,sy,1+br,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  // Clouds
  ctx.globalAlpha = Math.max(0.1, 1-nightRatio);
  [0.3,0.6,0.85].forEach((p,i)=>{
    const cx=(((p*W - t*(0.5+i*0.3))%W+W)%W);
    const cy=30+i*18;
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.ellipse(cx,cy,30+i*8,14,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx-18,cy+4,18,11,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+18,cy+4,18,11,0,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha=1;

  // Mountain bg
  const mtColor = lerpColor([100,160,80],[40,60,90],nightRatio);
  ctx.fillStyle = rgb(mtColor);
  [0.2,0.5,0.8].forEach((px,i)=>{
    const mx = (((px*W - t*(0.8+i*0.4))%W+W)%W);
    ctx.beginPath(); ctx.moveTo(mx-60,GROUND_Y-10); ctx.lineTo(mx,GROUND_Y-10-60-i*20); ctx.lineTo(mx+60,GROUND_Y-10); ctx.fill();
  });

  // Ground
  const gndColor = lerpColor([80,160,60],[50,80,40],nightRatio);
  ctx.fillStyle = rgb(gndColor); ctx.fillRect(0, GROUND_Y, W, H-GROUND_Y);
  // Ground line details
  const dkGnd = lerpColor([60,130,40],[30,60,25],nightRatio);
  ctx.fillStyle = rgb(dkGnd);
  for (let i=0;i<8;i++) {
    const gx=(((i*55 - t*g.speed*0.3)%W+W)%W);
    ctx.fillRect(gx,GROUND_Y,30,4);
  }

  // Coins
  g.coins.forEach(c=>{
    ctx.font=`${c.r*2}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(c.emoji, c.x, c.y);
  });

  // Obstacles
  g.obstacles.forEach(o=>{
    ctx.font=`${o.h}px serif`; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(o.emoji, o.x+o.w/2, o.y+o.h);
  });

  // Player
  const p=g.player;
  if (!p.dead) {
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(PLAYER_X+p.size/2-2,GROUND_Y+8,p.size*0.35,6,0,0,Math.PI*2); ctx.fill();
    // Jump squash/stretch
    const stretch = p.onGround ? 1 : (p.vy < 0 ? 1.15 : 0.88);
    ctx.font=`${p.size*stretch}px serif`; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(p.emoji, p.x+p.size/2, p.y+p.size*(2-stretch)+6);
  }

  // Distance / score
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.fillRect(0,0,W,28);
  ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText(`スコア: ${g.score}m`, 8, 14);
  ctx.textAlign='right';
  ctx.fillText(`ベスト: ${g.best}m`, W-8, 14);
}

function lerpColor(a,b,t){ return a.map((v,i)=>Math.round(v+(b[i]-v)*t)); }
function rgb([r,g,b]){ return `rgb(${r},${g},${b})`; }

function rectsOverlap(ax,ay,aw,ah, bx,by,bw,bh, pad=6) {
  return ax+pad<bx+bw && ax+aw-pad>bx && ay+pad<by+bh && ay+ah-pad>by;
}

/* ══════════════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════════════ */
export default function DoubutsuRunner() {
  const navigate  = useNavigate();
  const lang = getLang();
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const G         = useRef(null);
  const lastRef   = useRef(0);
  const obsTimRef = useRef(0);
  const coinTimRef= useRef(0);

  const [screen,   setScreen]   = useState('title');
  const [muted,    setMuted]    = useState(getMuteState);
  const [score,    setScore]    = useState(0);
  const [best,     setBest]     = useState(() => parseInt(localStorage.getItem('run_hi')||'0'));
  const [gameOver, setGameOver] = useState(false);
  const [playerEm, setPlayerEm]= useState(() => PLAYERS[Math.floor(Math.random()*PLAYERS.length)]);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); stopBgm(); }, []);

  /* ─── Jump ── */
  function doJump() {
    const g=G.current; if(!g||g.dead) return;
    const p=g.player;
    if (p.jumps < 2) { p.vy=JUMP_V-(p.jumps*1.5); p.onGround=false; p.jumps++; }
  }

  /* ─── Game loop ── */
  function gameLoop(ts) {
    const dt = Math.min((ts - lastRef.current)/1000, 0.05);
    lastRef.current = ts;
    const g = G.current;
    if (!g) return;

    g.time += dt*60;
    g.score = Math.floor(g.time/10);

    const speed = g.speed = 3 + Math.floor(g.score/100)*0.35; // 速度上昇を70%に緩和

    // Player physics（頂点付近だけ重力を半分にしてふわっと感を出す）
    const p=g.player;
    if (!p.dead) {
      // vy が APEX_THRESH〜0 のとき（上昇がほぼ止まる頂点付近）は重力を半減
      const grav = (!p.onGround && p.vy < 0 && p.vy > APEX_THRESH)
        ? GRAVITY * 0.5
        : GRAVITY;
      p.vy += grav;
      p.y  += p.vy;
      if (p.y >= GROUND_Y) { p.y=GROUND_Y; p.vy=0; p.onGround=true; p.jumps=0; }
      else p.onGround=false;
    }

    // Spawn obstacles（間隔を約25%広げる）
    obsTimRef.current -= dt;
    if (obsTimRef.current <= 0) {
      g.obstacles.push(spawnObstacle(speed));
      obsTimRef.current = 1.5 + Math.random()*1.75 - speed*0.05;
    }
    // Spawn coins
    coinTimRef.current -= dt;
    if (coinTimRef.current <= 0) {
      g.coins.push(spawnCoin());
      coinTimRef.current = 0.8 + Math.random()*1.2;
    }

    // Move obstacles
    g.obstacles.forEach(o=>{ o.x-=speed; });
    g.coins.forEach(c=>{ c.x-=speed; });
    g.obstacles = g.obstacles.filter(o=>o.x>-60);
    g.coins     = g.coins.filter(c=>c.x>-30);

    // Collision
    if (!p.dead) {
      g.obstacles.forEach(o=>{
        if (rectsOverlap(p.x,p.y,p.size,p.size, o.x,o.y,o.w,o.h)) {
          p.dead=true; g.dead=true;
          const hi=parseInt(localStorage.getItem('run_hi')||'0');
          if (g.score>hi) { localStorage.setItem('run_hi',String(g.score)); setBest(g.score); }
          addCoins(Math.floor(g.score/20));
          setScore(g.score); setGameOver(true);
        }
      });
      g.coins.forEach(c=>{
        if (!c.scored && rectsOverlap(p.x,p.y,p.size,p.size, c.x-c.r,c.y-c.r,c.r*2,c.r*2,2)) {
          c.scored=true; g.coinCount++; playSoundCorrect();
          c.x=-999; // remove
        }
      });
    }

    const canvas=canvasRef.current; if(canvas) drawFrame(canvas, g);
    if (!g.dead) rafRef.current=requestAnimationFrame(gameLoop);
  }

  /* ─── Start ── */
  async function startGame() {
    try { await ensureAudioStarted(); playRunnerBgm(); } catch {}
    trackGameStart('DoubutsuRunner'); addCoins(1);
    const best = parseInt(localStorage.getItem('run_hi')||'0');
    G.current = {
      player: mkPlayer(playerEm), obstacles:[], coins:[], score:0,
      best, speed:3, time:0, dead:false, coinCount:0,
    };
    obsTimRef.current=1; coinTimRef.current=1.5; lastRef.current=0;
    setScore(0); setGameOver(false); setScreen('game');
    cancelAnimationFrame(rafRef.current);
    setTimeout(()=>{ rafRef.current=requestAnimationFrame(gameLoop); },60);
  }

  /* ─── Title ── */
  if (screen==='title') return (
    <div className="dr-wrap dr-title">
      <div className="dr-title-icon">{playerEm}</div>
      <h1 className="dr-title-h1">どうぶつランナー</h1>
      <p className="dr-title-desc">{'タップでジャンプ！\n2かいジャンプもできるよ！\n障害物をよけて走れ！'}</p>
      <div className="dr-hi-badge">🏆 ベスト: {best}m</div>
      <div className="dr-player-pick">
        {PLAYERS.map(p=>(
          <button key={p} className={`dr-pick-btn${p===playerEm?' on':''}`} onClick={()=>setPlayerEm(p)}>{p}</button>
        ))}
      </div>
      <button className="dr-start-btn" onClick={startGame}>▶ {t(lang, 'start')}！</button>
      <button className="ww-back-btn" onClick={()=>navigate('/')}>{t(lang, 'back')}</button>
    </div>
  );

  return (
    <div className="dr-wrap">
      <div className="dr-hud">
        <button className="dr-hud-btn" onClick={()=>{ stopBgm(); navigate('/'); }}>🏠</button>
        <span className="dr-hud-score">🏃 <b>{score}m</b></span>
        <span className="dr-hud-best">🏆 {best}m</span>
        <button className="dr-hud-btn" onClick={()=>{ const m=toggleMute(); setMuted(m); if(!m) playRunnerBgm(); }}>
          {muted?'🔇':'🔊'}
        </button>
      </div>

      <div className="dr-canvas-wrap" onPointerDown={doJump}>
        <canvas ref={canvasRef} className="dr-canvas" width={W} height={H} />
        <div className="dr-tap-hint">タップでジャンプ！</div>
      </div>

      <div className="dr-jump-area" onPointerDown={doJump}>
        <button className="dr-jump-btn" onPointerDown={e=>{e.stopPropagation();doJump();}}>
          ジャンプ！🦘
        </button>
      </div>

      {gameOver && (
        <div className="dr-overlay">
          <div className="dr-overlay-card">
            <div style={{fontSize:52}}>{playerEm}</div>
            <h2>{t(lang, 'gameOver')}！</h2>
            <div className="dr-go-score">スコア: <b>{score}</b>m</div>
            {score >= best && score>0 && <div className="dr-go-new">🏆 ニューレコード！</div>}
            <button className="dr-start-btn" onClick={startGame}>{t(lang, 'retry')}</button>
            <button className="ww-back-btn" style={{marginTop:8}} onClick={()=>{ stopBgm(); navigate('/'); }}>🏠 もどる</button>
          </div>
        </div>
      )}
    </div>
  );
}
