import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productCreateSchema } from "../../schemas/product";
import { handleError } from "@/utils/http";
import { authMiddleware } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = {};

    if (category && category !== "all") {
      where.categorias = {
        some: {
          categoria: {
            is: {
              OR: [
                { slug: category },
                {
                  nome: {
                    equals: category,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
      };
    }

    const produtos = await prisma.produto.findMany({
      where,
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(produtos, { status: 200 });
  } catch (error) {
    return handleError(error, "listar produtos");
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }


  try {
    const body = await req.json();
    const parsed = productCreateSchema.parse(body);
    const { nome, descricao, preco, cover, categoriaIds } = parsed;

    const exists = await prisma.produto.findFirst({
      where: { nome: { equals: nome, mode: "insensitive" } },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Produto já existe com esse nome",
        },
        { status: 409 }
      );
    }

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

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "criar produto");
  }
}
