import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type Mock,
} from "vitest";

import type { NextRequest } from "next/server";
import { PATCH } from "@/app/(backend)/api/compras/[id]/status/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    compra: {
      findFirst: vi.fn(),
      update: vi.fn(),
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

vi.mock("@/utils/email", () => ({
  sendEmail: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");
const { auth } = await import("@/auth");
const { sendEmail } = await import("@/utils/email");

type MockedCompra = {
  findFirst: Mock;
  update: Mock;
};

type MockedAuth = {
  api: {
    getSession: Mock;
  };
};

const mockedCompra = prisma.compra as unknown as MockedCompra;
const mockedAuth = auth as unknown as MockedAuth;
const mockedSendEmail = sendEmail as unknown as Mock;

describe("/api/compras/[id] – Atualização de status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 401 se não estiver autenticado", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/compras/1", {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }),
    });

    const req = request as unknown as NextRequest;

    const res = await PATCH(req, { params: { id: "1" } });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Usuário não autenticado");
  });

  it("deve retornar 400 para body JSON inválido", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    const request = new Request("http://localhost/api/compras/1", {
      method: "PATCH",
      body: "NOT JSON",
    });

    const req = request as unknown as NextRequest;

    const res = await PATCH(req, { params: { id: "1" } });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toBe("Body JSON inválido");
  });

  it("deve retornar 400 se o status não for enviado", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    const request = new Request("http://localhost/api/compras/1", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const req = request as unknown as NextRequest;

    const res = await PATCH(req, { params: { id: "1" } });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toBe("Status obrigatório");
  });

  it("deve retornar 400 para status inválido", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    const request = new Request("http://localhost/api/compras/1", {
      method: "PATCH",
      body: JSON.stringify({ status: "INVALIDO" }),
    });

    const req = request as unknown as NextRequest;

    const res = await PATCH(req, { params: { id: "1" } });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toBe("Status inválido");
  });

  it("deve retornar 404 se o pedido não existir para esse usuário", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    mockedCompra.findFirst.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/compras/1", {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }),
    });

    const req = request as unknown as NextRequest;

    const res = await PATCH(req, { params: { id: "1" } });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.message).toBe("Pedido não encontrado");
  });

  it("deve bloquear transição inválida de status", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    mockedCompra.findFirst.mockResolvedValueOnce({
      id: "1",
      userId: "user-1",
      status: "delivered",
    });

    const request = new Request("http://localhost/api/compras/1", {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }), 
    });

    const req = request as unknown as NextRequest;

    const res = await PATCH(req, { params: { id: "1" } });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toBe("Transição de status inválida");
  });

  it("deve atualizar o status quando válido (sem envio de e-mail)", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1", email: null },
    });

    mockedCompra.findFirst.mockResolvedValueOnce({
      id: "1",
      status: "pending",
      userId: "user-1",
    });

    const updated = {
      id: "1",
      status: "paid",
      itens: [],
    };

    mockedCompra.update.mockResolvedValueOnce(updated as never);

    const request = new Request("http://localhost/api/compras/1", {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }),
    });

    const req = request as unknown as NextRequest;

    const res = await PATCH(req, { params: { id: "1" } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe("paid");
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it("deve enviar e-mail quando status muda e usuário tem e-mail", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: {
        id: "user-1",
        email: "teste@example.com",
        name: "Cliente",
      },
    });

    mockedCompra.findFirst.mockResolvedValueOnce({
      id: "ABC",
      status: "pending",
      userId: "user-1",
    });

    const updated = {
      id: "ABC",
      status: "paid",
      itens: [],
    };

    mockedCompra.update.mockResolvedValueOnce(updated as never);

    const request = new Request("http://localhost/api/compras/ABC", {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" }),
    });

    const req = request as unknown as NextRequest;

    const res = await PATCH(req, { params: { id: "ABC" } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    expect(mockedSendEmail).toHaveBeenCalledTimes(1);
    expect(mockedSendEmail).toHaveBeenCalledWith(
      "teste@example.com",
      "Pagamento confirmado",
      expect.stringContaining("ABC")
    );
  });
});
