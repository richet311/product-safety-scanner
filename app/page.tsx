// ── Icons ─────────────────────────────────────────────────────────────────────

type IconProps = { className?: string; style?: React.CSSProperties };

function ShieldCheckIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function CameraIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
  );
}

function SparklesIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function DocumentTextIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function BeakerIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 0 1 .45 1.314 2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25 2.25 2.25 0 0 1 .45-1.314M19.8 15H4.2" />
    </svg>
  );
}

function GlobeAltIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function ArrowRightIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CheckIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ScanIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
    </svg>
  );
}

// ── Fruit SVG Gradient Defs (shared across page) ─────────────────────────────

function FruitGradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <radialGradient id="fg-apple" cx="35%" cy="28%" r="60%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="60%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#8B0000" />
        </radialGradient>
        <radialGradient id="fg-leaf" cx="30%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#81C784" />
          <stop offset="100%" stopColor="#1B5E20" />
        </radialGradient>
        <radialGradient id="fg-carrot" cx="30%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#FFD740" />
          <stop offset="50%" stopColor="#FF6D00" />
          <stop offset="100%" stopColor="#BF360C" />
        </radialGradient>
        <radialGradient id="fg-broc-main" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#A5D6A7" />
          <stop offset="100%" stopColor="#1B5E20" />
        </radialGradient>
        <radialGradient id="fg-broc-side" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#C8E6C9" />
          <stop offset="100%" stopColor="#2E7D32" />
        </radialGradient>
        <radialGradient id="fg-straw" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="60%" stopColor="#D32F2F" />
          <stop offset="100%" stopColor="#7F0000" />
        </radialGradient>
        <radialGradient id="fg-lemon" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="40%" stopColor="#FFEE58" />
          <stop offset="100%" stopColor="#F57F17" />
        </radialGradient>
        <radialGradient id="fg-avoc-outer" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#8BC34A" />
          <stop offset="60%" stopColor="#33691E" />
          <stop offset="100%" stopColor="#1A3509" />
        </radialGradient>
        <radialGradient id="fg-avoc-inner" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#F9FBE7" />
          <stop offset="100%" stopColor="#DCEDC8" />
        </radialGradient>
        <radialGradient id="fg-avoc-seed" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#A1887F" />
          <stop offset="100%" stopColor="#4E342E" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ── 3D Fruit SVG Components ───────────────────────────────────────────────────

function AppleFruit({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M35 12 Q46 3 42 16 Q38 10 35 12Z" fill="url(#fg-leaf)" />
      <path d="M32 6 Q34 4 34 8 L34 14 Q33 15 31 14 L31 8 Q31 4 32 6Z" fill="#6D4C41" />
      <path d="M13 30 Q11 20 20 17 Q26 14 32 15 Q38 14 44 17 Q53 20 51 30 L48 51 Q44 64 32 64 Q20 64 16 51 Z" fill="url(#fg-apple)" />
      <ellipse cx="23" cy="28" rx="7" ry="9" fill="white" fillOpacity="0.25" transform="rotate(-20 23 28)" />
      <circle cx="21" cy="23" r="3" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

function CarrotFruit({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M32 22 Q20 8 24 2 Q30 14 32 22" fill="url(#fg-leaf)" />
      <path d="M32 22 Q44 6 40 0 Q34 14 32 22" fill="#43A047" />
      <path d="M32 22 Q16 14 18 6 Q27 16 32 22" fill="#2E7D32" />
      <path d="M24 24 Q28 20 32 22 Q36 20 40 24 L35 60 Q32 64 29 60 Z" fill="url(#fg-carrot)" />
      <ellipse cx="28" cy="37" rx="3" ry="10" fill="white" fillOpacity="0.22" transform="rotate(-5 28 37)" />
      <ellipse cx="32" cy="36" rx="5" ry="1.5" fill="#BF360C" fillOpacity="0.25" />
      <ellipse cx="32" cy="46" rx="3.5" ry="1.2" fill="#BF360C" fillOpacity="0.25" />
      <ellipse cx="32" cy="55" rx="2" ry="1" fill="#BF360C" fillOpacity="0.25" />
    </svg>
  );
}

function BroccoliFruit({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="27" y="46" width="10" height="18" rx="4" fill="#558B2F" />
      <circle cx="32" cy="36" r="18" fill="url(#fg-broc-main)" />
      <circle cx="18" cy="42" r="12" fill="url(#fg-broc-side)" />
      <circle cx="46" cy="42" r="12" fill="url(#fg-broc-side)" />
      <circle cx="32" cy="22" r="13" fill="url(#fg-broc-side)" />
      <circle cx="24" cy="26" r="7" fill="#81C784" />
      <circle cx="40" cy="26" r="7" fill="#81C784" />
      <circle cx="32" cy="18" r="8" fill="#A5D6A7" />
      <circle cx="20" cy="36" r="6" fill="#81C784" />
      <circle cx="44" cy="36" r="6" fill="#81C784" />
      <circle cx="26" cy="22" r="3" fill="white" fillOpacity="0.3" />
      <circle cx="40" cy="16" r="2.5" fill="white" fillOpacity="0.25" />
    </svg>
  );
}

function StrawberryFruit({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M32 22 Q20 12 22 4 Q29 16 32 22" fill="url(#fg-leaf)" />
      <path d="M32 22 Q44 12 42 4 Q35 16 32 22" fill="#43A047" />
      <path d="M32 22 Q14 20 12 10 Q24 18 32 22" fill="#2E7D32" />
      <path d="M32 22 Q50 20 52 10 Q40 18 32 22" fill="#388E3C" />
      <path d="M16 28 Q14 20 22 18 Q32 16 42 18 Q50 20 48 28 L44 50 Q38 64 32 62 Q26 64 20 50 Z" fill="url(#fg-straw)" />
      <ellipse cx="26" cy="34" rx="1.5" ry="2" fill="#FFD54F" fillOpacity="0.9" />
      <ellipse cx="34" cy="28" rx="1.5" ry="2" fill="#FFD54F" fillOpacity="0.9" />
      <ellipse cx="40" cy="36" rx="1.5" ry="2" fill="#FFD54F" fillOpacity="0.9" />
      <ellipse cx="28" cy="46" rx="1.5" ry="2" fill="#FFD54F" fillOpacity="0.9" />
      <ellipse cx="38" cy="50" rx="1.5" ry="2" fill="#FFD54F" fillOpacity="0.9" />
      <ellipse cx="24" cy="50" rx="1.5" ry="2" fill="#FFD54F" fillOpacity="0.9" />
      <ellipse cx="36" cy="42" rx="1.5" ry="2" fill="#FFD54F" fillOpacity="0.9" />
      <ellipse cx="23" cy="30" rx="5" ry="7" fill="white" fillOpacity="0.22" transform="rotate(-15 23 30)" />
      <circle cx="21" cy="26" r="2.5" fill="white" fillOpacity="0.35" />
    </svg>
  );
}

function LemonFruit({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M6 32 Q8 16 32 12 Q56 16 58 32 Q56 48 32 52 Q8 48 6 32Z" fill="url(#fg-lemon)" />
      <path d="M6 32 Q3 27 2 32 Q3 37 6 32" fill="#F9A825" />
      <path d="M58 32 Q61 27 62 32 Q61 37 58 32" fill="#F9A825" />
      <ellipse cx="24" cy="24" rx="10" ry="7" fill="white" fillOpacity="0.3" transform="rotate(-15 24 24)" />
      <circle cx="22" cy="22" r="4" fill="white" fillOpacity="0.35" />
      <circle cx="44" cy="38" r="1.5" fill="#F9A825" fillOpacity="0.4" />
      <circle cx="48" cy="28" r="1" fill="#F9A825" fillOpacity="0.35" />
      <circle cx="38" cy="43" r="1.5" fill="#F9A825" fillOpacity="0.4" />
    </svg>
  );
}

function AvocadoFruit({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="6" r="4" fill="#33691E" />
      <path d="M32 8 Q46 10 50 26 L50 44 Q48 62 32 64 Q16 62 14 44 L14 26 Q18 10 32 8Z" fill="url(#fg-avoc-outer)" />
      <path d="M32 20 Q44 22 46 34 L46 44 Q44 58 32 60 Q20 58 18 44 L18 34 Q20 22 32 20Z" fill="url(#fg-avoc-inner)" />
      <ellipse cx="32" cy="44" rx="11" ry="12" fill="url(#fg-avoc-seed)" />
      <circle cx="28" cy="40" r="3.5" fill="white" fillOpacity="0.2" />
      <ellipse cx="22" cy="24" rx="5" ry="8" fill="white" fillOpacity="0.2" transform="rotate(-10 22 24)" />
      <circle cx="20" cy="21" r="2.5" fill="white" fillOpacity="0.25" />
    </svg>
  );
}

// ── Grade System ──────────────────────────────────────────────────────────────

type Grade = "A" | "B" | "C" | "D";

const gradeConfig: Record<
  Grade,
  { color: string; bg: string; textColor: string; label: string; pct: number; desc: string }
> = {
  A: { color: "#00C37A", bg: "#E6FAF3", textColor: "#00956A", label: "Excellent", pct: 1,    desc: "No concerning ingredients" },
  B: { color: "#8BC34A", bg: "#F1F8E9", textColor: "#558B2F", label: "Good",      pct: 0.75, desc: "Minor concerns, generally safe" },
  C: { color: "#FF9800", bg: "#FFF3E0", textColor: "#C95C00", label: "Mediocre",  pct: 0.5,  desc: "Several ingredients to watch" },
  D: { color: "#F44336", bg: "#FFEBEE", textColor: "#B71C1C", label: "Poor",      pct: 0.25, desc: "High-risk ingredients detected" },
};

// ── 3D Avocado ────────────────────────────────────────────────────────────────

function Avocado3D({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 260 300" className={className} style={style} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="av3-skin" gradientUnits="userSpaceOnUse" cx="90" cy="108" r="175">
          <stop offset="0%"   stopColor="#9CCC65" />
          <stop offset="22%"  stopColor="#558B2F" />
          <stop offset="55%"  stopColor="#33691E" />
          <stop offset="100%" stopColor="#1B3A0A" />
        </radialGradient>
        <radialGradient id="av3-flesh" gradientUnits="userSpaceOnUse" cx="130" cy="150" r="108">
          <stop offset="0%"   stopColor="#F9FBE7" />
          <stop offset="38%"  stopColor="#DCEDC8" />
          <stop offset="72%"  stopColor="#C5E1A5" />
          <stop offset="100%" stopColor="#8AAD40" />
        </radialGradient>
        <radialGradient id="av3-pit" gradientUnits="userSpaceOnUse" cx="115" cy="148" r="55">
          <stop offset="0%"   stopColor="#BCAAA4" />
          <stop offset="28%"  stopColor="#8D6E63" />
          <stop offset="68%"  stopColor="#5D4037" />
          <stop offset="100%" stopColor="#3E2723" />
        </radialGradient>
        <radialGradient id="av3-pit-hi" gradientUnits="userSpaceOnUse" cx="113" cy="142" r="20">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="av3-clip">
          <path d="M130 28 C163 28,215 78,218 138 C221 198,200 256,178 276 C162 292,130 294,130 294 C98 294,68 284,72 276 C50 256,39 198,42 138 C45 78,97 28,130 28Z" />
        </clipPath>
      </defs>
      {/* Outer skin */}
      <path d="M130 28 C163 28,215 78,218 138 C221 198,200 256,178 276 C162 292,130 294,130 294 C98 294,68 284,72 276 C50 256,39 198,42 138 C45 78,97 28,130 28Z" fill="url(#av3-skin)" />
      {/* Right-side shadow */}
      <ellipse cx="198" cy="186" rx="52" ry="108" fill="#000" fillOpacity="0.28" clipPath="url(#av3-clip)" />
      {/* Skin gloss upper-left */}
      <ellipse cx="90" cy="108" rx="38" ry="52" fill="#fff" fillOpacity="0.1" transform="rotate(-12 90 108)" clipPath="url(#av3-clip)" />
      <circle cx="82" cy="84" r="22" fill="#fff" fillOpacity="0.08" clipPath="url(#av3-clip)" />
      {/* Skin texture bumps */}
      <circle cx="168" cy="70"  r="5.5" fill="#1B3A0A" fillOpacity="0.5" />
      <circle cx="192" cy="110" r="4.5" fill="#1B3A0A" fillOpacity="0.45" />
      <circle cx="188" cy="158" r="6"   fill="#1B3A0A" fillOpacity="0.4" />
      <circle cx="94"  cy="90"  r="3.5" fill="#4A7A1A" fillOpacity="0.35" />
      <circle cx="72"  cy="145" r="4.5" fill="#1B3A0A" fillOpacity="0.4" />
      <circle cx="158" cy="244" r="5"   fill="#1B3A0A" fillOpacity="0.4" />
      <circle cx="105" cy="258" r="3.5" fill="#1B3A0A" fillOpacity="0.35" />
      {/* Inner flesh */}
      <path d="M130 52 C158 58,196 98,202 142 C208 186,192 244,172 262 C157 276,130 280,130 280 C103 280,76 268,68 262 C48 244,52 186,58 142 C64 98,102 58,130 52Z" fill="url(#av3-flesh)" />
      {/* Flesh right-side shadow */}
      <ellipse cx="185" cy="180" rx="40" ry="88" fill="#7B8B2A" fillOpacity="0.2" />
      {/* Pit */}
      <ellipse cx="130" cy="178" rx="52" ry="58" fill="url(#av3-pit)" />
      {/* Pit specular gloss */}
      <ellipse cx="114" cy="158" rx="18" ry="24" fill="url(#av3-pit-hi)" transform="rotate(-10 114 158)" />
      <circle cx="108" cy="153" r="8"  fill="#fff" fillOpacity="0.28" />
      <circle cx="104" cy="149" r="4"  fill="#fff" fillOpacity="0.48" />
    </svg>
  );
}

// ── Ingredient Badge ──────────────────────────────────────────────────────────

function IngredientBadge({ grade, name }: { grade: Grade; name: string }) {
  const cfg = gradeConfig[grade];
  return (
    <div
      className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full pl-2 pr-3 py-1.5 shadow-lg border border-gray-100/80"
      style={{ fontSize: 11 }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        {grade}
      </span>
      <span className="font-semibold text-gray-700 whitespace-nowrap">{name}</span>
    </div>
  );
}

// ── CircleGrade Component ─────────────────────────────────────────────────────

function CircleGrade({
  grade,
  size = 80,
  animated = false,
}: {
  grade: Grade;
  size?: number;
  animated?: boolean;
}) {
  const cfg = gradeConfig[grade];
  const sw = Math.max(4, size * 0.07);
  const r = (size / 2) - sw / 2 - 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * cfg.pct;
  const gap    = circ - filled;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative inline-flex items-center justify-center shrink-0"
      aria-label={`Grade ${grade}: ${cfg.label}`}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#E5E7EB" strokeWidth={sw}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={cfg.color}
          strokeWidth={sw}
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
          className={animated ? "grade-circle-fill" : undefined}
          style={animated ? ({ "--full-circ": `${circ}px` } as React.CSSProperties) : undefined}
        />
      </svg>
      <span
        className="absolute font-black leading-none tracking-tight"
        style={{ color: cfg.color, fontSize: size * 0.36 }}
      >
        {grade}
      </span>
    </div>
  );
}

// ── GradeBadge Component ──────────────────────────────────────────────────────

function GradeBadge({ grade, small = false }: { grade: Grade; small?: boolean }) {
  const cfg = gradeConfig[grade];
  return (
    <span
      className={`inline-flex items-center justify-center font-black rounded-full leading-none ${
        small ? "w-6 h-6 text-[11px]" : "w-8 h-8 text-sm"
      }`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
      aria-label={`Grade ${grade}`}
    >
      {grade}
    </span>
  );
}

// ── Floating 3D Avocado Showcase ──────────────────────────────────────────────

function FloatingAvocado3D() {
  const badges: Array<{ grade: Grade; name: string }> = [
    { grade: "A", name: "Healthy Fats" },
    { grade: "A", name: "Vitamin K" },
    { grade: "A", name: "Folate" },
    { grade: "B", name: "Calories" },
  ];

  return (
    // Outer wrapper rocks the entire card in 3D perspective
    <div className="card-rock-3d" style={{ width: 340 }}>
      <div
        className="relative select-none overflow-hidden rounded-3xl border border-green-100"
        style={{
          background: "linear-gradient(150deg, #F0FFF4 0%, #E8F5E9 50%, #F9FAFB 100%)",
          boxShadow: "0 24px 64px rgba(0,195,122,0.15), 0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#00C37A" }}>
              SafeScan Analysis
            </p>
            <p className="text-xl font-black text-gray-900 mt-0.5">Hass Avocado</p>
          </div>
          <CircleGrade grade="A" size={54} />
        </div>

        {/* 3D Stage */}
        <div className="relative flex items-center justify-center" style={{ height: 310 }}>
          {/* Ambient radial glow */}
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 60%, rgba(139,195,74,0.18) 0%, transparent 65%)" }}
            aria-hidden="true"
          />

          {/* Perspective context — two orbit rings tilt in 3D and counter-spin */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: "280px" }}
            aria-hidden="true"
          >
            <div
              className="orbit-ring-outer absolute rounded-full"
              style={{ width: 240, height: 240, border: "1.5px dashed rgba(0,195,122,0.45)" }}
            />
            <div
              className="orbit-ring-inner absolute rounded-full"
              style={{ width: 172, height: 172, border: "1px solid rgba(139,195,74,0.28)" }}
            />
          </div>

          {/* Avocado: outer=float (translateY+rotate), inner=spin (scaleX 1→0→1) */}
          <div className="food3d-float relative z-10">
            <div className="food3d-spin">
              <Avocado3D
                style={{
                  width: 220,
                  height: 254,
                  filter: "drop-shadow(0 28px 48px rgba(0,0,0,0.22)) drop-shadow(0 6px 16px rgba(0,0,0,0.09))",
                }}
              />
            </div>
          </div>

          {/* Scan beam — sweeps top-to-bottom every few seconds */}
          <div
            className="scan-sweep absolute left-8 right-8 z-20 pointer-events-none"
            style={{
              height: 2,
              background: "linear-gradient(90deg, transparent 0%, rgba(0,195,122,0.85) 50%, transparent 100%)",
              borderRadius: 2,
              boxShadow: "0 0 10px 2px rgba(0,195,122,0.35)",
            }}
            aria-hidden="true"
          />

          {/* Ground shadow — shrinks as avocado rises */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2" aria-hidden="true">
            <div
              className="food3d-shadow"
              style={{
                width: 130,
                height: 14,
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%)",
              }}
            />
          </div>
        </div>

        {/* Ingredient badges */}
        <div className="flex flex-wrap gap-2 px-6 pb-6">
          {badges.map(({ grade, name }) => (
            <IngredientBadge key={name} grade={grade} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Phone Mockup (hero visual) ────────────────────────────────────────────────

const heroIngredients: { name: string; grade: Grade }[] = [
  { name: "Aqua (Water)",          grade: "A" },
  { name: "Glycerin",              grade: "A" },
  { name: "Sodium Lauryl Sulfate", grade: "C" },
  { name: "Methylparaben",         grade: "D" },
  { name: "Synthetic Fragrance",   grade: "C" },
];

function AppMockup() {
  return (
    <div
      className="anim-fade-up anim-fade-up-3 anim-float relative mx-auto"
      style={{ width: 270, filter: "drop-shadow(0 32px 48px rgba(0,0,0,0.12))" }}
    >
      {/* Phone shell */}
      <div
        className="relative bg-gray-100 rounded-[36px] p-2"
        style={{ boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.08)" }}
      >
        <div className="bg-white rounded-[28px] overflow-hidden">
          {/* Notch */}
          <div className="flex justify-center pt-3 pb-1 bg-white">
            <div className="w-20 h-4 bg-gray-900 rounded-full" />
          </div>

          {/* App bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4" style={{ color: "#00C37A" } as React.CSSProperties} />
              <span className="text-xs font-extrabold text-gray-900">
                Safe<span style={{ color: "#00C37A" }}>Scan</span>
              </span>
            </div>
            <CameraIcon className="w-4 h-4 text-gray-400" />
          </div>

          {/* Product header */}
          <div className="px-4 pt-4 pb-3 flex flex-col items-center">
            <CircleGrade grade="C" size={88} animated />
            <p className="mt-2 text-xs font-bold text-gray-800 text-center">Moisturizing Day Cream</p>
            <p className="text-[10px] text-gray-500 mt-0.5">3 concerns found</p>
          </div>

          {/* Scan beam effect */}
          <div className="relative mx-4 mb-3 h-0.5 bg-gray-100 rounded overflow-hidden">
            <div
              className="scan-beam-line absolute inset-x-0 top-0 h-0.5 rounded"
              style={{ background: "linear-gradient(90deg, transparent, #00C37A, transparent)" }}
              aria-hidden="true"
            />
          </div>

          {/* Ingredients */}
          <div className="px-4 pb-5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              INGREDIENTS DETECTED
            </p>
            <div className="space-y-2">
              {heroIngredients.map((item, i) => (
                <div
                  key={item.name}
                  className={`flex items-center gap-2 anim-ingredient anim-ingredient-${i + 1}`}
                >
                  <GradeBadge grade={item.grade} small />
                  <span className="flex-1 text-[10px] text-gray-700 truncate font-medium">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom home bar */}
          <div className="flex justify-center pb-3 pt-1">
            <div className="w-24 h-1 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#00C37A" }}
            >
              <ShieldCheckIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">
              Safe<span style={{ color: "#00C37A" }}>Scan</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Grades",       href: "#grades" },
              { label: "Features",     href: "#features" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors duration-150 cursor-pointer"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors duration-150 cursor-pointer"
            >
              Sign In
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all duration-150 cursor-pointer hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#00C37A" }}
            >
              Try Free
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Soft green blob background */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full -translate-y-1/3 translate-x-1/3 opacity-40"
        style={{ background: "radial-gradient(circle, #E6FAF3 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full translate-y-1/2 -translate-x-1/3 opacity-30"
        style={{ background: "radial-gradient(circle, #E6FAF3 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <div>
            {/* Badge */}
            <div className="anim-fade-up anim-fade-up-1 inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: "#E6FAF3", color: "#00956A" }}>
              <SparklesIcon className="w-3.5 h-3.5" />
              AI-Powered Safety Analysis
            </div>

            <h1 className="anim-fade-up anim-fade-up-2 text-4xl sm:text-5xl lg:text-[56px] font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
              Know what&apos;s{" "}
              <span style={{ color: "#00C37A" }}>really</span>{" "}
              in your products.
            </h1>

            <p className="anim-fade-up anim-fade-up-3 text-lg text-gray-500 leading-relaxed mb-8 max-w-lg font-medium">
              Photograph any label. Our AI reads every ingredient, grades each one
              A–D, and gives you a full safety report in under 3 seconds.
            </p>

            <div className="anim-fade-up anim-fade-up-4 flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#00C37A", boxShadow: "0 8px 24px rgba(0,195,122,0.3)" }}
              >
                Scan a Product — It&apos;s Free
                <ArrowRightIcon className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-gray-700 border-2 border-gray-200 cursor-pointer transition-all duration-150 hover:border-gray-300 hover:text-gray-900 active:scale-95"
              >
                See How It Works
              </a>
            </div>

            {/* Trust signals */}
            <div className="anim-fade-up anim-fade-up-4 flex flex-wrap items-center gap-5 text-sm text-gray-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckIcon className="w-4 h-4" style={{ color: "#00C37A" } as React.CSSProperties} />
                No account needed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="w-4 h-4" style={{ color: "#00C37A" } as React.CSSProperties} />
                10,000+ scans this month
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="w-4 h-4" style={{ color: "#00C37A" } as React.CSSProperties} />
                Free forever plan
              </span>
            </div>
          </div>

          {/* App mockup */}
          <div className="flex justify-center lg:justify-end">
            <AppMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Social Proof Bar ──────────────────────────────────────────────────────────

function SocialProofBar() {
  return (
    <div className="bg-gray-50 border-y border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+",   label: "Products scanned" },
            { value: "99.2%",  label: "OCR accuracy" },
            { value: "< 3s",   label: "Per analysis" },
            { value: "50+",    label: "Risk categories" },
          ].map(({ value, label }) => (
            <div key={label}>
              <dt className="text-3xl font-black text-gray-900 tracking-tight">{value}</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-400">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: CameraIcon,
      title: "Photograph the label",
      description:
        "Point your camera at any product — food, cosmetics, supplements, household items. Works with curved, small-print, and 40+ language labels.",
      color: "#00C37A",
      colorBg: "#E6FAF3",
    },
    {
      number: "02",
      icon: ScanIcon,
      title: "AI reads every ingredient",
      description:
        "Our OCR engine extracts the full ingredient list with 99.2% accuracy, even in low light or on tiny text.",
      color: "#8BC34A",
      colorBg: "#F1F8E9",
    },
    {
      number: "03",
      icon: SparklesIcon,
      title: "Get your safety grades",
      description:
        "Every ingredient is graded A–D in under 3 seconds, with a plain-English explanation and overall product score.",
      color: "#00C37A",
      colorBg: "#E6FAF3",
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Steps column */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#00C37A" }}>
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-12">
              From photo to safety grade in seconds
            </h2>
            <div className="space-y-8">
              {steps.map(({ number, icon: Icon, title, description, color, colorBg }) => (
                <div key={number} className="flex gap-5">
                  <div className="shrink-0">
                    <div
                      className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: colorBg }}
                    >
                      <Icon className="h-7 w-7" style={{ color } as React.CSSProperties} />
                      <span
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center text-[9px] font-black"
                        style={{ borderColor: color, color }}
                        aria-hidden="true"
                      >
                        {number.replace("0", "")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-1.5">{title}</h3>
                    <p className="text-gray-500 leading-relaxed font-medium text-sm">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D food visual */}
          <div className="flex justify-center lg:justify-end items-center">
            <FloatingAvocado3D />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Grade System Section ──────────────────────────────────────────────────────

function GradesSection() {
  return (
    <section id="grades" className="py-24 sm:py-32" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: explanation */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#00C37A" }}>
              Our Rating System
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-6">
              Simple grades. Serious science.
            </h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
              Every product gets an overall grade from A to D based on its
              ingredient profile — cross-referenced against 50+ peer-reviewed
              risk databases.
            </p>
            <ul className="space-y-4">
              {(Object.entries(gradeConfig) as [Grade, typeof gradeConfig[Grade]][]).map(
                ([grade, cfg]) => (
                  <li key={grade} className="flex items-start gap-4">
                    <CircleGrade grade={grade} size={48} />
                    <div className="pt-1">
                      <span className="text-base font-black text-gray-900">{cfg.label}</span>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">{cfg.desc}</p>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Right: sample product cards */}
          <div className="space-y-4">
            {[
              {
                name: "Organic Aloe Vera Gel",
                brand: "PureLeaf",
                grade: "A" as Grade,
                ingredients: 8,
                concerns: 0,
              },
              {
                name: "Classic Shampoo Pro",
                brand: "SalonSeries",
                grade: "C" as Grade,
                ingredients: 24,
                concerns: 4,
              },
              {
                name: "Whitening Face Cream",
                brand: "BrightSkin",
                grade: "D" as Grade,
                ingredients: 31,
                concerns: 7,
              },
            ].map((product) => {
              const cfg = gradeConfig[product.grade];
              return (
                <div
                  key={product.name}
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                >
                  <CircleGrade grade={product.grade} size={56} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{product.brand}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                      <span className="text-gray-500">{product.ingredients} ingredients</span>
                      {product.concerns > 0 ? (
                        <span style={{ color: cfg.color }}>
                          {product.concerns} concern{product.concerns > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span style={{ color: "#00C37A" }}>No concerns</span>
                      )}
                    </div>
                  </div>
                  <div
                    className="shrink-0 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: cfg.bg, color: cfg.textColor }}
                  >
                    {cfg.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: ScanIcon,
      title: "Precision OCR",
      description:
        "Reads curved labels, small print, poor lighting, and 40+ languages with 99.2% accuracy.",
      colorBg: "#E6FAF3",
      color: "#00C37A",
    },
    {
      icon: SparklesIcon,
      title: "AI Risk Analysis",
      description:
        "Cross-references 50+ risk databases including allergen registries, carcinogen lists, and regulatory ban lists.",
      colorBg: "#FFF3E0",
      color: "#FF9800",
    },
    {
      icon: GlobeAltIcon,
      title: "40+ Languages",
      description:
        "Scan imported products in any of 40+ supported languages. Results returned in your preferred language.",
      colorBg: "#EDE9FE",
      color: "#7C3AED",
    },
    {
      icon: BeakerIcon,
      title: "Allergen Detection",
      description:
        "Instantly flags 14 major regulated allergens plus 200+ common sensitivities.",
      colorBg: "#FFEBEE",
      color: "#F44336",
    },
    {
      icon: DocumentTextIcon,
      title: "Full Report Export",
      description:
        "Download safety reports as PDF or share via link — ideal for healthcare professionals.",
      colorBg: "#E6FAF3",
      color: "#00C37A",
    },
    {
      icon: ShieldCheckIcon,
      title: "Confidence Scores",
      description:
        "Every flag includes a confidence percentage and plain-English explanation from peer-reviewed sources.",
      colorBg: "#F1F8E9",
      color: "#8BC34A",
    },
  ];

  return (
    <section id="features" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#00C37A" }}>
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Everything you need to stay safe
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, colorBg, color }) => (
            <div
              key={title}
              className="rounded-3xl p-7 border border-gray-100 hover:shadow-lg transition-shadow duration-200 cursor-default"
            >
              <div
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-5"
                style={{ backgroundColor: colorBg }}
              >
                <Icon className="h-6 w-6" style={{ color } as React.CSSProperties} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Who It's For ──────────────────────────────────────────────────────────────

function UseCasesSection() {
  const useCases = [
    {
      icon: BeakerIcon,
      color: "#00C37A",
      bg: "#E6FAF3",
      title: "Everyday Consumers",
      description:
        "Quickly check if a product is safe for you and your family before buying. No chemistry degree required.",
    },
    {
      icon: ShieldCheckIcon,
      color: "#8BC34A",
      bg: "#F1F8E9",
      title: "Healthcare Professionals",
      description:
        "Advise patients with confidence-scored, evidence-backed ingredient data from peer-reviewed sources.",
    },
    {
      icon: DocumentTextIcon,
      color: "#7C3AED",
      bg: "#EDE9FE",
      title: "Researchers & Regulators",
      description:
        "Audit large product catalogues for compliance violations and emerging risk patterns at scale.",
    },
  ];

  return (
    <section className="py-24 sm:py-32" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#00C37A" }}>
            Who It&apos;s For
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Built for everyone who cares about safety
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {useCases.map(({ icon: Icon, color, bg, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-200"
            >
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5"
                style={{ backgroundColor: bg }}
              >
                <Icon className="h-7 w-7" style={{ color } as React.CSSProperties} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Food Universe Section ─────────────────────────────────────────────────────

function FoodUniverseSection() {
  const categories = [
    { Fruit: AppleFruit,      label: "Food & Beverages",    count: "12K+" },
    { Fruit: StrawberryFruit, label: "Cosmetics & Skincare", count: "8K+"  },
    { Fruit: LemonFruit,      label: "Supplements",          count: "4K+"  },
    { Fruit: BroccoliFruit,   label: "Baby & Pet Products",  count: "2K+"  },
  ];

  return (
    <section className="bg-white py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#00C37A" }}>
            Scan Anything
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Every ingredient. Every product.
          </h2>
          <p className="mt-4 text-lg text-gray-500 font-medium max-w-xl mx-auto">
            Point your camera at any product — our AI instantly reads every ingredient
            and grades each one A–D in under 3 seconds.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map(({ Fruit, label, count }) => (
            <div
              key={label}
              className="flex flex-col items-center p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-200 text-center cursor-default"
            >
              <div
                className="mb-4"
                style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.10))" }}
              >
                <Fruit className="w-14 h-14" />
              </div>
              <p className="text-xl font-black text-gray-900">{count}</p>
              <p className="text-sm font-semibold text-gray-400 mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="py-24 sm:py-32" style={{ backgroundColor: "#00C37A" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6 leading-[1.1]">
          Start scanning in minutes.
        </h2>
        <p className="text-xl text-white/80 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
          No credit card. No setup. Upload your first product label and get a full
          safety grade report in under 3 seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-black cursor-pointer transition-all duration-150 hover:bg-gray-50 active:scale-95"
            style={{ color: "#00C37A" }}
          >
            Try SafeScan Free
            <ArrowRightIcon className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white cursor-pointer transition-all duration-150 hover:bg-white/10 active:scale-95"
          >
            View Documentation
          </a>
        </div>

        <p className="mt-8 text-sm text-white/60 font-semibold">
          Free tier · 10 scans/month · No account required for first scan
        </p>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

const footerLinks: Record<string, string[]> = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal:   ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#00C37A" }}
              >
                <ShieldCheckIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                Safe<span style={{ color: "#00C37A" }}>Scan</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs">
              AI-powered product safety analysis. Know every ingredient. Grade every risk.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors duration-150 cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-semibold">
            © {new Date().getFullYear()} SafeScan. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 font-semibold">
            Built with OCR + AI for product safety
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen">
      <FruitGradientDefs />
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofBar />
        <HowItWorksSection />
        <GradesSection />
        <FeaturesSection />
        <UseCasesSection />
        <FoodUniverseSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
