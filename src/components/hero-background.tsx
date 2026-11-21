// Decorative page background: dotted paper with a notebook margin line,
// fading out towards the bottom.
export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="paper-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="absolute inset-y-0 left-6 w-px bg-tomato/25 sm:left-12 md:left-20" />
    </div>
  );
}
