import type { CSSProperties } from "react";

// Decorative home-page scene (no interaction).
// Day: dotted paper, notebook margin, floating sheets, pastel sun & palms.
// Night: purple sky, stars, neon striped sun, palm silhouettes, glowing horizon.
// Colours come from CSS variables (--sun-*, --palm, --horizon) in globals.css;
// animations are disabled automatically for users who prefer reduced motion.

const STARS = [
  [6, 12, 2.6],
  [14, 30, 3.4],
  [22, 8, 2.2],
  [31, 22, 3.8],
  [39, 5, 2.9],
  [47, 18, 3.1],
  [56, 9, 2.4],
  [63, 27, 3.6],
  [71, 6, 2.8],
  [79, 20, 3.3],
  [87, 11, 2.5],
  [94, 25, 3.9],
  [10, 42, 3.2],
  [35, 38, 2.7],
  [66, 44, 3.5],
  [90, 40, 2.3],
] as const;

const SHEETS = [
  { className: "left-[8%] top-[18%] w-20 lg:w-24", r: "-8deg", d: "10s" },
  { className: "right-[9%] top-[12%] w-16 lg:w-20", r: "7deg", d: "12s" },
  { className: "right-[16%] top-[48%] w-14 lg:w-16", r: "-4deg", d: "9s" },
];

function Palm({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 160 260"
      className={className}
      style={{ transformOrigin: "50% 100%", ...style }}
      aria-hidden="true"
    >
      <g fill="var(--palm)">
        <path
          d="M78 260 C 80 210, 70 160, 86 92"
          fill="none"
          stroke="var(--palm)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path d="M86 92 C 60 78, 28 84, 6 110 C 34 92, 60 90, 86 96 Z" />
        <path d="M86 92 C 64 64, 34 56, 14 62 C 40 66, 64 78, 86 96 Z" />
        <path d="M86 92 C 84 62, 96 36, 118 22 C 102 44, 94 66, 90 96 Z" />
        <path d="M86 92 C 112 66, 140 64, 158 74 C 134 76, 110 84, 88 98 Z" />
        <path d="M86 92 C 116 88, 140 100, 154 126 C 132 108, 110 100, 86 98 Z" />
        <path d="M86 94 C 70 104, 56 124, 52 146 C 62 126, 74 110, 88 98 Z" />
        <circle cx="83" cy="101" r="4.5" />
        <circle cx="91" cy="102" r="4.5" />
      </g>
    </svg>
  );
}

function Sun() {
  // Only the top half shows above the horizon, so the stripes sit there;
  // gaps get taller towards the horizon, like a retro striped sun.
  const stripes = [
    [26, 1.2],
    [32, 1.8],
    [38, 2.6],
    [44, 3.4],
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sun-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--sun-1)" }} />
          <stop offset="55%" style={{ stopColor: "var(--sun-2)" }} />
          <stop offset="100%" style={{ stopColor: "var(--sun-3)" }} />
        </linearGradient>
        <mask id="sun-stripes">
          <rect width="100" height="100" fill="white" />
          {stripes.map(([y, h]) => (
            <rect key={y} x="0" y={y} width="100" height={h} fill="black" />
          ))}
        </mask>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="50"
        fill="url(#sun-fill)"
        mask="url(#sun-stripes)"
      />
    </svg>
  );
}

export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* ---------- Day: paper ---------- */}
      <div className="paper-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_90%)] dark:hidden" />
      <div className="absolute inset-y-0 left-6 w-px bg-tomato/25 sm:left-12 md:left-20 dark:hidden" />
      {SHEETS.map((s) => (
        <div
          key={s.className}
          className={`sheet anim-sheet absolute hidden aspect-[3/4] rounded-md border border-border bg-card shadow-md md:block dark:hidden ${s.className}`}
          style={{ "--r": s.r, "--d": s.d } as CSSProperties}
        >
          <div className="absolute inset-x-2 top-3 bottom-3 bg-[repeating-linear-gradient(to_bottom,var(--border)_0_1px,transparent_1px_8px)]" />
          <div className="absolute left-2 top-3 h-1.5 w-1/2 rounded-full bg-highlight/70" />
        </div>
      ))}

      {/* ---------- Night: neon sky ---------- */}
      <div className="absolute inset-0 hidden bg-[linear-gradient(to_bottom,#0e0a1c_0%,#1d1040_45%,#4a1650_78%,#7a1f5c_100%)] dark:block" />
      <div className="absolute inset-0 hidden dark:block">
        {STARS.map(([x, y, d]) => (
          <span
            key={`${x}-${y}`}
            className="anim-twinkle absolute h-0.5 w-0.5 rounded-full bg-white sm:h-1 sm:w-1"
            style={
              { left: `${x}%`, top: `${y}%`, "--d": `${d}s` } as CSSProperties
            }
          />
        ))}
      </div>

      {/* ---------- Both: sun, palms, horizon ---------- */}
      <div className="sun anim-sun absolute bottom-0 left-1/2 aspect-square w-[min(78vw,30rem)] translate-y-1/2 dark:drop-shadow-[0_0_40px_rgb(255_79_163/0.45)]">
        <Sun />
      </div>

      <Palm
        className="anim-palm absolute -left-4 bottom-0 h-40 opacity-80 sm:h-56 md:left-4 md:h-72 dark:opacity-100"
        style={{ "--d": "7s" } as CSSProperties}
      />
      <Palm
        className="anim-palm absolute -right-6 bottom-0 h-32 -scale-x-100 opacity-70 sm:h-44 md:right-6 md:h-60 dark:opacity-100"
        style={{ "--d": "8.5s" } as CSSProperties}
      />

      <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--horizon)]" />
      <div className="anim-horizon absolute inset-x-0 bottom-0 hidden h-8 bg-[linear-gradient(to_top,rgb(255_79_163/0.35),transparent)] dark:block" />
    </div>
  );
}
