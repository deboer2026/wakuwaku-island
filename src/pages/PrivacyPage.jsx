import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaticPageSEO from '../seo/StaticPageSEO';
import './LegalPage.css';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [lang] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('wakuwaku_lang') : null) || 'ja');
  const en = lang === 'en';
  const title = en ? 'Privacy Policy｜Wakuwaku Island' : 'プライバシーポリシー｜わくわくアイランド';
  const description = en
    ? 'How Wakuwaku Island handles device data, cookies, analytics, and children’s privacy.'
    : 'わくわくアイランドにおける端末内データ、Cookie、アクセス解析、お子さまのプライバシーの取り扱いをご案内します。';

  return (
    <div className="legal-wrap">
      <StaticPageSEO route="/privacy" title={title} description={description} />
      {/* ── ヘッダー ── */}
      <div className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate('/')}>
          🏝️ {en ? 'Back' : 'もどる'}
        </button>
        <span className="legal-header-title">
          {en ? '🔒 Privacy Policy' : '🔒 プライバシーポリシー'}
        </span>
      </div>

      <div className="legal-content">
        <div className="legal-icon">🔒</div>
        <h1 className="legal-title">
          {en ? 'Privacy Policy' : 'プライバシーポリシー'}
        </h1>
        <p className="legal-date">
          {en ? 'Last updated: 2026-08-26' : '最終更新日：2026年8月26日'}
        </p>

        {/* 1 */}
        <div className="legal-section">
          <h2>📋 {en ? 'Overview' : 'はじめに'}</h2>
          <p>
            {en
              ? 'Wakuwaku Island ("this site") is a free online game site for children. We are committed to protecting the privacy of all visitors. This policy describes how we handle information.'
              : 'わくわくアイランド（以下「当サイト」）は、子ども向けの無料オンラインゲームサイトです。すべての訪問者のプライバシーを保護することに努めています。このポリシーでは、情報の取り扱いについてご説明します。'}
          </p>
        </div>

        {/* 2 */}
        <div className="legal-section">
          <h2>📵 {en ? 'Information we do not ask you to provide' : '利用者から直接取得しない情報'}</h2>
          <p>
            {en
              ? 'This site has no feature for visitors to enter or register the following information:'
              : '当サイトには、利用者が以下の情報を入力・登録する機能はありません：'}
          </p>
          <ul>
            {en ? (
              <>
                <li>Name, address, phone number, or email address</li>
                <li>Account registration information</li>
                <li>Payment or financial information</li>
              </>
            ) : (
              <>
                <li>氏名・住所・電話番号・メールアドレス等の個人情報</li>
                <li>アカウント登録情報</li>
                <li>支払い・金融情報</li>
              </>
            )}
          </ul>
        </div>

        {/* 3 */}
        <div className="legal-section">
          <h2>💾 {en ? 'Use of localStorage' : 'localStorageの使用について'}</h2>
          <p>
            {en
              ? 'This site saves the following data locally in your browser (localStorage) to provide game features. This game data is stored on your device and is not synchronized to an account.'
              : '当サイトでは、ゲーム機能を提供するため、以下のゲームデータをお使いのブラウザ内（localStorage）に保存します。アカウントへの同期や別端末への引き継ぎは行いません。'}
          </p>
          <ul>
            {en ? (
              <>
                <li>Display language setting</li>
                <li>Mute setting (sound on / off)</li>
                <li>Scores, stars, and game progress</li>
                <li>Coin count and login bonus information</li>
                <li>Costume (Kisekae) selection for characters</li>
                <li>Unlocked shop items</li>
                <li>Recent play history and other settings</li>
              </>
            ) : (
              <>
                <li>表示言語の設定</li>
                <li>ミュート設定（音あり / 音なし）</li>
                <li>スコア・星・ゲーム進行</li>
                <li>コイン枚数・ログインボーナス情報</li>
                <li>キャラクターの着せ替え設定</li>
                <li>ショップで解放したアイテム</li>
                <li>最近遊んだゲーム・各種設定</li>
              </>
            )}
          </ul>
          <p style={{ marginTop: 10 }}>
            {en
              ? 'You can delete this data at any time by clearing your browser\'s site data.'
              : 'これらのデータはブラウザのサイトデータを削除することで、いつでも消去できます。'}
          </p>
          <p style={{ marginTop: 10 }}>
            {en
              ? 'Some games may also send game ID or name, stage, result, stars, score, and engagement time to Google Analytics as usage metrics for site improvement. These events are not implemented to include names, email addresses, or other contact details.'
              : '一部のゲームでは、game ID・ゲーム名・ステージ・結果・星・スコア・利用時間などの利用指標を、サイト改善のためGoogle Analyticsへ分析イベントとして送信する場合があります。これらのイベントに氏名・メールアドレス等を付加する実装はありません。'}
          </p>
        </div>

        {/* 4 */}
        <div className="legal-section">
          <h2>📊 {en ? 'Google Analytics' : 'Google Analyticsについて'}</h2>
          <p>
            {en
              ? 'This site uses Google Analytics to understand site usage and improve the site. Google may process cookie-like identifiers, page paths, page and game usage metrics, basic browser/device information, country-level approximate location, and access or referral information. Detailed location and device-data collection are disabled in this site’s Google Analytics settings.'
              : '当サイトでは、サイト利用状況の把握と改善のためGoogle Analyticsを使用しています。Cookie等の識別子、ページパス、ページ・ゲームの利用指標、基本的なブラウザ・端末情報、国等の大まかな地域情報、アクセス・参照情報が扱われる場合があります。当サイトのGoogle Analytics設定では、詳細な地域・端末データ収集は無効にしています。'}
          </p>
          <p style={{ marginTop: 8 }}>
            {en
              ? 'Analytics data on this site is not used for ads personalization, Google Signals, remarketing, advertising-service links such as Google Ads, or audience export to ads. User-provided data collection is disabled, and this site does not use User-ID.'
              : 'Google Analyticsのデータを、当サイトでは広告パーソナライズ、Google Signals、リマーケティング、Google Ads等の広告サービス連携、広告向けオーディエンスのエクスポートには使用していません。ユーザー提供データの収集は無効であり、当サイトではUser-IDを使用していません。'}
          </p>
          <p style={{ marginTop: 8 }}>
            {en
              ? 'The retention setting for user-level and event-level Google Analytics data is 2 months, with reset on new activity turned off. This setting does not mean that every aggregated Analytics report is deleted after 2 months.'
              : 'Google Analyticsのユーザー単位・イベント単位データの保持設定は2か月で、新しいアクティビティ時のリセットは無効です。この設定は、すべての集計済みAnalyticsレポートが2か月後に削除されることを意味するものではありません。'}
          </p>
          <p style={{ marginTop: 8 }}>
            {en
              ? 'You can limit collection through your browser settings or the Google Analytics Opt-out Browser Add-on.'
              : 'ブラウザの設定やGoogle アナリティクス オプトアウト アドオンを利用して、収集を制限できます。'}
          </p>
          <p style={{ marginTop: 8 }}>
            {en
              ? 'See Google’s information on data use on partner sites, Privacy Policy, and the opt-out add-on for details.'
              : '詳しくは、Googleのサービス利用サイトにおけるデータ使用、プライバシーポリシー、オプトアウト アドオンをご確認ください。'}
          </p>
          <ul>
            <li><a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener noreferrer">{en ? 'How Google uses data on partner sites' : 'Googleのサービス利用サイトにおけるデータ使用'}</a></li>
            <li><a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener noreferrer">{en ? 'Google Privacy Policy' : 'Google プライバシーポリシー'}</a></li>
            <li><a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener noreferrer">{en ? 'Google Analytics opt-out add-on' : 'Google アナリティクス オプトアウト アドオン'}</a></li>
          </ul>
        </div>

        {/* 5 */}
        <div className="legal-section">
          <h2>👶 {en ? 'For Children\'s Safety' : 'お子さまの安全のために'}</h2>
          <p>
            {en
              ? 'This site is designed for children. It has no advertising, account registration, payment, chat, comments, or other user-to-user communication. Policy and analytics information may link to external official resources for parents and guardians.'
              : '当サイトは子ども向けに設計されています。広告、会員登録、決済、チャット、コメント等の利用者間コミュニケーション機能はありません。保護者向けのポリシー・アクセス解析の説明から、外部の公式情報へリンクする場合があります。'}
          </p>
        </div>

        {/* 6 */}
        <div className="legal-section">
          <h2>🔄 {en ? 'Changes to This Policy' : 'ポリシーの変更'}</h2>
          <p>
            {en
              ? 'We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date.'
              : '当サイトは必要に応じてこのプライバシーポリシーを更新することがあります。変更があった場合は、このページの更新日を変更してお知らせします。'}
          </p>
        </div>

        <p className="legal-footnote">
          © 2026 Wakuwaku Island. All rights reserved.
        </p>
      </div>
    </div>
  );
}
