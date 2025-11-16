import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } 
  catch { return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 }); }

  const { status } = (body as { status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled" });
  if (!status) return NextResponse.json({ error: "status obrigatório" }, { status: 400 });

  const found = await prisma.compra.findFirst({ where: { id, userId } });
  if (!found) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  if (found.status !== "pending" && status !== found.status) {
    return NextResponse.json({ error: "Transição de status inválida" }, { status: 400 });
  }

  const updated = await prisma.compra.update({
    where: { id },
    data: { status },
    include: { itens: { include: { produto: true } } },
  });

  return NextResponse.json(updated);
}
