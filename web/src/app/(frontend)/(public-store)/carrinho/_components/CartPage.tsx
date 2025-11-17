"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeCoverPath } from "@/utils/image";
import {readCart, writeCart, getCartKey, type CartLine} from "@/utils/cart";

type ProdutoFromAPI = {
  id: string;
  nome: string;
  preco: number;
  cover: string;
};

type CartItem = {
  id: string;
  title: string;
  price: number;
  cover: string;
  qty: number;
  lineTotal: number;
};

type CartPageProps = {
  isLogged: boolean;
  userEmail?: string | null;
};

const toBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

export default function CartPage({ isLogged, userEmail }: CartPageProps) {
  // se estiver logado e tiver email, usa o carrinho da conta; senão, guest
  const ownerId: string | null = isLogged && userEmail ? userEmail : null;

  const [lines, setLines] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<Record<string, ProdutoFromAPI>>({});
  const [loading, setLoading] = useState(false);

  // carregar carrinho certo quando trocar de "dono" (guest ↔ usuário)
  useEffect(() => {
    const current = readCart(ownerId);
    setLines(current);

    const storageKey = getCartKey(ownerId);

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setLines(readCart(ownerId));
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [ownerId]);

  // buscar produtos do backend sempre que linhas mudarem
  useEffect(() => {
    const ids = lines.map((l) => l.id);
    if (!ids.length) {
      setProducts({});
      return;
    }

    setLoading(true);
    fetch(`/api/products?ids=${encodeURIComponent(ids.join(","))}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((arr: ProdutoFromAPI[]) => {
        const map: Record<string, ProdutoFromAPI> = {};
        for (const p of arr) map[p.id] = p;
        setProducts(map);
      })
      .finally(() => setLoading(false));
  }, [lines]);

  const items: CartItem[] = useMemo(() => {
    return (
      lines
        .map((l) => {
          const p = products[l.id];
          if (!p) return null;
          const price = Number(p.preco ?? 0);
          return {
            id: p.id,
            title: p.nome,
            price,
            cover: normalizeCoverPath(p.cover),
            qty: l.qty,
            lineTotal: price * l.qty,
          };
        })
        .filter(Boolean) as CartItem[]
    );
  }, [lines, products]);

  const total = items.reduce((acc, it) => acc + it.lineTotal, 0);

  function setQty(id: string, qty: number) {
    if (qty < 1) return;
    const next = lines.map((l) => (l.id === id ? { ...l, qty } : l));
    setLines(next);
    writeCart(next, ownerId);
  }

  function inc(id: string) {
    setQty(id, (lines.find((l) => l.id === id)?.qty || 0) + 1);
  }

  function dec(id: string) {
    setQty(
      id,
      Math.max(1, (lines.find((l) => l.id === id)?.qty || 1) - 1),
    );
  }

  function removeLine(id: string) {
    const next = lines.filter((l) => l.id !== id);
    setLines(next);
    writeCart(next, ownerId);
  }

  function clearCart() {
    setLines([]);
    writeCart([], ownerId);
  }

  async function checkout() {
    if (!items.length) return;

    if (!isLogged) {
      alert("Faça login para finalizar a compra.");
      return;
    }

    const payload = {
      itens: lines.map((l) => ({ produtoId: l.id, quantidade: l.qty })),
    };

    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Erro ao finalizar: ${err?.error ?? res.statusText}`);
      return;
    }

    const compra = await res.json();
    alert(`Pedido criado! #${compra.id} — Total ${toBRL(compra.precoTotal)}`);
    clearCart();
  }

  return (
    <main className="min-h-screen bg-[#0e0f11] pt-20 text-white">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <h1 className="mb-6 text-3xl font-extrabold tracking-wide text-[#ffd100]">
          Seu carrinho
        </h1>

        {!items.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/80">Seu carrinho está vazio.</p>
            <a
              href="/catalogo"
              className="mt-4 inline-block rounded-full bg-[#ffd100] px-5 py-2 text-sm font-semibold text-black"
            >
              Explorar catálogo
            </a>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-4 rounded-xl border border-white/10 bg-[#181818]/60 p-3"
                >
                  <img
                    src={it.cover}
                    alt={it.title}
                    className="h-24 w-24 flex-none rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {it.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => dec(it.id)}
                        className="h-8 w-8 rounded-full border border-white/10 bg-white/10 text-sm"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) =>
                          setQty(it.id, Number(e.target.value))
                        }
                        className="w-14 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center text-sm outline-none"
                      />
                      <button
                        onClick={() => inc(it.id)}
                        className="h-8 w-8 rounded-full border border-white/10 bg-white/10 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="rounded-full bg-[#ffd100] px-3 py-1 text-xs font-bold text-black">
                      {toBRL(it.price)}
                    </span>
                    <button
                      onClick={() => removeLine(it.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-max rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-lg font-semibold">Resumo</h2>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span>Itens</span>
                <span>{items.length}</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm">
                <span>Total</span>
                <span className="font-bold">{toBRL(total)}</span>
              </div>

              <button
                onClick={checkout}
                disabled={!items.length}
                className="mt-2 w-full rounded-full bg-[#ffd100] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                Finalizar compra
              </button>

              <button
                onClick={clearCart}
                className="mt-3 w-full rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm"
              >
                Esvaziar carrinho
              </button>

              {!isLogged && (
                <p className="mt-3 text-center text-xs text-white/70">
                  Faça login pela barra superior para concluir o pedido.
                </p>
              )}
            </aside>
          </div>
        )}

        {loading && (
          <p className="mt-4 text-center text-white/60">
            Atualizando preços…
          </p>
        )}
      </div>
    </main>
  );
}
