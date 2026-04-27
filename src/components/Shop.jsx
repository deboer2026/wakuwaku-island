import { useState } from 'react';
import { getCoins, spendCoins } from '../utils/coins';
import { unlockItem, isItemUnlocked } from '../utils/coins';
import { SHOP_ITEMS } from '../utils/shopItems';
import { spawnSparkles } from './Kisekae';
import './Shop.css';

const CAT_LABELS = {
  crown:     '👑 かんむり',
  dress:     '👗 いろ',
  accessory: '📿 アクセ',
  item:      '🪄 こもの',
  pet:       '🐾 ペット',
};

export default function Shop({ isOpen, onClose, lang, onCoinsChange }) {
  const [activeChara, setActiveChara] = useState('princess');
  const [coins,       setCoins]       = useState(getCoins);

  if (!isOpen) return null;

  const items = SHOP_ITEMS.filter(s => s.chara === activeChara);

  function handleBuy(item, e) {
    if (isItemUnlocked(item.id)) return;
    if (!spendCoins(item.price)) return;
    unlockItem(item.id);
    const newCoins = getCoins();
    setCoins(newCoins);
    onCoinsChange(newCoins);
    spawnSparkles(e.clientX, e.clientY);
  }

  return (
    <div
      className="shop-overlay"
      onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onClose(); }}
      onTouchEnd={(ev)  => { if (ev.target === ev.currentTarget) onClose(); }}
    >
      <div className="shop-panel">

        {/* ヘッダー */}
        <div className="shop-hd">
          <span className="shop-title">🛍️ ショップ</span>
          <button className="shop-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* コイン残高 */}
        <div className="shop-balance">
          <span className="shop-balance-icon">🪙</span>
          <span className="shop-balance-num">{coins}</span>
          <span className="shop-balance-label">
            {lang === 'en' ? 'coins' : 'まい'}
          </span>
        </div>

        {/* キャラタブ */}
        <div className="shop-chara-tabs">
          {['princess', 'prince'].map(ch => (
            <button
              key={ch}
              className={`shop-chara-tab${activeChara === ch ? ' active' : ''}`}
              onClick={() => setActiveChara(ch)}
            >
              <span className="shop-tab-icon">{ch === 'princess' ? '👸' : '🤴'}</span>
              {lang === 'en'
                ? (ch === 'princess' ? 'Princess' : 'Prince')
                : (ch === 'princess' ? 'プリンセス' : 'プリンス')}
            </button>
          ))}
        </div>

        {/* アイテムグリッド */}
        <div className="shop-grid">
          {items.map(item => {
            const owned  = isItemUnlocked(item.id);
            const canBuy = !owned && coins >= item.price;
            const broke  = !owned && coins < item.price;

            return (
              <div
                key={item.id}
                className={`shop-item${owned ? ' shop-item--owned' : ''}${broke ? ' shop-item--broke' : ''}`}
              >
                <div className="shop-item-emoji">{item.shopEmoji}</div>
                <div className="shop-item-name">{item.shopName}</div>
                <div className="shop-item-cat">{CAT_LABELS[item.cat] ?? item.cat}</div>

                {owned ? (
                  <div className="shop-item-owned">✓ {lang === 'en' ? 'Owned' : 'もってる'}</div>
                ) : canBuy ? (
                  <button
                    className="shop-item-price"
                    onClick={(e) => handleBuy(item, e)}
                  >
                    🪙 {item.price}
                  </button>
                ) : (
                  <div className="shop-item-broke">
                    🪙 {item.price}
                    {' '}
                    <span style={{ fontSize: 9 }}>
                      {lang === 'en' ? 'need more' : 'コインがたりない'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
