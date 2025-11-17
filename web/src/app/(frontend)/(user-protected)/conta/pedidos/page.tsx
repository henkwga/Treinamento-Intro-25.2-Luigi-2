// app/(frontend)/(user-protected)/conta/pedidos/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import InitialNav from "@/components/base/nav/InitialNav";
import OrdersPage from "./_components/OrdersPage";

export default async function PedidosPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLogged = !!session?.user;
  const userName = session?.user?.name ?? null;

  if (!isLogged) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0e0f11]">
      <InitialNav isLogged={isLogged} userName={userName} />
      <OrdersPage />
    </div>
  );
}
