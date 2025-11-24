import { describe, it, expect, vi, beforeEach, type Mock} from "vitest";
import type { NextRequest } from "next/server";
import { GET, POST } from "@/backend/api/products/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    produto: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/middleware/auth", () => ({
  authMiddleware: vi.fn().mockResolvedValue(true),
}));

const { prisma } = await import("@/lib/prisma");

type MockedProdutoModel = {
  findMany: Mock;
  create: Mock;
  findFirst: Mock;
};

const mockedProduto = prisma.produto as unknown as MockedProdutoModel;

describe("/api/products – Testes de integração", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET → deve listar produtos", async () => {
    mockedProduto.findMany.mockResolvedValue([
      {
        id: "1",
        nome: "Produto Teste",
        preco: 50,
        descricao: "Desc",
        cover: "/x.jpg",
        categorias: [],
      },
    ]);

    const req = new Request("http://localhost/api/products");
    const nextReq = req as unknown as NextRequest;

    const res = await GET(nextReq);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].nome).toBe("Produto Teste");
  });

  it("POST → deve criar produto válido", async () => {
    mockedProduto.findFirst.mockResolvedValue(null as never);

    mockedProduto.create.mockResolvedValue({
      id: "1",
      nome: "Criado",
      preco: 100,
    } as never);

    const req = new Request("http://localhost/api/products", {
      method: "POST",
      body: JSON.stringify({
        nome: "Novo Produto",
        preco: 100,
        cover: "/img.jpg",
        categoriaIds: [],
      }),
    });

    const nextReq = req as unknown as NextRequest;

    const res = await POST(nextReq);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.nome).toBe("Criado");
  });
});
