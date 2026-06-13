import { useNavigate } from 'react-router-dom';

export default function SoraGame() {
  const navigate = useNavigate();
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:0, overflow:'hidden' }}>
      <iframe
        src="/games/shooting_v1.html"
        style={{ width:'100%', height:'100%', border:'none', display:'block', position:'absolute', top:0, left:0 }}
        title="そらとびプリンセス"
        allow="autoplay; fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
      <button
        onClick={() => navigate('/')}
        style={{
          position:'absolute', top:10, left:10, zIndex:10,
          background:'rgba(0,0,0,0.55)', color:'white',
          border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:20,
          padding:'5px 14px', fontSize:12, fontWeight:700, cursor:'pointer'
        }}
      >
        🏠 もどる
      </button>
    </div>
  );
}
