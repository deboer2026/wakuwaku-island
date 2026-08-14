const SPARKLES = [0x2728, 0x1f4ab, 0x2b50, 0x1f31f, 0x1f495]
  .map((codePoint) => String.fromCodePoint(codePoint));

export function spawnSparkles(x, y) {
  SPARKLES.forEach((sparkle, index) => {
    const el = document.createElement('div');
    el.className = 'ksk-sparkle';
    el.textContent = sparkle;
    const angle = (index / SPARKLES.length) * Math.PI * 2;
    const distance = 38 + index * 14;
    el.style.cssText = [
      `left:${x}px`, `top:${y}px`,
      `--dx:${(Math.cos(angle) * distance).toFixed(1)}px`,
      `--dy:${(Math.sin(angle) * distance - 20).toFixed(1)}px`,
      `animation-delay:${(index * 0.07).toFixed(2)}s`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 900);
  });
}
