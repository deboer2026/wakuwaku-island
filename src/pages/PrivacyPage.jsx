import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

export default function PrivacyPage() {
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
          {en ? '🔒 Privacy Policy' : '🔒 プライバシーポリシー'}
        </span>
      </div>

      <div className="legal-content">
        <div className="legal-icon">🔒</div>
        <h1 className="legal-title">
          {en ? 'Privacy Policy' : 'プライバシーポリシー'}
        </h1>
        <p className="legal-date">
          {en ? 'Last updated: 2025-05-01' : '最終更新日：2025年5月1日'}
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
              ? 'This site saves the following data locally in your browser (localStorage) to provide game features. This data is stored only on your device and is never sent to any server.'
              : '当サイトでは、ゲームの機能を提供するため、以下のデータをお使いのブラウザ内（localStorage）にのみ保存します。このデータはお使いの端末内にのみ保存され、外部サーバーに送信されることは一切ありません。'}
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
              </>
            ) : (
              <>
                <li>言語設定（日本語 / 英語）</li>
                <li>ミュート設定（音あり / 音なし）</li>
                <li>各ゲームのハイスコア</li>
                <li>コイン枚数・ログインボーナスの連続日数</li>
                <li>キャラクターの着せ替え設定</li>
                <li>ショップで解放したアイテム</li>
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
              ? 'This site uses Google Analytics to understand how the site is being used (e.g., number of page views, which games are popular). Google Analytics collects anonymous, aggregate data and does not identify individual users.'
              : '当サイトでは、サイトの利用状況（ページビュー数、人気ゲームなど）を把握するためにGoogle Analyticsを使用しています。Google Analyticsは匿名の集計データを収集するものであり、個人を特定するものではありません。'}
          </p>
          <p style={{ marginTop: 8 }}>
            {en
              ? 'Google Analytics uses cookies to collect anonymous statistical data. You can opt out by installing the Google Analytics Opt-out Browser Add-on.'
              : 'Google Analyticsはクッキーを使用して匿名の統計データを収集します。Google アナリティクス オプトアウト アドオンをインストールすることで、収集を拒否することができます。'}
          </p>
          <p style={{ marginTop: 8 }}>
            {en
              ? 'For details on how Google handles data, please see Google\'s Privacy Policy.'
              : 'Googleによるデータの取り扱いについては、Googleのプライバシーポリシーをご確認ください。'}
          </p>
        </div>

        {/* 5 */}
        <div className="legal-section">
          <h2>👶 {en ? 'For Children\'s Safety' : 'お子さまの安全のために'}</h2>
          <p>
            {en
              ? 'This site is designed for children. We do not display advertising, do not link to external sites that collect personal information, and do not include any features for communication between users.'
              : '当サイトは子ども向けに設計されています。広告の表示は行わず、個人情報を収集する外部サイトへのリンクも設けていません。また、ユーザー間でのコミュニケーション機能も一切ありません。'}
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
              ? 'If you have any questions about this Privacy Policy, please contact us through the site\'s inquiry form.'
              : 'このプライバシーポリシーについてご不明な点がございましたら、サイトのお問い合わせフォームよりご連絡ください。'}
          </p>
        </div>

        <p className="legal-footnote">
          © 2025 Wakuwaku Island. {en ? 'All rights reserved.' : 'All rights reserved.'}
        </p>
      </div>
    </div>
  );
}
