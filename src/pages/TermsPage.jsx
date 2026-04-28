import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

export default function TermsPage() {
  const navigate = useNavigate();
  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const en = lang === 'en';

  return (
    <div className="legal-wrap">
      {/* ── ヘッダー ── */}
      <div className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate('/')}>
          🏝️ {en ? 'Back' : 'もどる'}
        </button>
        <span className="legal-header-title">
          {en ? '📜 Terms of Use' : '📜 利用規約'}
        </span>
      </div>

      <div className="legal-content">
        <div className="legal-icon">📜</div>
        <h1 className="legal-title">
          {en ? 'Terms of Use' : '利用規約'}
        </h1>
        <p className="legal-date">
          {en ? 'Last updated: 2025-05-01' : '最終更新日：2025年5月1日'}
        </p>

        {/* 1 */}
        <div className="legal-section">
          <h2>🌐 {en ? 'About This Site' : 'サイトについて'}</h2>
          <p>
            {en
              ? 'Wakuwaku Island ("this site") is a free online game site for children, provided free of charge. By using this site, you agree to these Terms of Use.'
              : 'わくわくアイランド（以下「当サイト」）は、子ども向けの無料オンラインゲームサイトです。当サイトをご利用いただくことで、この利用規約に同意したものとみなします。'}
          </p>
        </div>

        {/* 2 */}
        <div className="legal-section">
          <h2>✅ {en ? 'Permitted Use' : '利用について'}</h2>
          <ul>
            {en ? (
              <>
                <li>This site can be used free of charge by anyone</li>
                <li>Children under 13 should use this site with parental supervision</li>
                <li>This site can be used on PC, smartphone, and tablet browsers</li>
                <li>Game high scores and settings are saved in your browser (localStorage)</li>
              </>
            ) : (
              <>
                <li>当サイトはどなたでも無料でご利用いただけます</li>
                <li>13歳未満のお子さまは保護者の監督のもとでご利用ください</li>
                <li>PC・スマートフォン・タブレットのブラウザでご利用いただけます</li>
                <li>ゲームのハイスコアや設定はブラウザ内（localStorage）に保存されます</li>
              </>
            )}
          </ul>
        </div>

        {/* 3 */}
        <div className="legal-section">
          <h2>🚫 {en ? 'Prohibited Activities' : '禁止事項'}</h2>
          <ul>
            {en ? (
              <>
                <li>Actions that damage or interfere with this site</li>
                <li>Unauthorized modification or reverse engineering of site content</li>
                <li>Commercial use or redistribution of site content without permission</li>
                <li>Actions that violate laws or public morals</li>
                <li>Any other actions deemed inappropriate by the site operator</li>
              </>
            ) : (
              <>
                <li>当サイトを毀損・妨害する行為</li>
                <li>当サイトのコンテンツの無断改変・リバースエンジニアリング</li>
                <li>当サイトのコンテンツの無断での商用利用・再配布</li>
                <li>法令または公序良俗に違反する行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </>
            )}
          </ul>
        </div>

        {/* 4 */}
        <div className="legal-section">
          <h2>⚠️ {en ? 'Disclaimer' : '免責事項'}</h2>
          <ul>
            {en ? (
              <>
                <li>Game scores and progress saved in localStorage may be lost if browser data is cleared</li>
                <li>The site operator is not responsible for any damages resulting from use of this site</li>
                <li>Content and features may be changed or discontinued without notice</li>
                <li>We do not guarantee uninterrupted availability of the site</li>
              </>
            ) : (
              <>
                <li>localStorageに保存されたゲームデータはブラウザのデータ削除により消去される場合があります</li>
                <li>当サイトの利用により生じた損害について、運営者は一切の責任を負いません</li>
                <li>コンテンツや機能は予告なく変更・終了する場合があります</li>
                <li>サイトの継続的な利用可能性を保証するものではありません</li>
              </>
            )}
          </ul>
        </div>

        {/* 5 */}
        <div className="legal-section">
          <h2>©️ {en ? 'Copyright' : '著作権'}</h2>
          <p>
            {en
              ? 'All content on this site (games, designs, text, etc.) is owned by the site operator. Unauthorized reproduction or use is prohibited. Emoji displayed on the site are provided by third parties (OS/browser vendors) and are subject to their respective licenses.'
              : '当サイトのすべてのコンテンツ（ゲーム・デザイン・テキスト等）は運営者に帰属します。無断転載・無断利用を禁止します。なお、サイト上で表示している絵文字はOS・ブラウザベンダー等の第三者が提供するものであり、各々のライセンスに従います。'}
          </p>
        </div>

        {/* 6 */}
        <div className="legal-section">
          <h2>🔄 {en ? 'Changes to Terms' : '規約の変更'}</h2>
          <p>
            {en
              ? 'These Terms of Use may be updated at any time without prior notice. The latest version will always be available on this page.'
              : '本利用規約は予告なく変更される場合があります。最新版は常にこのページでご確認いただけます。'}
          </p>
        </div>

        {/* Contact */}
        <div className="legal-contact">
          <h2 style={{ justifyContent: 'center', marginBottom: 8 }}>
            ✉️ {en ? 'Contact' : 'お問い合わせ'}
          </h2>
          <p>
            {en
              ? 'If you have any questions about these Terms of Use, please contact us through the site\'s inquiry form.'
              : '利用規約についてご不明な点がございましたら、サイトのお問い合わせフォームよりご連絡ください。'}
          </p>
        </div>

        <p className="legal-footnote">
          © 2025 Wakuwaku Island. {en ? 'All rights reserved.' : 'All rights reserved.'}
        </p>
      </div>
    </div>
  );
}
