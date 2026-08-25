import { cn } from "@/lib/utils";

/** QR Code fictício (padrão determinístico) — apenas visual, não escaneável. */
export function QRCodeMock({ seed = "foguetao", size = 176, className }: { seed?: string; size?: number; className?: string }) {
  const modules = 21;
  const cell = size / modules;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffff;

  const isFinder = (x: number, y: number) => {
    const inBox = (bx: number, by: number) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
    return inBox(0, 0) || inBox(modules - 7, 0) || inBox(0, modules - 7);
  };
  const finderFilled = (x: number, y: number) => {
    const rel = (bx: number, by: number) => {
      const lx = x - bx;
      const ly = y - by;
      if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true;
      if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true;
      return false;
    };
    if (x < 7 && y < 7) return rel(0, 0);
    if (x >= modules - 7 && y < 7) return rel(modules - 7, 0);
    if (x < 7 && y >= modules - 7) return rel(0, modules - 7);
    return false;
  };

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (isFinder(x, y)) {
        if (finderFilled(x, y)) cells.push({ x, y });
      } else if ((x * 7 + y * 13 + hash) % 3 === 0) {
        cells.push({ x, y });
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("rounded-lg bg-white", className)}
      role="img"
      aria-label="QR Code de conexão (mock)"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {cells.map((c, i) => (
        <rect key={i} x={c.x * cell} y={c.y * cell} width={cell} height={cell} fill="#17171A" />
      ))}
    </svg>
  );
}
