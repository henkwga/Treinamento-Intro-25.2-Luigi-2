"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { normalizeCoverPath } from "@/utils/image";

type Album = {
  id: string;
  title: string;
  artist?: string;
  price: number;
  cover: string;
  category: string;
};

export default function AlbumCard({ album }: { album: Album }) {
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const src = useMemo(() => normalizeCoverPath(album.cover), [album.cover]);

  function addToCart() {
    const LS_KEY = "cart";
    let cart: { id: string; qty: number }[] = [];
    try {
      cart = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {}
    const item = cart.find((i) => i.id === album.id);
    if (item) item.qty += 1;
    else cart.push({ id: album.id, qty: 1 });
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article className="group flex flex-col rounded-2xl bg-white/5 p-3 shadow-md ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <div className="relative overflow-hidden rounded-xl">
        <Image
          src={imgErr ? "/icons/under-construction.png" : src}
          alt={album.title}
          width={600}
          height={600}
          className="aspect-square w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
          onError={() => setImgErr(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full border border-black/40 bg-gradient-to-br from-black to-neutral-800 opacity-0 shadow-inner transition duration-700 group-hover:animate-spin-slow group-hover:opacity-80" />

        <span className="absolute bottom-2 right-2 rounded-full bg-[#ffd100] px-3 py-1 text-xs font-bold text-black shadow">
          R$ {album.price.toFixed(2)}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-1 text-sm font-semibold text-white">
        {album.title}
      </h3>
      {album.artist && (
        <p className="text-xs text-white/60">{album.artist}</p>
      )}

      <button
        onClick={addToCart}
        disabled={added}
        className={`mt-3 w-full rounded-full px-3 py-2 text-sm font-medium transition
          ${added
            ? "bg-green-500 text-white"
            : "bg-[#ffd100] text-black hover:bg-[#ffcc00]"}`}
      >
        {added ? "Adicionado!" : "Adicionar ao carrinho"}
      </button>
    </article>
  );
}
