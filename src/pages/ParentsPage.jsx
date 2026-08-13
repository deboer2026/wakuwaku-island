import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaticPageSEO from '../seo/StaticPageSEO';
import { trackEvent } from '../utils/analytics';
import './LegalPage.css';

export default function ParentsPage() {
  const navigate = useNavigate();
  const [lang] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('wakuwaku_lang') : null) || 'ja');
  const en = lang === 'en';
  const title = en ? 'For Parents｜Wakuwaku Island' : '保護者の方へ｜わくわくアイランド';
  const description = en
    ? 'Safety, privacy, pricing, recommended ages, and device storage information for parents and guardians.'
    : 'わくわくアイランドの料金、広告、個人情報、推奨年齢、端末内データについて保護者向けにご案内します。';

  return (
    <div className="legal-wrap">
      <StaticPageSEO route="/parents" title={title} description={description} />
      <div className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate('/')}>🏝️ {en ? 'Back' : 'もどる'}</button>
        <span className="legal-header-title">{en ? '👪 For Parents' : '👪 保護者の方へ'}</span>
      </div>

      <main className="legal-content">
        <div className="legal-icon">👪</div>
        <h1 className="legal-title">{en ? 'For Parents and Guardians' : '保護者の方へ'}</h1>
        <p className="legal-date">{en ? 'Last updated: 2026-08-10' : '最終更新日：2026年8月10日'}</p>

        <div className="legal-section legal-highlight">
          <h2>🌟 {en ? 'Quick summary' : 'まず知っていただきたいこと'}</h2>
          <ul>
            <li>{en ? 'All games are free. No payment or account registration is required.' : 'すべてのゲームを無料で遊べます。課金・会員登録はありません。'}</li>
            <li>{en ? 'The site has no advertising and no communication between users.' : '広告表示や、利用者同士の交流機能はありません。'}</li>
            <li>{en ? 'Game progress is stored on the device and may be deleted with browser data.' : 'ゲームの記録はお使いの端末内に保存され、ブラウザデータの削除で消える場合があります。'}</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>🎮 {en ? 'How to choose a game' : 'ゲームの選び方'}</h2>
          <p>{en
            ? 'The home page lets you filter games by age and play style. Ages are a guide; difficulty and controls vary by child, so we recommend playing together the first time.'
            : 'トップページでは、年齢や遊び方からゲームを絞り込めます。対象年齢は目安です。お子さまによって操作の得意・不得意が異なるため、初回は一緒に遊んで操作をご確認ください。'}</p>
        </div>

        <div className="legal-section">
          <h2>🔒 {en ? 'Privacy and analytics' : 'プライバシーとアクセス解析'}</h2>
          <p>{en
            ? 'We do not provide account registration, chat, comments, or payment. Google Analytics is used to understand page usage and improve the site. Please see the Privacy Policy for details.'
            : '会員登録、チャット、コメント、決済機能は提供していません。利用状況の把握と改善のためGoogle Analyticsを使用しています。詳しくはプライバシーポリシーをご確認ください。'}</p>
          <button className="legal-link-btn" onClick={() => navigate('/privacy')}>{en ? 'Read the Privacy Policy' : 'プライバシーポリシーを見る'}</button>
        </div>

        <div className="legal-section">
          <h2>💾 {en ? 'Data saved on the device' : '端末内に保存されるデータ'}</h2>
          <p>{en
            ? 'Language, sound, scores, coins, login bonuses, costume settings, unlocked items, and recent play history may be stored in localStorage. This data does not move to another device.'
            : '言語、音量、スコア、コイン、ログインボーナス、着せ替え、解放済みアイテム、最近遊んだゲームなどをlocalStorageに保存する場合があります。これらのデータは別の端末へ引き継がれません。'}</p>
        </div>

        <div className="legal-section">
          <h2>🏝️ {en ? 'Operator' : '運営について'}</h2>
          <p>{en
            ? 'Wakuwaku Island is operated by the Wakuwaku Island team. A public contact channel is being prepared; details will be added here and to the policy pages when available.'
            : '当サイトは「わくわくアイランド運営」が企画・制作・運営しています。公開用のお問い合わせ窓口は現在整備中で、開設後にこのページとポリシーへ掲載します。'}</p>
        </div>

        <div className="legal-section legal-highlight">
          <h2>🤖 RoboBella</h2>
          <p>{en
            ? 'RoboBella is a related site for enjoying AI videos, games, and AI information. It opens in a new tab.'
            : 'RoboBellaは、AI動画・ゲーム・AI情報を楽しめる関連サイトです。新しいタブで開きます。'}</p>
          <a className="legal-link-btn legal-external-link"
            href="https://robobella.wakuwakuislands.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('robobella_portal_click', { source_context:'parents', source_page:'/parents' })}>
            🤖 {en ? 'Visit RoboBella' : 'RoboBellaを見る'}
          </a>
        </div>

        <p className="legal-footnote">© 2026 Wakuwaku Island. All rights reserved.</p>
      </main>
    </div>
  );
}
