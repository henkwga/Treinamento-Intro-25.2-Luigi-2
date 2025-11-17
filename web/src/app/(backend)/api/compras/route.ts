import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/utils/http";
import { authMiddleware } from "@/middleware/auth";

type Line = { produtoId: string; quantidade: number };

export async function POST(req: NextRequest) {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userId = authResult.user.id;

  try {
    const body = await req.json().catch(() => null);
    const itens = (body as { itens?: Line[] } | null)?.itens;

    if (!Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { success: false, message: "Carrinho vazio" },
        { status: 400 }
      );
    }

    const ids = itens.map((i) => i.produtoId);
    const produtos = await prisma.produto.findMany({
      where: { id: { in: ids } },
    });
    const byId = new Map(produtos.map((p) => [p.id, p]));

    const itensCreate = itens.map((l) => {
      const p = byId.get(l.produtoId);
      if (!p) {
        throw new Error(`Produto inválido: ${l.produtoId}`);
      }
      const quantidade = Math.max(1, Number(l.quantidade || 1));
      return {
        produtoId: p.id,
        quantidade,
        precoUnit: Number(p.preco),
      };
    });

    const total = itensCreate.reduce(
      (acc, it) => acc + it.precoUnit * it.quantidade,
      0
    );

    const compra = await prisma.compra.create({
      data: {
        userId,
        status: "pending",
        precoTotal: total,
        itens: { create: itensCreate },
      },
      include: { itens: { include: { produto: true } } },
    });

    return NextResponse.json(compra, { status: 201 });
  } catch (error) {
    return handleError(error, "criar compra");
  }
}
