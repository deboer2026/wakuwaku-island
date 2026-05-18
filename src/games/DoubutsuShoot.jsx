// どうぶつシューティング — 縦スクロールシューター
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playShootingBgm, stopBgm, playSoundCorrect, playSoundClear,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { addCoins } from '../utils/coins';
import { trackGameStart } from '../utils/analytics';
import { getLang, t } from '../utils/i18n';
import './DoubutsuShoot.css';

const W = 360, H = 480;
const ENEMIES_EM = ['🐙','🦂','🐛','🦑','👾','🦇','🐜'];
const BOSS_HP_MAX = 20;

function mkPlayer(x) {
  return { x, y:H-60, size:36, emoji:'🚀', hp:5, maxHp:5, invincible:0, shootCd:0, power:1 };
}
function mkBullet(x,y)  { return {x,y,w:6,h:14,active:true,type:'player'}; }
function mkEnemy(score)  {
  const ex=20+Math.random()*(W-40);
  const hp=1+Math.floor(score/200);
  const shoots=score>100;
  return {x:ex,y:-30,w:32,h:32,hp,maxHp:hp,emoji:ENEMIES_EM[Math.floor(Math.random()*ENEMIES_EM.length)],vy:1+score/300,shootCd:60+Math.random()*60,active:true,shoots};
}
function mkPowerup(x,y) { return {x,y,w:24,h:24,vy:2,emoji:'💎',active:true}; }
function mkParticle(x,y,c) { return {x,y,vx:(Math.random()-.5)*4,vy:-2-Math.random()*3,life:1,color:c}; }

function rectsHit(a,b,pad=8) {
  return a.x+pad<b.x+b.w && a.x+a.w-pad>b.x && a.y+pad<b.y+b.h && a.y+a.h-pad>b.y;
}

/* ── Renderer ─────────────────────────────────────────────── */
function drawFrame(canvas, g) {
  const ctx=canvas.getContext('2d');
  // Space background
  ctx.fillStyle='#08081a'; ctx.fillRect(0,0,W,H);
  // Stars (scroll downward)
  for (let i=0;i<60;i++) {
    const sx=((i*137)%W), sy=((i*73+g.bgScroll*0.4)%H);
    const br=0.3+((i*47)%10)/15;
    ctx.fillStyle=`rgba(255,255,255,${br})`;
    ctx.beginPath(); ctx.arc(sx,sy,0.8+(i%3)*0.4,0,Math.PI*2); ctx.fill();
  }
  // Nebula
  const nc=ctx.createRadialGradient(W*0.7,H*0.3,10,W*0.7,H*0.3,120);
  nc.addColorStop(0,'rgba(100,50,200,0.12)'); nc.addColorStop(1,'transparent');
  ctx.fillStyle=nc; ctx.fillRect(0,0,W,H);

  // Bullets (player)
  ctx.fillStyle='#7ec8ff';
  g.bullets.forEach(b=>{ if(b.active){ ctx.fillRect(b.x-b.w/2,b.y,b.w,b.h); } });

  // Enemy bullets
  ctx.fillStyle='#ff6060';
  g.eBullets.forEach(b=>{ if(b.active){ ctx.fillRect(b.x-4,b.y,8,12); } });

  // Powerups
  g.powerups.forEach(p=>{
    ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(p.emoji, p.x+p.w/2, p.y+p.h/2);
  });

  // Particles
  g.particles.forEach(pt=>{
    ctx.globalAlpha=pt.life;
    ctx.fillStyle=pt.color;
    ctx.beginPath(); ctx.arc(pt.x,pt.y,4,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha=1;

  // Enemies
  g.enemies.forEach(e=>{
    if (!e.active) return;
    ctx.font=`${e.w}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(e.emoji, e.x+e.w/2, e.y+e.h/2);
    // HP bar
    if (e.maxHp>1) {
      const bw=e.w, bh=4, bx=e.x, by=e.y-8;
      ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillRect(bx,by,bw,bh);
      ctx.fillStyle='#f44'; ctx.fillRect(bx,by,bw*e.hp/e.maxHp,bh);
    }
  });

  // Boss
  if (g.boss) {
    const b=g.boss;
    ctx.font=`${b.w}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(b.emoji, b.x+b.w/2, b.y+b.h/2);
    // Boss HP bar
    const bw=W-40, by=H-26;
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(20,by,bw,12);
    ctx.fillStyle='#f44'; ctx.fillRect(20,by,bw*b.hp/b.maxHp,12);
    ctx.fillStyle='#fff'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center';
    ctx.fillText('BOSS ❤️'+b.hp, W/2, by+6);
  }

  // Player
  const p=g.player;
  if (p.invincible%8<4) { // 点滅周期を遅くしてわかりやすく
    // Thruster
    ctx.font='14px serif'; ctx.textAlign='center';
    ctx.fillText('🔥', p.x+p.size/2, p.y+p.size+4);
    ctx.font=`${p.size}px serif`; ctx.textBaseline='middle';
    ctx.fillText(p.emoji, p.x+p.size/2, p.y+p.size/2);
    // Power indicator
    if (p.power>1) {
      ctx.fillStyle='rgba(126,200,255,.6)'; ctx.font='bold 9px sans-serif';
      ctx.textAlign='left'; ctx.textBaseline='top';
      ctx.fillText(`×${p.power}`, p.x, p.y-12);
    }
  }

  // HUD
  ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(0,0,W,26);
  ctx.fillStyle='#fff'; ctx.font='bold 11px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText('❤️'.repeat(Math.max(0,p.hp)), 6, 13);
  ctx.textAlign='center';
  ctx.fillText(`スコア: ${g.score}`, W/2, 13);
  ctx.textAlign='right';
  ctx.fillText(`最高: ${g.best}`, W-6, 13);
  // 序盤30秒：操作説明バナー
  if (g.time < 30) {
    const remain = Math.ceil(30 - g.time);
    ctx.fillStyle='rgba(255,220,50,0.18)'; ctx.fillRect(0,H-34,W,34);
    ctx.fillStyle='#FFD700'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(`✨ なれじかん あと${remain}びょう ✨ てきだんなし！`, W/2, H-17);
  }
}

/* ══════════════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════════════ */
export default function DoubutsuShoot() {
  const navigate  = useNavigate();
  const lang = getLang();
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const G         = useRef(null);
  const lastRef   = useRef(0);
  const eTmRef    = useRef(0);

  const [screen,   setScreen]   = useState('title');
  const [muted,    setMuted]    = useState(getMuteState);
  const [score,    setScore]    = useState(0);
  const [hp,       setHp]       = useState(5);
  const [best,     setBest]     = useState(() => parseInt(localStorage.getItem('shoot_hi')||'0'));
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); stopBgm(); }, []);

  /* ─── Player move (touch/click) ── */
  function onCanvasPointer(e) {
    const g=G.current; if(!g||g.dead) return;
    e.preventDefault();
    const rect=canvasRef.current.getBoundingClientRect();
    const scaleX=W/rect.width;
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const cx=(clientX-rect.left)*scaleX;
    g.player.x = Math.max(0, Math.min(W-g.player.size, cx-g.player.size/2));
  }

  /* ─── Game loop ── */
  function gameLoop(ts) {
    if (!lastRef.current) lastRef.current=ts;
    const dt=Math.min((ts-lastRef.current)/1000, 0.05);
    lastRef.current=ts;
    const g=G.current; if(!g) return;

    g.bgScroll += 60*dt;
    g.score    = Math.floor(g.time*10);
    g.time     += dt;

    const p=g.player;
    if (p.invincible>0) p.invincible--;

    // Player shoot
    p.shootCd--;
    if (p.shootCd<=0) {
      p.shootCd=18-Math.min(p.power*2,10);
      for (let i=0;i<p.power;i++) {
        const ox=(p.power>1)?(i-(p.power-1)/2)*10:0;
        g.bullets.push({x:p.x+p.size/2+ox, y:p.y, w:6, h:14, active:true});
      }
    }

    // Move bullets
    g.bullets.forEach(b=>{ b.y-=12; if(b.y<-20) b.active=false; });
    // 通常弾30%減、ボス弾は元速度の50%（2.5px）
    g.eBullets.forEach(b=>{ b.y+=(b.isBoss?2.5:3.5); if(b.y>H+20) b.active=false; });
    g.bullets  = g.bullets.filter(b=>b.active);
    g.eBullets = g.eBullets.filter(b=>b.active);

    // Spawn enemy
    eTmRef.current -= dt;
    if (eTmRef.current<=0) {
      g.enemies.push(mkEnemy(g.score));
      eTmRef.current = Math.max(0.3, 1.5-g.score/300);
    }

    // Spawn boss（スコア3000以上から登場）
    if (!g.boss && g.score>=3000 && g.score%500<10 && !g.bossDefeated) {
      g.boss={x:W/2-40,y:-80,w:80,h:80,hp:BOSS_HP_MAX,maxHp:BOSS_HP_MAX,emoji:'👹',vx:2,vy:0.5,shootCd:60};
      g.bossDefeated=false;
    }

    // Move enemies（序盤30秒は弾なし）
    const canShoot = g.time > 30;
    g.enemies.forEach(e=>{
      e.y+=e.vy;
      if (e.shoots && canShoot) {
        e.shootCd--;
        if (e.shootCd<=0) {
          g.eBullets.push({x:e.x+e.w/2,y:e.y+e.h,w:8,h:12,active:true});
          e.shootCd=60+Math.random()*60;
        }
      }
      if (e.y>H+40) e.active=false;
    });
    g.enemies=g.enemies.filter(e=>e.active);

    // Move boss（弾速50%減、発射間隔2倍）
    if (g.boss) {
      const b=g.boss;
      b.x+=b.vx; b.y+=b.vy;
      if (b.x<0||b.x>W-b.w) b.vx*=-1;
      if (b.y>80) { b.vy=0; b.y=80; }
      b.shootCd--;
      if (b.shootCd<=0) {
        for (let i=-1;i<=1;i++) g.eBullets.push({x:b.x+b.w/2+i*15,y:b.y+b.h,w:8,h:12,active:true,isBoss:true});
        b.shootCd=60; // 発射間隔2倍（30→60）
      }
    }

    // Move powerups
    g.powerups.forEach(pu=>{ pu.y+=pu.vy; if(pu.y>H+30) pu.active=false; });
    g.powerups=g.powerups.filter(pu=>pu.active);

    // Bullet vs enemy
    g.bullets.forEach(blt=>{
      g.enemies.forEach(e=>{
        if (!blt.active||!e.active) return;
        if (rectsHit({x:blt.x-blt.w/2,y:blt.y,w:blt.w,h:blt.h}, e)) {
          blt.active=false; e.hp--;
          for(let i=0;i<5;i++) g.particles.push(mkParticle(e.x+e.w/2,e.y+e.h/2,'#FFD700'));
          if (e.hp<=0) {
            e.active=false; g.kills++;
            playSoundCorrect();
            if (Math.random()<0.12) g.powerups.push(mkPowerup(e.x+e.w/2-12,e.y));
          }
        }
      });
      if (g.boss && blt.active) {
        if (rectsHit({x:blt.x-blt.w/2,y:blt.y,w:blt.w,h:blt.h}, g.boss)) {
          blt.active=false; g.boss.hp--;
          for(let i=0;i<4;i++) g.particles.push(mkParticle(g.boss.x+g.boss.w/2,g.boss.y+g.boss.h/2,'#ff6060'));
          if (g.boss.hp<=0) { g.boss=null; g.bossDefeated=true; playSoundClear(); g.score+=200; }
        }
      }
    });

    // Enemy bullet vs player
    if (p.invincible===0) {
      g.eBullets.forEach(b=>{
        if (!b.active) return;
        if (rectsHit({x:b.x-4,y:b.y,w:8,h:12}, {x:p.x+6,y:p.y+6,w:p.size-12,h:p.size-12},4)) {
          b.active=false; p.hp--; p.invincible=180; // 無敵時間2倍
          setHp(p.hp);
          if (p.hp<=0) { g.dead=true; finishGame(g); return; }
        }
      });
      // Enemy vs player
      g.enemies.forEach(e=>{
        if (!e.active||p.invincible>0) return;
        if (rectsHit(e, {x:p.x+6,y:p.y+6,w:p.size-12,h:p.size-12},8)) {
          e.active=false; p.hp--; p.invincible=180; // 無敵時間2倍 setHp(p.hp);
          if (p.hp<=0) { g.dead=true; finishGame(g); return; }
        }
      });
    }

    // Powerup vs player
    g.powerups.forEach(pu=>{
      if (!pu.active) return;
      if (rectsHit(pu, {x:p.x,y:p.y,w:p.size,h:p.size},4)) {
        pu.active=false; p.power=Math.min(p.power+1,3); playSoundCorrect();
      }
    });

    // Particles
    g.particles.forEach(pt=>{ pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=0.15; pt.life-=0.04; });
    g.particles=g.particles.filter(pt=>pt.life>0);

    g.score=Math.floor(g.time*10)+g.kills*10;
    setScore(g.score);

    const canvas=canvasRef.current; if(canvas) drawFrame(canvas,g);
    if (!g.dead) rafRef.current=requestAnimationFrame(gameLoop);
  }

  function finishGame(g) {
    cancelAnimationFrame(rafRef.current);
    const hi=parseInt(localStorage.getItem('shoot_hi')||'0');
    if (g.score>hi) { localStorage.setItem('shoot_hi',String(g.score)); setBest(g.score); }
    addCoins(Math.floor(g.score/50));
    setScore(g.score); setGameOver(true);
  }

  /* ─── Start ── */
  async function startGame() {
    try { await ensureAudioStarted(); playShootingBgm(); } catch {}
    trackGameStart('DoubutsuShoot'); addCoins(1);
    G.current={
      player:mkPlayer(W/2-18), bullets:[], eBullets:[], enemies:[], powerups:[],
      particles:[], boss:null, bossDefeated:false,
      score:0, best:parseInt(localStorage.getItem('shoot_hi')||'0'),
      kills:0, time:0, bgScroll:0, dead:false,
    };
    eTmRef.current=1; lastRef.current=0;
    setScore(0); setHp(5); setGameOver(false); setScreen('game');
    cancelAnimationFrame(rafRef.current);
    setTimeout(()=>{ rafRef.current=requestAnimationFrame(gameLoop); },60);
  }

  /* ─── Title ── */
  if (screen==='title') return (
    <div className="ds-wrap ds-title">
      <div className="ds-title-icon">🚀</div>
      <h1 className="ds-title-h1">どうぶつシューティング</h1>
      <p className="ds-title-desc">{'タップした場所に うごくよ！\n自動でたまをうつ！\nてきをやっつけよう！'}</p>
      <div className="ds-hi-badge">🏆 {t(lang, 'hiScore')}: {best}</div>
      <button className="ds-start-btn" onClick={startGame}>▶ {t(lang, 'start')}！</button>
      <button className="ww-back-btn" onClick={()=>navigate('/')}>{t(lang, 'back')}</button>
    </div>
  );

  return (
    <div className="ds-wrap">
      <div className="ds-hud">
        <button className="ds-hud-btn" onClick={()=>{ stopBgm(); navigate('/'); }}>🏠</button>
        <span className="ds-hud-hp">{'❤️'.repeat(Math.max(0,hp))}</span>
        <span className="ds-hud-score"><b>{score}</b>てん</span>
        <button className="ds-hud-btn" onClick={()=>{ const m=toggleMute(); setMuted(m); if(!m) playShootingBgm(); }}>
          {muted?'🔇':'🔊'}
        </button>
      </div>

      <div className="ds-canvas-wrap"
        onPointerDown={onCanvasPointer}
        onPointerMove={e=>{ if(e.buttons>0) onCanvasPointer(e); }}
        onTouchStart={onCanvasPointer}
        onTouchMove={onCanvasPointer}
        style={{touchAction:'none'}}
      >
        <canvas ref={canvasRef} className="ds-canvas" width={W} height={H}/>
      </div>

      {gameOver && (
        <div className="ds-overlay">
          <div className="ds-overlay-card">
            <div style={{fontSize:52}}>🚀</div>
            <h2>{t(lang, 'gameOver')}！</h2>
            <div className="ds-go-score">スコア: <b>{score}</b>てん</div>
            {score>=best && score>0 && <div className="ds-go-new">🏆 ニューレコード！</div>}
            <button className="ds-start-btn" onClick={startGame}>{t(lang, 'retry')}</button>
            <button className="ww-back-btn" style={{marginTop:8}} onClick={()=>{ stopBgm(); navigate('/'); }}>🏠 もどる</button>
          </div>
        </div>
      )}
    </div>
  );
}
