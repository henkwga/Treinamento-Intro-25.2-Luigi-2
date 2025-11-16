// components/base/nav/InitialNav/index.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import NavbarLogo from "@/components/base/nav/NavbarLogo";
import { ShoppingCart } from "lucide-react";

type InitialNavProps = {
  isLogged: boolean;
  userName?: string | null;
};

export default function InitialNav({ isLogged, userName }: InitialNavProps) {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset;
      setHidden(y > last.current && y > 80);
      last.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const firstName =
    typeof userName === "string" && userName.length > 0
      ? userName.split(" ")[0]
      : null;

  return (
    <nav
      className={[
        "fixed inset-x-0 top-0 z-40 border-b border-[#232323]",
        "bg-[rgba(14,15,17,0.7)] backdrop-blur-sm",
        "transition-all duration-300",
        hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
      ].join(" ")}
    >
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <NavbarLogo />

        {/* Link Catálogo – agora com cara de botão */}
        <div className="hidden sm:flex">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/0 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[#e5e5e5] transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffd100]" />
            Catálogo
          </Link>
        </div>

        {/* Ações à direita */}
        <div className="flex items-center gap-2 text-sm text-white">
          {/* Ícone de carrinho – sempre visível */}
          <Link
            href="/carrinho"
            aria-label="Carrinho"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#232323] bg-white/5 transition-colors hover:border-white/40 hover:bg-white/10"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>

          {isLogged ? (
            <>
              {firstName && (
                <span className="hidden text-xs text-[#e0e0e0] sm:inline">
                  Olá, <span className="font-semibold">{firstName}</span>
                </span>
              )}

              <Link
                href="/conta/pedidos"
                className="hidden rounded-full border border-white/15 bg-white/0 px-3 py-1.5 text-xs font-medium text-[#f5f5f5] transition-colors hover:border-white/40 hover:bg-white/10 sm:inline-flex"
              >
                Meus pedidos
              </Link>

              <Link
                href="/logout"
                className="rounded-full bg-[#ffd100] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black transition-transform hover:-translate-y-0.5"
              >
                Sair
              </Link>
            </>
          ) : (
            <>
              {/* Registrar */}
              <Link
                href="/cadastro"
                className="hidden rounded-full border border-[#ffd100] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#ffd100] transition-colors hover:bg-[#ffd100]/10 sm:inline-flex"
              >
                Registrar
              </Link>

              {/* Entrar */}
              <Link
                href="/login"
                className="rounded-full bg-[#ffd100] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black transition-transform hover:-translate-y-0.5"
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
