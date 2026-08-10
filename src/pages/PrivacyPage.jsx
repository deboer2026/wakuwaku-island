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
          {en ? 'Last updated: 2026-08-10' : '最終更新日：2026年8月10日'}
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
          <h2>📵 {en ? 'No Personal Information Collected' : '個人情報の非収集'}</h2>
          <p>
            {en
              ? 'This site does NOT collect any of the following:'
              : '当サイトでは、以下の個人情報は一切収集しません：'}
          </p>
          <ul>
            {en ? (
              <>
                <li>Name, address, phone number, or email address</li>
                <li>Account registration information</li>
                <li>Payment or financial information</li>
                <li>Information that could identify specific individuals</li>
              </>
            ) : (
              <>
                <li>氏名・住所・電話番号・メールアドレス等の個人情報</li>
                <li>アカウント登録情報</li>
                <li>支払い・金融情報</li>
                <li>特定の個人を識別できる情報</li>
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
                <li>Language setting (Japanese / English)</li>
                <li>Mute setting (sound on / off)</li>
                <li>High scores for each game</li>
                <li>Coin count and login bonus streak</li>
                <li>Costume (Kisekae) selection for characters</li>
                <li>Unlocked shop items</li>
                <li>Recent play history and display preferences</li>
              </>
            ) : (
              <>
                <li>言語設定（日本語 / 英語）</li>
                <li>ミュート設定（音あり / 音なし）</li>
                <li>各ゲームのハイスコア</li>
                <li>コイン枚数・ログインボーナスの連続日数</li>
                <li>キャラクターの着せ替え設定</li>
                <li>ショップで解放したアイテム</li>
                <li>最近遊んだゲーム・表示設定</li>
              </>
            )}
          </ul>
          <p style={{ marginTop: 10 }}>
            {en
              ? 'You can delete this data at any time by clearing your browser\'s site data.'
              : 'これらのデータはブラウザのサイトデータを削除することで、いつでも消去できます。'}
          </p>
        </div>

        {/* 4 */}
        <div className="legal-section">
          <h2>📊 {en ? 'Google Analytics' : 'Google Analyticsについて'}</h2>
          <p>
            {en
              ? 'This site uses Google Analytics to understand usage such as page views, popular games, device/browser information, approximate location, access time, and referral source. Google may process these data using cookies and similar technologies. We do not use the analytics data to directly identify individual visitors.'
              : '当サイトでは、ページビュー、人気ゲーム、端末・ブラウザ情報、おおよその地域、アクセス日時、参照元などを把握し改善するため、Google Analyticsを使用しています。GoogleはCookie等を利用してこれらの情報を処理する場合があります。当サイトでは、アクセス解析情報を個人を直接特定する目的で利用しません。'}
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

        {/* Contact */}
        <div className="legal-contact">
          <h2 style={{ justifyContent: 'center', marginBottom: 8 }}>
            ✉️ {en ? 'Contact' : 'お問い合わせ'}
          </h2>
          <p>
            {en
              ? 'A public contact channel is being prepared. When available, it will be published on this page and the For Parents page.'
              : '公開用のお問い合わせ窓口は現在整備中です。開設後、このページと「保護者の方へ」に掲載します。'}
          </p>
        </div>

        <p className="legal-footnote">
          © 2026 Wakuwaku Island. All rights reserved.
        </p>
      </div>
    </div>
  );
}
