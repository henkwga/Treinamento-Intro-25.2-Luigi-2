import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { productsQuerySchema } from "../../schemas/query";
import { productCreateSchema } from "../../schemas/product";
import { badRequest, toIssues } from "@/utils/http";

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries());

  const parsed = productsQuerySchema.safeParse({
    category: raw["category"],
    ids: raw["ids"],
  });
  if (!parsed.success) {
    return badRequest(toIssues(parsed.error));
  }
  const { category, ids } = parsed.data;

  let where: Prisma.ProdutoWhereInput = {};

  if (ids && ids.length) {
    where = { id: { in: ids } };
  } else if (category && category !== "all") {
    where = { categorias: { some: { categoria: { slug: category } } } };
  }

  const items = await prisma.produto.findMany({
    where,
    include: { categorias: { include: { categoria: true } } },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Body ausente ou JSON inválido" }, { status: 400 });

  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest(toIssues(parsed.error));

  const { nome, descricao, preco, cover, categoriaIds } = parsed.data;

  const exists = await prisma.produto.findFirst({
    where: { nome: { equals: nome, mode: "insensitive" } },
    select: { id: true },
  });
  if (exists) {
    return NextResponse.json(
      { message: "Produto já existe com esse nome" },
      { status: 409 }
    );
  }

  try {
    const created = await prisma.produto.create({
      data: {
        nome,
        descricao: descricao ?? null,
        preco,
        cover,
        categorias:
          Array.isArray(categoriaIds) && categoriaIds.length
            ? {
                create: categoriaIds.map((id: string) => ({
                  categoria: { connect: { id } },
                })),
              }
            : undefined,
      },
      include: { categorias: { include: { categoria: true } } },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json({ message: "Erro interno ao criar produto" }, { status: 500 });
  }
}



