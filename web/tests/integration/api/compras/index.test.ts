import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type Mock,
} from "vitest";

import { NextResponse, type NextRequest } from "next/server";
import { POST } from "@/app/(backend)/api/compras/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    produto: {
      findMany: vi.fn(),
    },
    compra: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/middleware/auth", () => ({
  authMiddleware: vi.fn(),
}));

vi.mock("@/utils/http", () => ({
  handleError: vi.fn((error) => {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      { status: 500 }
    );
  }),
}));

const { prisma } = await import("@/lib/prisma");
const { authMiddleware } = await import("@/middleware/auth");
const { handleError } = await import("@/utils/http");

type MockedProduto = {
  findMany: Mock;
};

type MockedCompra = {
  create: Mock;
};

type MockedAuth = Mock;

const mockedProduto = prisma.produto as unknown as MockedProduto;
const mockedCompra = prisma.compra as unknown as MockedCompra;
const mockedAuth = authMiddleware as unknown as MockedAuth;

describe("POST /api/compras – Criar compra", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 401 se o usuário não estiver autenticado", async () => {
    mockedAuth.mockResolvedValueOnce(
      NextResponse.json(
        { success: false, message: "Usuário não autenticado" },
        { status: 401 }
      )
    );

    const req = new Request("http://localhost/api/compras", {
      method: "POST",
      body: JSON.stringify({ itens: [] }),
    });

    const nextReq = req as unknown as NextRequest;

    const res = await POST(nextReq);
    expect(res.status).toBe(401);
  });


  it("deve retornar 400 para body inválido", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: "user-1" } });

    const req = new Request("http://localhost/api/compras", {
      method: "POST",
      body: "NOT JSON",
    });

    const nextReq = req as unknown as NextRequest;

    const res = await POST(nextReq);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toBe("Carrinho vazio");
  });

  it("deve retornar 400 se itens estiver vazio", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: "user-1" } });

    const req = new Request("http://localhost/api/compras", {
      method: "POST",
      body: JSON.stringify({ itens: [] }),
    });

    const res = await POST(req as unknown as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toBe("Carrinho vazio");
  });

  it("deve retornar erro se algum produto não existir", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: "user-1" } });

    mockedProduto.findMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/compras", {
      method: "POST",
      body: JSON.stringify({
        itens: [{ produtoId: "A", quantidade: 2 }],
      }),
    });

    const res = await POST(req as unknown as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Produto inválido");
  });

  it("deve normalizar quantidade < 1 para 1", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: "user-1" } });

    mockedProduto.findMany.mockResolvedValueOnce([
      { id: "A", preco: 10 },
    ]);

    mockedCompra.create.mockResolvedValueOnce({
      id: "compra-1",
      precoTotal: 10,
      itens: [],
    });

    const req = new Request("http://localhost/api/compras", {
      method: "POST",
      body: JSON.stringify({
        itens: [{ produtoId: "A", quantidade: 0 }],
      }),
    });

    const res = await POST(req as unknown as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(mockedCompra.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: "user-1",
          status: "pending",
          precoTotal: 10,
          itens: {
            create: [
              { produtoId: "A", quantidade: 1, precoUnit: 10 },
            ],
          },
        },
      })
    );
  });

  it("deve criar a compra com sucesso", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: "user-1" } });

    mockedProduto.findMany.mockResolvedValueOnce([
      { id: "A", preco: 30 },
      { id: "B", preco: 20 },
    ]);

    mockedCompra.create.mockResolvedValueOnce({
      id: "compra-1",
      precoTotal: 70,
      status: "pending",
      itens: [],
    });

    const req = new Request("http://localhost/api/compras", {
      method: "POST",
      body: JSON.stringify({
        itens: [
          { produtoId: "A", quantidade: 1 },
          { produtoId: "B", quantidade: 2 },
        ],
      }),
    });

    const res = await POST(req as unknown as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.id).toBe("compra-1");
    expect(json.precoTotal).toBe(70);

    expect(mockedCompra.create).toHaveBeenCalled();
  });
});
