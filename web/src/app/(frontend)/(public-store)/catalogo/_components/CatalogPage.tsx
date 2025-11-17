"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AlbumCard from "./AlbumCard";
import { normalizeCoverPath } from "@/utils/image";

type ProdutoFromAPI = {
  id: string;
  nome: string;
  descricao?: string | null;
  preco: number;
  cover: string;
  categorias?: Array<{
    categoria: { id: string; nome: string; slug: string };
  }>;
};

type Album = {
  id: string;
  title: string;
  artist?: string;
  price: number;
  cover: string;
  category: string;
  weight?: number;
  description?: string;
};

type CatalogPageProps = {
  isLogged: boolean;
  userEmail: string | null;
};

export default function CatalogPage({ isLogged, userEmail }: CatalogPageProps) {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ownerId = isLogged && userEmail ? userEmail : null;


  const [category, setCategory] = useState<string>(
    (search.get("cat") || "all").toLowerCase()
  );
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setCategory((search.get("cat") || "all").toLowerCase());
  }, [search]);

  useEffect(() => {
    const url =
      category === "all"
        ? "/api/products"
        : `/api/products?category=${encodeURIComponent(category)}`;

    setLoading(true);

    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: ProdutoFromAPI[]) => {
        const mapped: Album[] = (data ?? []).map((p) => ({
          id: p.id,
          title: p.nome,
          price: Number(p.preco ?? 0),
          cover: normalizeCoverPath(p.cover),
          category:
            p.categorias?.[0]?.categoria?.slug ??
            p.categorias?.[0]?.categoria?.nome?.toLowerCase() ??
            "other",
          description: p.descricao ?? "",
        }));

        setAlbums(mapped);
      })
      .finally(() => setLoading(false));
  }, [category]);

  const cats = useMemo(() => {
    const set = new Set<string>();
    for (const a of albums) set.add(a.category);
    return Array.from(set).sort();
  }, [albums]);

  const handleCat = (c: string) => {
    setCategory(c);
    const qs = c === "all" ? "" : `?cat=${c}`;
    router.replace(`${pathname}${qs}`);
  };

  return (
    <main className="min-h-screen bg-[#0e0f11] pt-16 py-12 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-[0.05em] text-[#ffd100]">
            Catálogo de Álbuns
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Explore clássicos, raridades e novos sons.
          </p>
        </header>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => handleCat("all")}
            className={`rounded-full border border-[#232323] px-4 py-1 text-sm ${category === "all"
              ? "bg-[#ffd100] text-black"
              : "bg-white/5 text-white hover:bg-white/10"
              }`}
          >
            Todos
          </button>

          {cats.map((slug) => (
            <button
              key={slug}
              onClick={() => handleCat(slug)}
              className={`rounded-full border border-[#232323] px-4 py-1 text-sm capitalize ${category === slug
                ? "bg-[#ffd100] text-black"
                : "bg-white/5 text-white hover:bg-white/10"
                }`}
            >
              {slug.replace(/-/g, " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Carregando...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                ownerId={ownerId}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
