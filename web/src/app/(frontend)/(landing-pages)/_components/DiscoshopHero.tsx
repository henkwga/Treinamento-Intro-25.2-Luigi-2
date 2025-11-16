import Link from "next/link";
import DiscoshopBackground from "./DiscoshopBackground";

export default function DiscoshopHero() {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] w-full items-center justify-center overflow-hidden overscroll-y-none pt-20">
      <DiscoshopBackground />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
        <h1 className="m-0 text-[clamp(64px,15vw,160px)] font-extrabold leading-none tracking-[0.02em] text-[#a94f14] drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]">
          DISCOSHOP
        </h1>

        <p className="mt-3 text-sm tracking-[0.02em] text-[#a7a7a7]">
          Clássicos, raridades e novos sons girando sem parar.
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            href="/catalogo"
            className="rounded-full bg-[#ffd100] px-4 py-2 text-sm font-semibold text-black shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
          >
            Explorar catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
