// The default apartment picture: a flat illustration of a brownstone, used until the house adds a photo.
// Decorative, so it is hidden from screen readers. Its sky and street follow Light and Dark Mode.

const GLASS = "#2C3E57";
const LIT = "#FFE3A1";
const STONE = "#EFE4D4";

function Window({ x, y, w = 70, h = 90, lit = false }: { x: number; y: number; w?: number; h?: number; lit?: boolean }) {
  return (
    <g>
      <rect x={x - 8} y={y - 14} width={w + 16} height={10} fill={STONE} />
      <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} fill={STONE} />
      <rect x={x} y={y} width={w} height={h} fill={lit ? LIT : GLASS} />
      <path d={`M${x + w / 2} ${y}v${h}M${x} ${y + h * 0.42}h${w}`} stroke={STONE} strokeWidth={4} />
      <rect x={x - 8} y={y + h + 4} width={w + 16} height={8} fill={STONE} />
    </g>
  );
}

function Tree({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 7} y={300} width={14} height={105} fill="#6B4F3A" />
      <circle cx={x} cy={262} r={58} fill="#2BB673" />
      <circle cx={x - 40} cy={298} r={40} fill="#23A065" />
      <circle cx={x + 38} cy={292} r={44} fill="#34C27E" />
    </g>
  );
}

export function ApartmentArt({ className = "" }: { className?: string }) {
  const columns = [345, 475, 655, 785];
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      {/* Sky */}
      <rect width="1200" height="420" fill="var(--art-sky)" />
      <circle cx="1060" cy="88" r="46" fill="#FFD95A" />
      <ellipse cx="180" cy="80" rx="70" ry="18" fill="var(--art-cloud)" opacity="0.8" />
      <ellipse cx="960" cy="150" rx="55" ry="14" fill="var(--art-cloud)" opacity="0.7" />

      {/* Neighboring buildings */}
      <rect x="0" y="130" width="250" height="290" fill="var(--art-left)" />
      {[160, 240, 320].map((y) => [30, 110, 190].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="40" height="54" fill="var(--art-window)" />))}
      <rect x="950" y="170" width="250" height="250" fill="var(--art-right)" />
      {[200, 280].map((y) => [985, 1065, 1145].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="36" height="50" fill="var(--art-window)" />))}

      {/* The brownstone */}
      <rect x="300" y="64" width="600" height="340" fill="#9A5A43" />
      <rect x="284" y="46" width="632" height="26" fill="#5E3427" />
      {Array.from({ length: 31 }, (_, i) => (
        <rect key={i} x={290 + i * 20} y="72" width="10" height="9" fill="#7A4433" />
      ))}
      {columns.map((x, i) => (
        <Window key={`3-${x}`} x={x} y={110} lit={i === 0 || i === 3} />
      ))}
      {columns.map((x, i) => (
        <Window key={`2-${x}`} x={x} y={222} lit={i === 1} />
      ))}
      <Window x={345} y={330} h={56} lit />
      <Window x={785} y={330} h={56} />

      {/* Door and stoop */}
      <rect x="552" y="300" width="96" height="104" fill={STONE} />
      <path d="M564 404V340a36 36 0 0 1 72 0v64z" fill="#1E2A3A" />
      <path d="M570 338a30 30 0 0 1 60 0z" fill={LIT} />
      <rect x="626" y="370" width="4" height="10" fill="#FFD95A" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={540 - i * 12} y={384 + i * 6} width={120 + i * 24} height={6} fill="#B9A48F" />
      ))}

      <Tree x={250} />
      <Tree x={955} />

      {/* Sidewalk */}
      <rect x="0" y="404" width="1200" height="16" fill="var(--art-street)" />
    </svg>
  );
}
