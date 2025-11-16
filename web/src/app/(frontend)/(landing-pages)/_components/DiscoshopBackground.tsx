export default function DiscoshopBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_#ffb347_0%,_#ffcc33_60%,_#ffa622_100%)]" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('/clean-gray-paper.png')] mix-blend-overlay opacity-60" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[conic-gradient(from_0deg,rgba(255,255,255,0.05),rgba(0,0,0,0.05),rgba(255,255,255,0.05))] animate-spin motion-safe:duration-[25s] [animation-timing-function:linear] opacity-40 mix-blend-overlay transform-gpu will-change-transform scale-125 origin-center" />
    </>
  );
}
