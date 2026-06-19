// ── Icons ─────────────────────────────────────────────────────────────────────

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function DocumentTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 0 1 .45 1.314 2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25 2.25 2.25 0 0 1 .45-1.314M19.8 15H4.2" />
    </svg>
  );
}

function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function GlobeAltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
    </svg>
  );
}

// ── Shared status config ──────────────────────────────────────────────────────

type RiskStatus = "safe" | "warn" | "risk";

const statusConfig: Record<
  RiskStatus,
  { label: string; icon: ({ className }: { className?: string }) => React.JSX.Element; badgeClass: string; iconClass: string; barClass: string }
> = {
  safe: {
    label: "Safe",
    icon: CheckCircleIcon,
    badgeClass: "bg-green-100 text-green-700",
    iconClass: "text-green-600",
    barClass: "bg-green-500",
  },
  warn: {
    label: "Caution",
    icon: ExclamationTriangleIcon,
    badgeClass: "bg-amber-100 text-amber-700",
    iconClass: "text-amber-600",
    barClass: "bg-amber-500",
  },
  risk: {
    label: "Risk",
    icon: XCircleIcon,
    badgeClass: "bg-red-100 text-red-700",
    iconClass: "text-red-600",
    barClass: "bg-red-500",
  },
};

// ── Scan Mockup Card ──────────────────────────────────────────────────────────

const heroIngredients: { name: string; status: RiskStatus; confidence: number }[] = [
  { name: "Aqua (Water)",           status: "safe", confidence: 99 },
  { name: "Glycerin",               status: "safe", confidence: 96 },
  { name: "Sodium Lauryl Sulfate",  status: "warn", confidence: 91 },
  { name: "Methylparaben",          status: "risk", confidence: 88 },
  { name: "Synthetic Fragrance",    status: "warn", confidence: 85 },
];

function ScanMockup() {
  return (
    <div className="hero-card float-card relative w-full max-w-sm mx-auto">
      <div className="absolute -inset-4 rounded-3xl bg-green-500/10 blur-2xl" aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="status-dot inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-white tracking-wide">SafeScan Analysis</span>
          </div>
          <span className="text-xs text-slate-400">Live</span>
        </div>

        {/* Scan progress bar */}
        <div className="relative bg-slate-50 mx-4 mt-4 mb-3 rounded-xl h-12 overflow-hidden border border-slate-200 flex items-center px-3 gap-2">
          <CameraIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="confidence-bar h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: "72%" }} />
          </div>
          <span className="text-xs font-mono text-slate-500 shrink-0">OCR 99%</span>
          <div className="scan-line absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-lg shadow-green-400/50" />
        </div>

        {/* Ingredients */}
        <div className="px-4 pb-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Ingredients Detected — 5
          </p>

          {heroIngredients.map((item) => {
            const cfg = statusConfig[item.status];
            const Icon = cfg.icon;
            return (
              <div key={item.name} className="ingredient-row flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.iconClass}`} />
                <span className="flex-1 text-xs text-slate-700 truncate">{item.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${cfg.badgeClass}`}>
                  {cfg.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                  {item.confidence}%
                </span>
              </div>
            );
          })}

          {/* Safety score */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">Safety Score</span>
              <span className="text-sm font-bold text-amber-600">62 / 100</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="confidence-bar h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                style={{ width: "62%" }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">2 risks · 2 cautions · 1 safe</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f172a]">
              <ShieldCheckIcon className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-lg font-bold text-[#0f172a] tracking-tight">
              Safe<span className="text-green-600">Scan</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {[
              { label: "Features",     href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Use Cases",    href: "#use-cases" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-slate-600 hover:text-[#0f172a] transition-colors duration-150 cursor-pointer"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="hidden sm:block text-sm font-medium text-slate-600 hover:text-[#0f172a] transition-colors duration-150 cursor-pointer"
            >
              Sign In
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e293b] transition-colors duration-150 cursor-pointer"
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
    <section className="relative overflow-hidden bg-[#0f172a] pt-20 pb-28 sm:pt-28 sm:pb-36">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />
      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl"
        style={{ background: "rgba(34,197,94,0.08)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 mb-8">
              <SparklesIcon className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-400 tracking-wide uppercase">
                AI-Powered Product Safety
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Know Every{" "}
              <span className="text-green-400">Ingredient.</span>
              <br />
              Flag Every{" "}
              <span className="text-amber-400">Risk.</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
              Photograph any product label. Our OCR engine extracts all ingredients,
              then AI cross-references 50+ risk categories and returns confidence‑scored
              safety explanations in under 3 seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-green-500 transition-colors duration-150 cursor-pointer"
                style={{ boxShadow: "0 8px 32px rgba(22,163,74,0.3)" }}
              >
                Start Scanning Free
                <ArrowRightIcon className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-6 py-3.5 text-base font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-colors duration-150 cursor-pointer"
              >
                See How It Works
              </a>
            </div>

            <p className="mt-8 text-sm text-slate-500">
              No credit card required ·{" "}
              <span className="text-slate-400 font-medium">10,000+</span> products scanned this month
            </p>
          </div>

          {/* Animated card */}
          <div className="flex justify-center lg:justify-end">
            <ScanMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: "99.2%", label: "OCR Accuracy" },
  { value: "< 3s",  label: "Per Scan" },
  { value: "50+",   label: "Risk Categories" },
  { value: "10K+",  label: "Products Scanned" },
];

function StatsSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <dt className="text-3xl font-extrabold text-[#0f172a] tracking-tight">{value}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-500">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    icon: CameraIcon,
    title: "Photograph the Label",
    description:
      "Take a photo of any product label — food, cosmetic, supplement, or household item. Accepts any camera or uploaded image.",
  },
  {
    number: "02",
    icon: ScanIcon,
    title: "OCR Extracts Ingredients",
    description:
      "Advanced optical character recognition reads the ingredient list with 99.2% accuracy, even on curved, small-print, or multi-language labels.",
  },
  {
    number: "03",
    icon: SparklesIcon,
    title: "AI Flags Risks Instantly",
    description:
      "Our AI cross-references each ingredient against 50+ risk databases and returns a confidence-scored safety report with plain-language explanations.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            From photo to safety report in seconds
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Three steps. No expertise required. Full transparency on every ingredient.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 h-px bg-slate-200"
            style={{ left: "calc(16.66% + 1rem)", right: "calc(16.66% + 1rem)" }}
            aria-hidden="true"
          />

          {steps.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="relative text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0f172a] shadow-lg relative z-10">
                <Icon className="h-9 w-9 text-green-400" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                  {number}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">{title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features Bento Grid ───────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Everything you need to stay safe
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Large feature — OCR (spans 2 cols on lg) */}
          <div className="lg:col-span-2 rounded-3xl bg-[#0f172a] p-8 text-white flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/20 mb-5">
                <ScanIcon className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Precision OCR Extraction</h3>
              <p className="text-slate-400 leading-relaxed max-w-md">
                State-of-the-art optical character recognition handles curved labels, small print,
                poor lighting, and 40+ languages — extracting every ingredient with &gt;99% accuracy.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: "99%" }} />
              </div>
              <span className="text-sm font-semibold text-green-400 shrink-0">99.2% accuracy</span>
            </div>
          </div>

          {/* AI Risk Intelligence */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 flex flex-col">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 mb-5">
              <SparklesIcon className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">AI Risk Intelligence</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Cross-references every ingredient against 50+ curated risk databases including
              allergen registries, carcinogen lists, and regulatory ban lists.
            </p>
          </div>

          {/* Confidence Scores */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 flex flex-col">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 mb-5">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Confidence Scoring</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every risk flag comes with a percentage confidence score and plain-language
              explanation — so you always know how certain the AI is.
            </p>
          </div>

          {/* Allergen Detection */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 flex flex-col">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 mb-5">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Allergen Detection</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Instantly identify the 14 major regulated allergens plus 200+ common
              sensitivities, with per-person risk profiling support.
            </p>
          </div>

          {/* Multi-language */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 flex flex-col">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 mb-5">
              <GlobeAltIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">40+ Languages</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Scan imported products with labels in any of 40+ supported languages.
              Results always returned in your preferred language.
            </p>
          </div>

          {/* Report Export */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 flex flex-col">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 mb-5">
              <DocumentTextIcon className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Full Report Export</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Download detailed safety reports as PDF or share via link — ideal for
              healthcare professionals, researchers, and concerned consumers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Risk Report Preview ───────────────────────────────────────────────────────

const reportIngredients: { name: string; status: RiskStatus; confidence: number; detail: string }[] = [
  {
    name: "Sodium Lauryl Sulfate (SLS)",
    status: "risk",
    confidence: 92,
    detail: "Known skin irritant; linked to mucosal damage at >1% concentration.",
  },
  {
    name: "Methylparaben",
    status: "risk",
    confidence: 88,
    detail: "Suspected endocrine disruptor; banned in the EU for leave-on products.",
  },
  {
    name: "Synthetic Fragrance (Mix)",
    status: "warn",
    confidence: 79,
    detail: "Undisclosed blend; may contain phthalates or sensitising compounds.",
  },
  {
    name: "Glycerin",
    status: "safe",
    confidence: 99,
    detail: "Naturally derived humectant. Widely considered safe at all concentrations.",
  },
  {
    name: "Aqua (Water)",
    status: "safe",
    confidence: 99,
    detail: "Purified water. No risk.",
  },
];

function RiskReportSection() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-600 mb-4">
              Sample Report
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-6">
              Every flag has a reason — and a confidence score
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              SafeScan never just says &quot;risky&quot; without explaining why. Each ingredient
              flag includes the risk category, confidence percentage, and a plain-English
              explanation sourced from peer-reviewed databases.
            </p>

            <div className="space-y-4">
              {[
                { icon: XCircleIcon,             color: "text-red-600",   bg: "bg-red-50",   label: "Risk",    desc: "High-confidence danger flag with evidence." },
                { icon: ExclamationTriangleIcon, color: "text-amber-600", bg: "bg-amber-50", label: "Caution", desc: "Potential concern worth monitoring." },
                { icon: CheckCircleIcon,         color: "text-green-600", bg: "bg-green-50", label: "Safe",    desc: "Confirmed safe at standard concentrations." },
              ].map(({ icon: Icon, color, bg, label, desc }) => (
                <div key={label} className={`flex items-start gap-3 rounded-xl ${bg} p-4`}>
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
                  <div>
                    <span className={`text-sm font-semibold ${color}`}>{label}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — report card */}
          <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/60">
            <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-sm font-bold text-white">Safety Report</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Overall Score</p>
                <p className="text-lg font-extrabold text-amber-400 leading-tight">62 / 100</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {reportIngredients.map((item) => {
                const cfg = statusConfig[item.status];
                const Icon = cfg.icon;
                return (
                  <div key={item.name} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.iconClass}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-800 truncate">
                            {item.name}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 ${cfg.badgeClass}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug mb-2">{item.detail}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cfg.barClass}`}
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {item.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <XCircleIcon className="w-3.5 h-3.5 text-red-500" />
                  2 risks
                </span>
                <span className="flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
                  1 caution
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                  2 safe
                </span>
              </div>
              <a
                href="#"
                className="text-xs font-semibold text-green-600 hover:text-green-700 cursor-pointer transition-colors"
              >
                Export PDF →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Use Cases ─────────────────────────────────────────────────────────────────

const useCases = [
  {
    icon: BeakerIcon,
    title: "Consumers",
    description: "Quickly verify a product is safe for you and your family before buying — no chemistry degree required.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Healthcare Professionals",
    description: "Advise patients on ingredient safety with evidence-backed, confidence-scored data from peer-reviewed sources.",
  },
  {
    icon: DocumentTextIcon,
    title: "Researchers & Regulators",
    description: "Rapidly audit large product catalogues for compliance violations and emerging risk patterns at scale.",
  },
];

function UseCasesSection() {
  return (
    <section id="use-cases" className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">
            Who It&apos;s For
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Built for everyone who cares about safety
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {useCases.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f172a] mb-5">
                <Icon className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
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
    <section className="bg-[#0f172a] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 mb-8">
          <SparklesIcon className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-semibold text-green-400 tracking-wide uppercase">
            Free to Start
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
          Start scanning in minutes.
          <br />
          <span className="text-green-400">Know what&apos;s safe.</span>
        </h2>

        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
          No credit card. No setup. Upload your first product label and get a full
          AI safety report in under 3 seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-base font-semibold text-white hover:bg-green-500 transition-colors duration-150 cursor-pointer"
            style={{ boxShadow: "0 8px 32px rgba(22,163,74,0.3)" }}
          >
            Try SafeScan Free
            <ArrowRightIcon className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-8 py-4 text-base font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-colors duration-150 cursor-pointer"
          >
            View Documentation
          </a>
        </div>

        <p className="mt-8 text-sm text-slate-600">
          Free tier includes 10 scans/month · No account required for first scan
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
    <footer className="bg-[#0f172a] border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                <ShieldCheckIcon className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Safe<span className="text-green-400">Scan</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              AI-powered product safety analysis. Know every ingredient. Flag every risk.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-150 cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} SafeScan. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
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
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <RiskReportSection />
        <UseCasesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
