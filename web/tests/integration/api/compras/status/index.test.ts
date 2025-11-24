import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type Mock,
} from "vitest";

import type { NextRequest } from "next/server";
import { GET } from "@/app/(backend)/api/compras/status/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    compra: {
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");

type MockedCompra = {
  findMany: Mock;
};

const mockedCompra = prisma.compra as unknown as MockedCompra;

describe("GET /api/compras/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 400 se userId não for enviado", async () => {
    const req = new Request("http://localhost/api/compras/status");
    const nextReq = req as unknown as NextRequest;

    const res = await GET(nextReq);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("userId obrigatório");
  });

  it("deve retornar qtdCompras = 0 e totalGasto = 0 quando não há compras", async () => {
    mockedCompra.findMany.mockResolvedValueOnce([]);

    const req = new Request(
      "http://localhost/api/compras/status?userId=user-1"
    );
    const nextReq = req as unknown as NextRequest;

    const res = await GET(nextReq);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.qtdCompras).toBe(0);
    expect(json.totalGasto).toBe(0);
  });

  it("deve retornar qtdCompras e totalGasto corretamente", async () => {
    mockedCompra.findMany.mockResolvedValueOnce([
      { id: "1", precoTotal: 50 },
      { id: "2", precoTotal: 20.5 },
      { id: "3", precoTotal: 29.5 },
    ]);

    const req = new Request(
      "http://localhost/api/compras/status?userId=user-1"
    );
    const nextReq = req as unknown as NextRequest;

    const res = await GET(nextReq);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.qtdCompras).toBe(3);
    expect(json.totalGasto).toBe(100); 
  });

  it("deve chamar prisma.compra.findMany com o filtro correto", async () => {
    mockedCompra.findMany.mockResolvedValueOnce([]);

    const req = new Request(
      "http://localhost/api/compras/status?userId=user-XYZ"
    );
    const nextReq = req as unknown as NextRequest;

    await GET(nextReq);

    expect(mockedCompra.findMany).toHaveBeenCalledWith({
      where: { userId: "user-XYZ" },
    });
  });
});
