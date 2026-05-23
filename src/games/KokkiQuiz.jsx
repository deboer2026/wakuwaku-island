import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transitionBack } from '../utils/transition'
import {
  ensureAudioStarted, playKokkiBgm, stopBgm,
  playSoundCorrect, playSoundWrong,
} from '../utils/audio'
import { getLang, t } from '../utils/i18n'
import './KokkiQuiz.css'

// ===== Country data (30 countries, 5 langs) =====
// code: flagcdn.com 2-letter country code
const COUNTRIES = [
  // Asia
  { code:'jp', ja:'日本',           en:'Japan',         zh:'日本',       ko:'일본',           es:'Japón',         capital:{ ja:'東京',          en:'Tokyo',           zh:'东京',       ko:'도쿄',         es:'Tokio' } },
  { code:'cn', ja:'中国',           en:'China',         zh:'中国',       ko:'중국',           es:'China',         capital:{ ja:'北京',          en:'Beijing',         zh:'北京',       ko:'베이징',       es:'Pekín' } },
  { code:'kr', ja:'韓国',           en:'South Korea',   zh:'韩国',       ko:'한국',           es:'Corea del Sur', capital:{ ja:'ソウル',        en:'Seoul',           zh:'首尔',       ko:'서울',         es:'Seúl' } },
  { code:'th', ja:'タイ',           en:'Thailand',      zh:'泰国',       ko:'태국',           es:'Tailandia',     capital:{ ja:'バンコク',      en:'Bangkok',         zh:'曼谷',       ko:'방콕',         es:'Bangkok' } },
  { code:'vn', ja:'ベトナム',       en:'Vietnam',       zh:'越南',       ko:'베트남',         es:'Vietnam',       capital:{ ja:'ハノイ',        en:'Hanoi',           zh:'河内',       ko:'하노이',       es:'Hanói' } },
  { code:'id', ja:'インドネシア',   en:'Indonesia',     zh:'印度尼西亚', ko:'인도네시아',     es:'Indonesia',     capital:{ ja:'ジャカルタ',    en:'Jakarta',         zh:'雅加达',     ko:'자카르타',     es:'Yakarta' } },
  { code:'in', ja:'インド',         en:'India',         zh:'印度',       ko:'인도',           es:'India',         capital:{ ja:'ニューデリー',  en:'New Delhi',       zh:'新德里',     ko:'뉴델리',       es:'Nueva Delhi' } },
  { code:'ph', ja:'フィリピン',     en:'Philippines',   zh:'菲律宾',     ko:'필리핀',         es:'Filipinas',     capital:{ ja:'マニラ',        en:'Manila',          zh:'马尼拉',     ko:'마닐라',       es:'Manila' } },
  { code:'sg', ja:'シンガポール',   en:'Singapore',     zh:'新加坡',     ko:'싱가포르',       es:'Singapur',      capital:{ ja:'シンガポール',  en:'Singapore',       zh:'新加坡',     ko:'싱가포르',     es:'Singapur' } },
  // Europe
  { code:'fr', ja:'フランス',       en:'France',        zh:'法国',       ko:'프랑스',         es:'Francia',       capital:{ ja:'パリ',          en:'Paris',           zh:'巴黎',       ko:'파리',         es:'París' } },
  { code:'de', ja:'ドイツ',         en:'Germany',       zh:'德国',       ko:'독일',           es:'Alemania',      capital:{ ja:'ベルリン',      en:'Berlin',          zh:'柏林',       ko:'베를린',       es:'Berlín' } },
  { code:'it', ja:'イタリア',       en:'Italy',         zh:'意大利',     ko:'이탈리아',       es:'Italia',        capital:{ ja:'ローマ',        en:'Rome',            zh:'罗马',       ko:'로마',         es:'Roma' } },
  { code:'es', ja:'スペイン',       en:'Spain',         zh:'西班牙',     ko:'스페인',         es:'España',        capital:{ ja:'マドリード',    en:'Madrid',          zh:'马德里',     ko:'마드리드',     es:'Madrid' } },
  { code:'gb', ja:'イギリス',       en:'UK',            zh:'英国',       ko:'영국',           es:'Reino Unido',   capital:{ ja:'ロンドン',      en:'London',          zh:'伦敦',       ko:'런던',         es:'Londres' } },
  { code:'pt', ja:'ポルトガル',     en:'Portugal',      zh:'葡萄牙',     ko:'포르투갈',       es:'Portugal',      capital:{ ja:'リスボン',      en:'Lisbon',          zh:'里斯本',     ko:'리스본',       es:'Lisboa' } },
  { code:'ru', ja:'ロシア',         en:'Russia',        zh:'俄罗斯',     ko:'러시아',         es:'Rusia',         capital:{ ja:'モスクワ',      en:'Moscow',          zh:'莫斯科',     ko:'모스크바',     es:'Moscú' } },
  { code:'nl', ja:'オランダ',       en:'Netherlands',   zh:'荷兰',       ko:'네덜란드',       es:'Países Bajos',  capital:{ ja:'アムステルダム',en:'Amsterdam',       zh:'阿姆斯特丹', ko:'암스테르담',   es:'Ámsterdam' } },
  { code:'ch', ja:'スイス',         en:'Switzerland',   zh:'瑞士',       ko:'스위스',         es:'Suiza',         capital:{ ja:'ベルン',        en:'Bern',            zh:'伯尔尼',     ko:'베른',         es:'Berna' } },
  // Americas
  { code:'us', ja:'アメリカ',       en:'USA',           zh:'美国',       ko:'미국',           es:'EE.UU.',        capital:{ ja:'ワシントンD.C.',en:'Washington D.C.', zh:'华盛顿',     ko:'워싱턴 D.C.',  es:'Washington D.C.' } },
  { code:'ca', ja:'カナダ',         en:'Canada',        zh:'加拿大',     ko:'캐나다',         es:'Canadá',        capital:{ ja:'オタワ',        en:'Ottawa',          zh:'渥太华',     ko:'오타와',       es:'Ottawa' } },
  { code:'br', ja:'ブラジル',       en:'Brazil',        zh:'巴西',       ko:'브라질',         es:'Brasil',        capital:{ ja:'ブラジリア',    en:'Brasília',        zh:'巴西利亚',   ko:'브라질리아',   es:'Brasilia' } },
  { code:'mx', ja:'メキシコ',       en:'Mexico',        zh:'墨西哥',     ko:'멕시코',         es:'México',        capital:{ ja:'メキシコシティ',en:'Mexico City',     zh:'墨西哥城',   ko:'멕시코시티',   es:'Ciudad de México' } },
  { code:'ar', ja:'アルゼンチン',   en:'Argentina',     zh:'阿根廷',     ko:'아르헨티나',     es:'Argentina',     capital:{ ja:'ブエノスアイレス',en:'Buenos Aires',  zh:'布宜诺斯艾利斯',ko:'부에노스아이레스',es:'Buenos Aires' } },
  // Africa / Middle East
  { code:'za', ja:'南アフリカ',     en:'South Africa',  zh:'南非',       ko:'남아프리카',     es:'Sudáfrica',     capital:{ ja:'プレトリア',    en:'Pretoria',        zh:'比勒陀利亚', ko:'프리토리아',   es:'Pretoria' } },
  { code:'eg', ja:'エジプト',       en:'Egypt',         zh:'埃及',       ko:'이집트',         es:'Egipto',        capital:{ ja:'カイロ',        en:'Cairo',           zh:'开罗',       ko:'카이로',       es:'El Cairo' } },
  { code:'ae', ja:'UAE',            en:'UAE',           zh:'阿联酋',     ko:'아랍에미리트',   es:'EAU',           capital:{ ja:'アブダビ',      en:'Abu Dhabi',       zh:'阿布扎比',   ko:'아부다비',     es:'Abu Dabi' } },
  { code:'sa', ja:'サウジアラビア', en:'Saudi Arabia',  zh:'沙特阿拉伯', ko:'사우디아라비아', es:'Arabia Saudí',  capital:{ ja:'リヤド',        en:'Riyadh',          zh:'利雅得',     ko:'리야드',       es:'Riad' } },
  { code:'ng', ja:'ナイジェリア',   en:'Nigeria',       zh:'尼日利亚',   ko:'나이지리아',     es:'Nigeria',       capital:{ ja:'アブジャ',      en:'Abuja',           zh:'阿布贾',     ko:'아부자',       es:'Abuya' } },
  // Oceania
  { code:'au', ja:'オーストラリア', en:'Australia',     zh:'澳大利亚',   ko:'호주',           es:'Australia',     capital:{ ja:'キャンベラ',    en:'Canberra',        zh:'堪培拉',     ko:'캔버라',       es:'Canberra' } },
  { code:'nz', ja:'ニュージーランド',en:'New Zealand',  zh:'新西兰',     ko:'뉴질랜드',       es:'Nueva Zelanda', capital:{ ja:'ウェリントン',  en:'Wellington',      zh:'惠灵顿',     ko:'웰링턴',       es:'Wellington' } },
]

function flagUrl(code) {
  return `https://flagcdn.com/w160/${code}.png`
}

// ===== Stage definitions =====
const STAGES = [
  { nameJa:'やさしい', nameEn:'Easy',   nameZh:'简单', nameKo:'쉬움',   nameEs:'Fácil',   ids: [0,1,2,9,10,11,18,19,28,29], questions:10 },
  { nameJa:'ふつう',   nameEn:'Normal', nameZh:'普通', nameKo:'보통',   nameEs:'Normal',  ids: [3,4,5,6,7,12,13,14,15,16], questions:10 },
  { nameJa:'むずかしい', nameEn:'Hard', nameZh:'困难', nameKo:'어려움', nameEs:'Difícil', ids: [17,20,21,22,23,24,25,26,27,28], questions:10 },
]

const CONFETTI_EMOJIS = ['🎉','✨','🌟','🎊','💫','🎈']
const HI_KEY = 'kokki_hi'

function getStageName(stage, lang) {
  if (lang === 'en') return stage.nameEn
  if (lang === 'zh') return stage.nameZh
  if (lang === 'ko') return stage.nameKo
  if (lang === 'es') return stage.nameEs
  return stage.nameJa
}

function getCountryName(country, lang) {
  return country[lang] || country.ja
}

function makeChoices(correctIdx) {
  const wrong = []
  const pool = COUNTRIES.map((_, i) => i).filter(i => i !== correctIdx)
  while (wrong.length < 3) {
    const r = pool[Math.floor(Math.random() * pool.length)]
    if (!wrong.includes(r)) wrong.push(r)
  }
  const all = [correctIdx, ...wrong].sort(() => Math.random() - 0.5)
  return all
}

function spawnConfetti() {
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('span')
    el.className = 'ww-particle kokki-confetti'
    el.textContent = CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length]
    el.style.left  = (Math.random() * 100) + 'vw'
    el.style.top   = (Math.random() * 60 + 10) + 'vh'
    const angle = Math.random() * Math.PI * 2
    const dist  = 60 + Math.random() * 80
    el.style.setProperty('--px', (Math.cos(angle) * dist) + 'px')
    el.style.setProperty('--py', (Math.sin(angle) * dist - 40) + 'px')
    document.body.appendChild(el)
    setTimeout(() => { if (el.parentNode) el.remove() }, 900)
  }
}

export default function KokkiQuiz() {
  const navigate = useNavigate()
  const lang = getLang()

  const [screen,       setScreen]       = useState('title')
  const [stageIdx,     setStageIdx]     = useState(0)
  const [qIdx,         setQIdx]         = useState(0)
  const [score,        setScore]        = useState(0)
  const [choices,      setChoices]      = useState([])
  const [correctIdx,   setCorrectIdx]   = useState(0)
  const [feedback,     setFeedback]     = useState(null) // null | 'correct' | 'wrong'
  const [showReveal,   setShowReveal]   = useState(false)
  const [wrongChoice,  setWrongChoice]  = useState(null) // index into choices that is wrong
  const [timer,        setTimer]        = useState(10)
  const [clearData,    setClearData]    = useState(null)
  const [finalData,    setFinalData]    = useState(null)
  const [imgLoaded,    setImgLoaded]    = useState(false)

  const stageQueueRef  = useRef([])
  const timerRef       = useRef(null)
  const lockedRef      = useRef(false)

  const hiVal = parseInt(localStorage.getItem(HI_KEY) || '0')

  // Build question queue for a stage
  function buildQueue(sIdx) {
    const ids = [...STAGES[sIdx].ids].sort(() => Math.random() - 0.5)
    return ids.slice(0, STAGES[sIdx].questions)
  }

  function loadQuestion(queue, qNumber, stageScore) {
    if (qNumber >= queue.length) return null
    const cIdx = queue[qNumber]
    const ch   = makeChoices(cIdx)
    return { cIdx, ch }
  }

  function startStage(sIdx, initialScore) {
    const queue = buildQueue(sIdx)
    stageQueueRef.current = queue
    const q = loadQuestion(queue, 0, initialScore)
    if (!q) return
    lockedRef.current = false
    setStageIdx(sIdx)
    setQIdx(0)
    setScore(initialScore)
    setChoices(q.ch)
    setCorrectIdx(q.cIdx)
    setFeedback(null)
    setShowReveal(false)
    setWrongChoice(null)
    setTimer(10)
    setImgLoaded(false)
    setScreen('game')
  }

  // Timer countdown
  useEffect(() => {
    if (screen !== 'game') return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!lockedRef.current) handleAnswer(-1, true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, qIdx, stageIdx])

  function handleAnswer(choiceIdx, timeout = false) {
    if (lockedRef.current) return
    lockedRef.current = true
    clearInterval(timerRef.current)

    const correctCountryIdx = correctIdx
    const isCorrect = !timeout && choices[choiceIdx] === correctCountryIdx

    if (isCorrect) {
      playSoundCorrect()
      setFeedback('correct')
      setShowReveal(true)
    } else {
      playSoundWrong()
      setFeedback('wrong')
      setShowReveal(true)
      // find which choice button is the correct answer
      const correctChoicePos = choices.indexOf(correctCountryIdx)
      setWrongChoice(correctChoicePos)
    }

    const newScore = isCorrect ? score + 10 : score

    setTimeout(() => {
      const queue = stageQueueRef.current
      const nextQ = qIdx + 1

      if (nextQ >= STAGES[stageIdx].questions) {
        // Stage complete
        spawnConfetti()
        if (stageIdx < 2) {
          setClearData({ stageIdx, score: newScore })
          setScreen('stageClear')
        } else {
          const hi = Math.max(newScore, parseInt(localStorage.getItem(HI_KEY) || '0'))
          localStorage.setItem(HI_KEY, String(hi))
          setFinalData({ score: newScore, hi })
          setScreen('result')
        }
      } else {
        const q = loadQuestion(queue, nextQ, newScore)
        if (!q) return
        lockedRef.current = false
        setQIdx(nextQ)
        setScore(newScore)
        setChoices(q.ch)
        setCorrectIdx(q.cIdx)
        setFeedback(null)
        setShowReveal(false)
        setWrongChoice(null)
        setTimer(10)
        setImgLoaded(false)
      }
    }, 1500)
  }

  async function handleStartStage(sIdx) {
    await ensureAudioStarted()
    playKokkiBgm()
    startStage(sIdx, 0)
  }

  function handleNextStage() {
    const nextIdx = clearData.stageIdx + 1
    startStage(nextIdx, clearData.score)
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      stopBgm()
    }
  }, [])

  const currentCountry = COUNTRIES[correctIdx]

  // ── Title Screen ──
  if (screen === 'title') return (
    <div className="kokki-wrap kokki-title-screen">
      <div className="kokki-title-icon">🌍</div>
      <div className="kokki-title-text">
        {lang === 'ja' ? 'こっきクイズ' :
         lang === 'zh' ? '国旗问答' :
         lang === 'ko' ? '국기 퀴즈' :
         lang === 'es' ? 'Quiz de Banderas' :
         'Flag Quiz'}
      </div>
      <div className="kokki-title-desc">
        {lang === 'ja' ? 'せかいの こっきを みわけよう！\n30かこく以上！' :
         lang === 'zh' ? '识别世界各国国旗！\n30多个国家！' :
         lang === 'ko' ? '세계 국기를 맞혀봐!\n30개국 이상!' :
         lang === 'es' ? '¡Identifica banderas del mundo!\n¡Más de 30 países!' :
         'Identify world flags!\n30+ countries!'}
      </div>
      {hiVal > 0 && (
        <div className="kokki-hi">🏆 {t(lang, 'hiScore')}: {hiVal}</div>
      )}
      <div className="kokki-stage-select">
        {STAGES.map((stage, i) => (
          <button
            key={i}
            className="kokki-stage-btn"
            onClick={() => handleStartStage(i)}
          >
            {getStageName(stage, lang)}
          </button>
        ))}
      </div>
      <button className="ww-back-btn" onClick={() => { stopBgm(); transitionBack(navigate) }}>
        {t(lang, 'back')}
      </button>
    </div>
  )

  // ── Stage Clear Screen ──
  if (screen === 'stageClear') return (
    <div className="kokki-wrap kokki-clear-screen">
      <div className="kokki-clear-icon">✨</div>
      <div className="kokki-clear-text">{t(lang, 'stageClear')}</div>
      <div className="kokki-clear-score">{t(lang, 'score')}: {clearData?.score}</div>
      <button className="kokki-stage-btn" onClick={handleNextStage}>
        {lang === 'ja' ? 'つぎのステージへ ▶' :
         lang === 'zh' ? '下一关 ▶' :
         lang === 'ko' ? '다음 스테이지 ▶' :
         lang === 'es' ? 'Siguiente nivel ▶' :
         'Next Stage ▶'}
      </button>
      <button className="ww-back-btn" onClick={() => { stopBgm(); transitionBack(navigate) }}>
        {t(lang, 'back')}
      </button>
    </div>
  )

  // ── Final Result Screen ──
  if (screen === 'result') return (
    <div className="kokki-wrap kokki-result-screen">
      <div className="kokki-result-icon">🌍</div>
      <div className="kokki-result-title">
        {lang === 'ja' ? 'おわり！' :
         lang === 'zh' ? '完成！' :
         lang === 'ko' ? '완료!' :
         lang === 'es' ? '¡Terminado!' :
         'Finished!'}
      </div>
      <div className="kokki-result-score">{t(lang, 'score')}: {finalData?.score}</div>
      <div className="kokki-result-hi">🏆 {t(lang, 'hiScore')}: {finalData?.hi}</div>
      <button className="kokki-stage-btn" onClick={() => { stopBgm(); setScreen('title') }}>
        {t(lang, 'retry')}
      </button>
      <button className="ww-back-btn" onClick={() => { stopBgm(); transitionBack(navigate) }}>
        {t(lang, 'back')}
      </button>
    </div>
  )

  // ── Game Screen ──
  const timerPct = timer / 10
  return (
    <div className="kokki-wrap kokki-game-screen">
      {/* HUD */}
      <div className="kokki-hud">
        <span className="kokki-hud-stage">
          🌍 {t(lang, 'stage')} {stageIdx + 1}/3 &nbsp; Q {qIdx + 1}/10
        </span>
        <span className="kokki-hud-score">⭐ {score}</span>
      </div>

      {/* Timer bar */}
      <div className="kokki-timer-track">
        <div
          className="kokki-timer-bar"
          style={{
            width: `${timerPct * 100}%`,
            background: timerPct > 0.4 ? '#4CAF50' : timerPct > 0.2 ? '#FFC107' : '#f44336',
          }}
        />
      </div>

      {/* Flag */}
      <div className={`kokki-flag-wrap${feedback === 'wrong' ? ' kokki-shake' : ''}`}>
        <div className="kokki-flag">
          {!imgLoaded && <div className="kokki-flag-skeleton" />}
          <img
            key={currentCountry?.code}
            src={flagUrl(currentCountry?.code)}
            alt={getCountryName(currentCountry, 'en')}
            className="kokki-flag-img"
            style={{ display: imgLoaded ? 'block' : 'none' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />
        </div>
        {showReveal && (
          <div className={`kokki-reveal${feedback === 'correct' ? ' kokki-reveal--correct' : ' kokki-reveal--wrong'}`}>
            <span>{feedback === 'correct' ? '✅' : '❌'} {getCountryName(currentCountry, lang)}</span>
            <span className="kokki-capital">🏛 {currentCountry?.capital?.[lang] || currentCountry?.capital?.ja}</span>
          </div>
        )}
      </div>

      {/* Answer buttons 2x2 */}
      <div className="kokki-choices">
        {choices.map((countryIdx, i) => {
          let cls = 'kokki-choice-btn'
          if (feedback) {
            if (countryIdx === correctIdx) cls += ' kokki-choice-btn--correct'
            else if (wrongChoice === i && feedback === 'wrong') cls += ' kokki-choice-btn--wrong'
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => handleAnswer(i)}
              disabled={!!feedback}
            >
              {getCountryName(COUNTRIES[countryIdx], lang)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
