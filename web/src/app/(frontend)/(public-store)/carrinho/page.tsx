import { auth } from "@/auth";
import { headers } from "next/headers";
import LandingPagesNav from "@/components/base/nav/InitialNav";
import CartPage from "./_components/CartPage";

export default async function CarrinhoPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const isLogged = !!session?.user;
  const userEmail = session?.user?.email ?? null;

  return (
    <div className="min-h-screen">
      <LandingPagesNav isLogged={isLogged} />
      <CartPage isLogged={isLogged} userEmail={userEmail} />
    </div>
  );
}
