import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });

  const compras = await prisma.compra.findMany({ where: { userId } });
  const total = compras.reduce((acc, c) => acc + Number(c.precoTotal), 0);

  return NextResponse.json({ qtdCompras: compras.length, totalGasto: total });
}
