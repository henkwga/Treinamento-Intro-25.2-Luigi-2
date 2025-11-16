"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Produto = { id: string; nome: string; cover: string; preco: number };
type Item = { id: string; quantidade: number; precoUnit: number; produto: Produto };
type Compra = {
  id: string;
  status: "PENDENTE" | "PAGO" | "ENVIADO" | "CANCELADO";
  precoTotal: number;
  createdAt: string;
  itens: Item[];
};

const toBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

function StatusBadge({ s }: { s: string }) {
  // normaliza para comparação
  const key = s.toLowerCase();

  const MAP: Record<string, { bg: string; fg: string; label: string }> = {
    // pending
    pending:   { bg: "#ffd100", fg: "#000000", label: "Pendente" },
    pendente:  { bg: "#ffd100", fg: "#000000", label: "Pendente" },

    // paid
    paid:      { bg: "#00c853", fg: "#ffffff", label: "Pago" },
    pago:      { bg: "#00c853", fg: "#ffffff", label: "Pago" },

    // shipped / enviado
    shipped:   { bg: "#2979ff", fg: "#ffffff", label: "Enviado" },
    enviado:   { bg: "#2979ff", fg: "#ffffff", label: "Enviado" },

    // canceled
    canceled:  { bg: "#d50000", fg: "#ffffff", label: "Cancelado" },
    cancelado: { bg: "#d50000", fg: "#ffffff", label: "Cancelado" },
  };

  const cfg =
    MAP[key] ?? { bg: "#555555", fg: "#ffffff", label: s || "Desconhecido" };

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.fg }}
    >
      {cfg.label}
    </span>
  );
}




function SkeletonOrder() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.06] p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-6 w-24 animate-pulse rounded bg-white/10" />
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
      <div className="mt-4 h-8 w-40 animate-pulse rounded bg-white/10" />
    </div>
  );
}

export default function OrdersPage() {
  const [data, setData] = useState<Compra[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/compras/me", {
      cache: "no-store",
      credentials: "include",
    });
    const j = await r.json();
    setData(Array.isArray(j) ? j : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function finalizar(id: string) {
    const r = await fetch(`/api/compras/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAGO" }),
      credentials: "include",
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      alert(e?.error ?? r.statusText);
      return;
    }
    await load();
  }

  const orders = useMemo(
    () =>
      (data ?? []).slice().sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      }),
    [data],
  );

  return (
    <main className="min-h-screen bg-[#0e0f11] pt-20 text-white">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-wide text-[#ffd100]">
            Meus pedidos
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Acompanhe status, valores e itens de cada compra.
          </p>
        </header>

        {loading ? (
          <div className="space-y-6">
            <SkeletonOrder />
            <SkeletonOrder />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-10 text-center">
            <p className="text-white/70">Você ainda não possui pedidos.</p>
            <a
              href="/catalogo"
              className="mt-4 inline-block rounded-full bg-[#ffd100] px-4 py-2 text-sm font-semibold text-black"
            >
              Explorar catálogo
            </a>
          </div>
        ) : (
          <ul className="space-y-8 md:space-y-10">
            {orders.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[.06] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm text-white/80">
                      Pedido{" "}
                      <span className="font-semibold">
                        #{c.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="text-xs text-white/50">
                      {new Date(c.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:self-start">
                    <StatusBadge s={c.status} />
                    <span className="rounded-full bg-[#ffd100] px-3 py-1 text-xs font-bold text-black">
                      {toBRL(c.precoTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                  {c.itens.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded">
                        <Image
                          src={
                            it.produto.cover ||
                            "/icons/under-construction.png"
                          }
                          alt={it.produto.nome}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {it.produto.nome}
                        </div>
                        <div className="text-xs text-white/60">
                          {it.quantidade} × {toBRL(it.precoUnit)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {toBRL(it.quantidade * it.precoUnit)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="text-xs text-white/50">
                    Total em {c.itens.length} item(ns)
                  </div>

                  <div className="flex items-center gap-2">
                    {c.status === "PENDENTE" && (
                      <button
                        onClick={() => finalizar(c.id)}
                        className="rounded-full bg-[#ffd100] px-4 py-2 text-sm font-semibold text-black hover:bg-[#ffcc00] focus:outline-none focus:ring-2 focus:ring-[#ffd100]/40"
                      >
                        Finalizar pagamento
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
