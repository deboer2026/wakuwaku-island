import { useNavigate } from 'react-router-dom';
import './HomeChip.css';

export default function HomeChip() {
  const navigate = useNavigate();
  return (
    <button className="home-chip" aria-label="ホームにもどる" onClick={() => navigate('/')}>
      <span aria-hidden="true">🏠</span>ホーム
    </button>
  );
}
