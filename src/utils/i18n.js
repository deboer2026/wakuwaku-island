// src/utils/i18n.js
// ===== Common game UI translations (5 languages) =====
const T = {
  start:        { ja:'スタート',        en:'Start',            zh:'开始',          ko:'시작',          es:'¡Comenzar!' },
  back:         { ja:'🏠 トップへもどる', en:'🏠 Back to Top',   zh:'🏠 返回首页',   ko:'🏠 홈으로',     es:'🏠 Volver' },
  hiScore:      { ja:'ハイスコア',       en:'Best Score',       zh:'最高分',        ko:'최고점수',      es:'Récord' },
  score:        { ja:'スコア',          en:'Score',            zh:'得分',          ko:'점수',          es:'Puntos' },
  gameOver:     { ja:'ゲームオーバー',   en:'Game Over',        zh:'游戏结束',      ko:'게임 오버',     es:'Fin del juego' },
  stageClear:   { ja:'ステージクリア！', en:'Stage Clear!',     zh:'关卡通过！',    ko:'스테이지 클리어!', es:'¡Nivel superado!' },
  retry:        { ja:'もういちど',       en:'Play Again',       zh:'再玩一次',      ko:'다시하기',      es:'Repetir' },
  life:         { ja:'ライフ',          en:'Lives',            zh:'生命',          ko:'목숨',          es:'Vidas' },
  easy:         { ja:'かんたん',         en:'Easy',             zh:'简单',          ko:'쉬움',          es:'Fácil' },
  challenge:    { ja:'チャレンジ',       en:'Challenge',        zh:'挑战',          ko:'도전',          es:'Desafío' },
  correct:      { ja:'せいかい！',       en:'Correct!',         zh:'正确！',        ko:'정답!',         es:'¡Correcto!' },
  wrong:        { ja:'ざんねん…',       en:'Wrong...',         zh:'不对…',         ko:'틀렸어요…',    es:'Incorrecto…' },
  stage:        { ja:'ステージ',         en:'Stage',            zh:'关卡',          ko:'스테이지',      es:'Nivel' },
  // Extended strings
  timeLeft:     { ja:'のこり',          en:'Left',             zh:'剩余',          ko:'남은',          es:'Queda' },
  howToPlay:    { ja:'あそびかた',       en:'How to Play',      zh:'玩法',          ko:'게임 방법',     es:'Cómo jugar' },
  next:         { ja:'つぎへ',          en:'Next',             zh:'下一关',        ko:'다음으로',      es:'Siguiente' },
  backToTitle:  { ja:'タイトルへ',      en:'Back to Title',    zh:'返回标题',      ko:'타이틀로',      es:'Al título' },
  newRecord:    { ja:'ニューレコード！', en:'New Record!',      zh:'新纪录！',      ko:'신기록!',       es:'¡Nuevo récord!' },
  best:         { ja:'ハイスコア',      en:'Best',             zh:'最高分',        ko:'최고점수',      es:'Récord' },
  amazing:      { ja:'すごい！',        en:'Amazing!',         zh:'太棒了！',      ko:'대단해요!',     es:'¡Increíble!' },
  nice:         { ja:'ナイス！',        en:'Nice!',            zh:'不错！',        ko:'잘했어요!',     es:'¡Bien!' },
  tryAgain:     { ja:'もういちど',      en:'Try Again!',       zh:'再试一次！',    ko:'다시 도전!',    es:'¡Inténtalo!' },
  keepGoing:    { ja:'またちょうせん！', en:'Keep challenging!', zh:'继续加油！',   ko:'계속 도전해봐!', es:'¡Sigue intentando!' },
  wellDone:     { ja:'よくできました！', en:'Well done!',       zh:'做得好！',      ko:'잘했어요!',     es:'¡Bien hecho!' },
  miss:         { ja:'ミス',           en:'Miss',             zh:'错误',          ko:'미스',          es:'Error' },
  time:         { ja:'じかん',         en:'Time',             zh:'时间',          ko:'시간',          es:'Tiempo' },
  champion:     { ja:'チャンピオン！',  en:'Champion!',        zh:'冠军！',        ko:'챔피언!',       es:'¡Campeón!' },
  animals:      { ja:'どうぶつ',       en:'Animals',          zh:'动物',          ko:'동물',          es:'Animales' },
  warning:      { ja:'どうぶつはおしちゃダメ！', en:"Don't tap the animals!", zh:'不要点击动物！', ko:'동물을 탭하지 마세요!', es:'¡No toques los animales!' },
}

export function t(lang, key) {
  return T[key]?.[lang] ?? T[key]?.ja ?? key
}

export function getLang() {
  if (typeof localStorage === 'undefined') return 'ja'
  return localStorage.getItem('wakuwaku_lang') || 'ja'
}
