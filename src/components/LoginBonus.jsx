import { useEffect, useMemo, useRef, useState, useId } from 'react';
import './LoginBonus.css';

/* ════════════════════════════════════════════════════
   多言語文言
════════════════════════════════════════════════════ */
const T = {
  title:     { ja: 'きょうの プレゼント', en: "Today's Gift", zh: '今天的礼物', ko: '오늘의 선물', es: 'Regalo de hoy' },
  unit:      { ja: 'まい', en: 'coins', zh: '枚', ko: '개', es: 'monedas' },
  stampTitle:{ ja: 'スタンプ', en: 'Stamps', zh: '印章', ko: '스탬프', es: 'Sellos' },
  stampNote: { ja: '7かい あつめると おおきい プレゼント', en: 'Collect all 7 for a big prize!', zh: '集齐7个可获得大礼物！', ko: '7개를 모으면 큰 선물!', es: '¡Junta las 7 para un gran regalo!' },
  get:       { ja: 'もらう！', en: 'Claim!', zh: '领取！', ko: '받기!', es: '¡Recibir!' },
  thanks:    { ja: 'ありがとう！', en: 'Thank you!', zh: '谢谢！', ko: '고마워!', es: '¡Gracias!' },
};
const tt = (lang, key) => (T[key][lang] || T[key].ja);
const a11yAmount = (lang, n) => ({
  ja: `コインを ${n}まい もらえるよ`,
  en: `You'll get ${n} coins`,
  zh: `将获得${n}枚金币`,
  ko: `코인 ${n}개를 받아요`,
  es: `Recibirás ${n} monedas`,
}[lang] || `コインを ${n}まい もらえるよ`);

function isReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/* ════════════════════════════════════════════════════
   金貨アイコン
════════════════════════════════════════════════════ */
function CoinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="12" fill="#E29B14" />
      <circle cx="13" cy="12" r="10.5" fill="#FFD24A" />
      <circle cx="13" cy="12" r="7.6" fill="#FFE894" />
      <path d="M13 7 L14.5 10.6 L18.4 10.9 L15.4 13.4 L16.4 17.2 L13 15.1 L9.6 17.2 L10.6 13.4 L7.6 10.9 L11.5 10.6 Z" fill="#E8A61B" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="6" width="13" height="8.5" rx="1.6" fill="currentColor" />
      <rect x="1" y="4" width="14" height="3.4" rx="1.4" fill="currentColor" />
      <rect x="6.8" y="4" width="2.4" height="10.5" fill="rgba(255,255,255,.75)" />
      <path d="M8 4 Q5 0.6 3.4 2.4 Q2.4 3.8 8 4 Z" fill="currentColor" />
      <path d="M8 4 Q11 0.6 12.6 2.4 Q13.6 3.8 8 4 Z" fill="currentColor" />
    </svg>
  );
}

function SparkIcon({ fill }) {
  return <path d="M11 0 L13.4 8.6 L22 11 L13.4 13.4 L11 22 L8.6 13.4 L0 11 L8.6 8.6 Z" fill={fill} />;
}

/* ════════════════════════════════════════════════════
   飛び出すコインのトラジェクトリ(マウント時に1回だけ計算)
════════════════════════════════════════════════════ */
function buildCoinBursts() {
  const n = 9;
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (-160 + (320 / (n - 1)) * i) * Math.PI / 180;
    const tx = Math.round(Math.sin(a) * (52 + Math.random() * 30));
    const ty = Math.round(-Math.abs(Math.cos(a)) * (34 + Math.random() * 42) - 18);
    const r = Math.round(Math.random() * 620 - 310);
    const d = (0.5 + Math.random() * 0.28).toFixed(2);
    const sz = 20 + Math.round(Math.random() * 12);
    out.push({ id: i, tx, ty, r, delay: d, size: sz });
  }
  return out;
}

/* ════════════════════════════════════════════════════
   数字SVG（多層stroke。svgId接頭辞でgradient衝突を回避）
════════════════════════════════════════════════════ */
function AmountSvg({ value, unit, gradId }) {
  const text = `+${value}`;
  return (
    <svg viewBox="0 0 250 84" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF6D2" /><stop offset="46%" stopColor="#FFD24A" />
          <stop offset="100%" stopColor="#F0A312" />
        </linearGradient>
      </defs>
      <text x="112" y="62" textAnchor="middle" fontSize="62"
        fill="rgba(36,46,99,.26)" stroke="rgba(36,46,99,.26)" strokeWidth="16"
        strokeLinejoin="round" paintOrder="stroke" transform="translate(0,6)">{text}</text>
      <text x="112" y="62" textAnchor="middle" fontSize="62"
        fill="#242E63" stroke="#242E63" strokeWidth="16"
        strokeLinejoin="round" paintOrder="stroke">{text}</text>
      <text x="112" y="62" textAnchor="middle" fontSize="62"
        fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="7"
        strokeLinejoin="round" paintOrder="stroke">{text}</text>
      <text x="112" y="62" textAnchor="middle" fontSize="62" fill={`url(#${gradId})`}>{text}</text>
      <text x="200" y="60" textAnchor="middle" fontSize="21" fill="#C07C0A">{unit}</text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   宝箱（ふたopen + 内側glow）
════════════════════════════════════════════════════ */
function TreasureChest({ idPrefix }) {
  const wood = `${idPrefix}-wood`, woodTop = `${idPrefix}-woodTop`, metal = `${idPrefix}-metal`;
  return (
    <svg viewBox="0 0 150 120" overflow="visible">
      <defs>
        <linearGradient id={wood} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E0A96A" /><stop offset="1" stopColor="#B87C42" /></linearGradient>
        <linearGradient id={woodTop} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EFBE83" /><stop offset="1" stopColor="#C98F52" /></linearGradient>
        <linearGradient id={metal} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE07A" /><stop offset="1" stopColor="#D99A16" /></linearGradient>
      </defs>

      <ellipse cx="75" cy="112" rx="56" ry="9" fill="rgba(20,90,130,.18)" />

      <g className="lb-lid">
        <path d="M20 56 Q20 22 75 22 Q130 22 130 56 L130 62 L20 62 Z" fill={`url(#${woodTop})`} />
        <path d="M20 56 Q20 22 75 22 Q86 22 95 25 Q46 30 34 62 L20 62 Z" fill="#F5D2A4" opacity=".55" />
        <rect x="18" y="56" width="114" height="10" rx="5" fill={`url(#${metal})`} />
        <rect x="66" y="24" width="18" height="42" rx="4" fill={`url(#${metal})`} />
      </g>

      <path d="M20 62 L130 62 L130 100 Q130 108 122 108 L28 108 Q20 108 20 100 Z" fill={`url(#${wood})`} />
      <rect x="18" y="60" width="114" height="10" rx="5" fill={`url(#${metal})`} />
      <rect x="66" y="66" width="18" height="26" rx="4" fill={`url(#${metal})`} />
      <circle cx="75" cy="80" r="5" fill="#8A5A18" />
      <g stroke="#96683A" strokeWidth="1.6" opacity=".4">
        <line x1="40" y1="74" x2="40" y2="104" /><line x1="110" y1="74" x2="110" y2="104" />
      </g>
      <g>
        <circle cx="56" cy="64" r="8" fill="#FFD24A" stroke="#E29B14" strokeWidth="1.6" />
        <circle cx="75" cy="61" r="9" fill="#FFE07A" stroke="#E29B14" strokeWidth="1.6" />
        <circle cx="94" cy="64" r="8" fill="#FFD24A" stroke="#E29B14" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   のぞきこむ相棒（固定装飾。きせかえとは非連動）
════════════════════════════════════════════════════ */
function PeekBuddy() {
  return (
    <svg viewBox="0 0 80 70" aria-hidden="true">
      <ellipse cx="18" cy="24" rx="9" ry="10" fill="#F2C08A" />
      <ellipse cx="18" cy="24" rx="5" ry="5.6" fill="#FFDFB8" />
      <ellipse cx="60" cy="24" rx="9" ry="10" fill="#F2C08A" />
      <ellipse cx="60" cy="24" rx="5" ry="5.6" fill="#FFDFB8" />
      <ellipse cx="39" cy="42" rx="30" ry="27" fill="#F7CD9A" />
      <ellipse cx="39" cy="50" rx="17" ry="14" fill="#FFEBD2" />
      <ellipse cx="27" cy="40" rx="5" ry="6" fill="#3A3050" />
      <ellipse cx="51" cy="40" rx="5" ry="6" fill="#3A3050" />
      <circle cx="28.8" cy="37.8" r="2" fill="#fff" /><circle cx="52.8" cy="37.8" r="2" fill="#fff" />
      <ellipse cx="39" cy="49" rx="4.6" ry="3.4" fill="#C97F52" />
      <path d="M32 55 Q39 60 46 55" stroke="#C97F52" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="14" cy="47" rx="5.4" ry="3.6" fill="#FFB3C6" opacity=".8" />
      <ellipse cx="64" cy="47" rx="5.4" ry="3.6" fill="#FFB3C6" opacity=".8" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   LoginBonus 本体
   保存ロジックは持たない。表示・演出・claim/dismissの通知に専念する。
════════════════════════════════════════════════════ */
export default function LoginBonus({ bonus, stampPos, completedBefore, isBigGift, coinsBefore, onClaim, onDismiss, lang }) {
  const uid = useId();
  const [claimed, setClaimed] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(() => (isReducedMotion() ? bonus : 0));
  const claimedRef = useRef(false);
  const cardRef = useRef(null);
  const btnRef = useRef(null);
  const previousFocusRef = useRef(null);
  const countTimerRef = useRef(null);
  const dismissTimerRef = useRef(null);

  // 受取前残高はマウント時点で凍結する(claim後にcoinsが更新されても表示を揺らさない)
  const [frozenBefore] = useState(coinsBefore);
  const coinsAfter = frozenBefore + bonus;

  const coinBursts = useMemo(() => (isReducedMotion() ? [] : buildCoinBursts()), []);

  // ── body scroll lock + フォーカス退避/復帰 ──
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      const prevFocus = previousFocusRef.current;
      if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus({ preventScroll: true });
    };
  }, []);

  // ── 演出完了後にclaimボタンへフォーカス ──
  useEffect(() => {
    const reduce = isReducedMotion();
    const t = setTimeout(() => { btnRef.current?.focus({ preventScroll: true }); }, reduce ? 0 : 1500);
    return () => clearTimeout(t);
  }, []);

  // ── 数字カウントアップ(reduced-motionでは即最終値) ──
  useEffect(() => {
    const reduce = isReducedMotion();
    if (reduce) { setDisplayAmount(bonus); return undefined; }
    const startTimer = setTimeout(() => {
      let v = 0;
      const step = Math.max(1, Math.round(bonus / 18));
      countTimerRef.current = setInterval(() => {
        v = Math.min(bonus, v + step);
        setDisplayAmount(v);
        if (v >= bonus) clearInterval(countTimerRef.current);
      }, 34);
    }, 800);
    return () => { clearTimeout(startTimer); clearInterval(countTimerRef.current); };
  }, [bonus]);

  // ── Escape / Tabフォーカストラップ ──
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
        return;
      }
      if (e.key === 'Tab' && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  useEffect(() => () => clearTimeout(dismissTimerRef.current), []);

  function handleClaim() {
    if (claimedRef.current) return;
    claimedRef.current = true;
    // 保存を先に済ませる(600ms遅延させない)。リロード/連打でも二重claimにならない。
    onClaim();
    setClaimed(true);
    dismissTimerRef.current = setTimeout(() => { onDismiss(); }, 600);
  }

  const stamps = [];
  for (let i = 1; i <= 7; i++) {
    const isGift = i === 7;
    const on = i <= completedBefore;
    const today = i === stampPos;
    let cls = 'lb-stamp';
    if (isGift) cls += ' lb-stamp--gift';
    if (on) cls += ' lb-stamp--on';
    if (today) cls += ' lb-stamp--today';
    stamps.push(
      <span key={i} className={cls}>
        {isGift ? <GiftIcon /> : i}
      </span>
    );
  }

  return (
    <div className="lb-overlay">
      <div className="lb-rays" aria-hidden="true">
        <svg viewBox="0 0 400 400">
          <g fill="rgba(255,240,180,.3)">
            <path d="M200 0 L216 200 L184 200 Z" /><path d="M200 400 L184 200 L216 200 Z" />
            <path d="M0 200 L200 184 L200 216 Z" /><path d="M400 200 L200 216 L200 184 Z" />
            <path d="M59 59 L211 189 L189 211 Z" /><path d="M341 341 L189 211 L211 189 Z" />
            <path d="M341 59 L211 211 L189 189 Z" /><path d="M59 341 L189 189 L211 211 Z" />
          </g>
          <g fill="rgba(255,246,210,.2)">
            <path d="M126 20 L206 192 L178 200 Z" /><path d="M274 380 L194 208 L222 200 Z" />
            <path d="M380 126 L208 206 L200 178 Z" /><path d="M20 274 L192 194 L200 222 Z" />
          </g>
        </svg>
      </div>

      <div className={`lb-card${isBigGift ? ' lb-card--gift' : ''}`} role="dialog" aria-modal="true" aria-label={tt(lang, 'title')} ref={cardRef}>
        <span className={`lb-ribbon${isBigGift ? ' lb-ribbon--gift' : ''}`}>{tt(lang, 'title')}</span>

        <div className="lb-chest-wrap">
          <div className="lb-chest-glow" aria-hidden="true" />

          <div className="lb-chest" aria-hidden="true">
            <TreasureChest idPrefix={`lbchest-${uid}`} />
          </div>

          <div className="lb-coins" aria-hidden="true">
            {coinBursts.map(c => (
              <span
                key={c.id}
                className="lb-coin"
                style={{
                  width: c.size, height: c.size, marginLeft: -c.size / 2,
                  '--tx': `${c.tx}px`, '--ty': `${c.ty}px`, '--r': `${c.r}deg`,
                  animationDelay: `${c.delay}s`,
                }}
              >
                <CoinIcon size={c.size} />
              </span>
            ))}
          </div>

          <div className="lb-peek" aria-hidden="true"><PeekBuddy /></div>

          <svg className="lb-spark" style={{ left: 14, top: 26 }} width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><SparkIcon fill="#FFF3C4" /></svg>
          <svg className="lb-spark" style={{ right: 18, top: 8, animationDelay: '.4s' }} width="16" height="16" viewBox="0 0 22 22" aria-hidden="true"><SparkIcon fill="#FFFFFF" /></svg>
          <svg className="lb-spark" style={{ left: 30, bottom: 14, animationDelay: '.8s' }} width="14" height="14" viewBox="0 0 22 22" aria-hidden="true"><SparkIcon fill="#FFE9A3" /></svg>
        </div>

        <div className="lb-amount" role="status" aria-label={a11yAmount(lang, bonus)}>
          <AmountSvg value={displayAmount} unit={tt(lang, 'unit')} gradId={`lbnum-${uid}`} />
        </div>

        <div className="lb-total" aria-hidden="true">
          <CoinIcon size={20} />
          <b>{frozenBefore}</b>
          <svg width="15" height="12" viewBox="0 0 15 12" aria-hidden="true">
            <path d="M1 6 h10 M8 2 L12.5 6 L8 10" stroke="#C0B79E" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <b className="lb-total-hi">{coinsAfter}</b>
        </div>

        <div className="lb-stamp-box">
          <div className="lb-stamp-title">{tt(lang, 'stampTitle')}</div>
          <div className="lb-stamps">{stamps}</div>
          <div className="lb-stamp-note">{tt(lang, 'stampNote')}</div>
        </div>

        <button
          ref={btnRef}
          className="lb-get"
          onClick={handleClaim}
          disabled={claimed}
        >
          {claimed ? tt(lang, 'thanks') : tt(lang, 'get')}
        </button>
      </div>
    </div>
  );
}
