// app/(frontend)/(public-store)/catalogo/page.tsx
import { headers } from "next/headers";
import { auth } from "@/auth";
import InitialNav from "@/components/base/nav/InitialNav";
import CatalogPage from "./_components/CatalogPage";

export default async function CatalogoPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLogged = !!session?.user;
  const userName = session?.user?.name ?? null;

  return (
    <div className="min-h-screen bg-[#0e0f11]">
      <InitialNav isLogged={isLogged} userName={userName} />
      <CatalogPage />
    </div>
  );
}
