export function GlowBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl dark:bg-brand-500/15 animate-floaty" />
      <div className="absolute -bottom-56 right-[-140px] h-[560px] w-[560px] rounded-full bg-brand-900/18 blur-3xl dark:bg-brand-900/20 animate-floatySlow" />
      <div className="absolute top-24 left-[-160px] h-[460px] w-[460px] rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-400/10 animate-floaty" />
    </div>
  )
}
