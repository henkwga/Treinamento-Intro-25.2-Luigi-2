import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const compras = await prisma.compra.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { itens: { include: { produto: true } } },
  });

  return NextResponse.json(compras);
}
