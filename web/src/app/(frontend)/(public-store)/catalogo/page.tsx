// src/app/(frontend)/(public-store)/catalogo/page.tsx
import { headers } from "next/headers";
import { auth } from "@/auth";
import CatalogPage from "./_components/CatalogPage";
import LandingPagesNav from "@/components/base/nav/InitialNav";

export default async function CatalogoPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user ?? null;
  const isLogged = !!user;
  const userEmail = user?.email ?? null;

  return (
    <>
      <LandingPagesNav isLogged={isLogged} />
      <CatalogPage isLogged={isLogged} userEmail={userEmail} />
    </>
  );
}
