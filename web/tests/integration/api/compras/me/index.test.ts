import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type Mock,
} from "vitest";

import type { NextRequest } from "next/server";
import { GET } from "@/app/(backend)/api/compras/me/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    compra: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");
const { auth } = await import("@/auth");

type MockedCompra = {
  findMany: Mock;
};

type MockedAuth = {
  api: {
    getSession: Mock;
  };
};

const mockedCompra = prisma.compra as unknown as MockedCompra;
const mockedAuth = auth as unknown as MockedAuth;

describe("/api/compras – GET lista de compras", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 401 se não estiver autenticado", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/compras");
    const nextReq = req as unknown as NextRequest;

    const res = await GET(nextReq);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Não autenticado");
    expect(mockedCompra.findMany).not.toHaveBeenCalled();
  });

  it("deve retornar lista de compras do usuário autenticado", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    const fakeCompras = [
      {
        id: "123",
        userId: "user-1",
        createdAt: "2023-01-01",
        itens: [],
      },
      {
        id: "456",
        userId: "user-1",
        createdAt: "2023-01-02",
        itens: [],
      },
    ];

    mockedCompra.findMany.mockResolvedValueOnce(fakeCompras);

    const req = new Request("http://localhost/api/compras");
    const nextReq = req as unknown as NextRequest;

    const res = await GET(nextReq);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBe(2);
    expect(json[0].id).toBe("123");
    expect(json[1].id).toBe("456");

    expect(mockedCompra.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
      include: { itens: { include: { produto: true } } },
    });
  });
});
