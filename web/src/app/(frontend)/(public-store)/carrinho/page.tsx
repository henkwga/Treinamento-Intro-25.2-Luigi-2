import { headers } from "next/headers";
import { auth } from "@/auth";
import InitialNav from "@/components/base/nav/InitialNav";
import CartPage from "./_components/CartPage";

export default async function CarrinhoPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLogged = !!session?.user;
  const userName = session?.user?.name ?? null;

  return (
    <div className="min-h-screen bg-[#0e0f11]">
      <InitialNav isLogged={isLogged} userName={userName} />
      <CartPage isLogged={isLogged} />
    </div>
  );
}
