import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type Mock,
} from "vitest";

import { GET, PATCH } from "@/app/(backend)/api/account/me/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
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

const { prisma } = await import("@/lib/prisma");
const { auth } = await import("@/auth");

type MockedUserModel = {
  findUnique: Mock;
  update: Mock;
};

type MockedAuth = {
  api: {
    getSession: Mock;
  };
};

const mockedUser = prisma.user as unknown as MockedUserModel;
const mockedAuth = auth as unknown as MockedAuth;

describe("/api/account/me – Testes de integração", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------- GET ----------

  it("GET → deve retornar 401 se não estiver autenticado", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/account/me");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Não autenticado");
    expect(mockedUser.findUnique).not.toHaveBeenCalled();
  });

  it("GET → deve retornar dados do usuário autenticado", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    const fakeUser = {
      id: "user-1",
      name: "Teste",
      email: "teste@example.com",
      image: null,
    };

    mockedUser.findUnique.mockResolvedValueOnce(fakeUser);

    const req = new Request("http://localhost/api/account/me");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(fakeUser);
    expect(mockedUser.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { id: true, name: true, email: true, image: true },
    });
  });

  // ---------- PATCH ----------

  it("PATCH → deve retornar 401 se não estiver autenticado", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/account/me", {
      method: "PATCH",
      body: JSON.stringify({ name: "Novo Nome" }),
    });

    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Não autenticado");
    expect(mockedUser.update).not.toHaveBeenCalled();
  });

  it("PATCH → deve validar nome muito curto", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    const req = new Request("http://localhost/api/account/me", {
      method: "PATCH",
      body: JSON.stringify({ name: " a " }),
    });

    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Nome muito curto.");
    expect(mockedUser.update).not.toHaveBeenCalled();
  });

  it("PATCH → deve validar campo image inválido", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    const req = new Request("http://localhost/api/account/me", {
      method: "PATCH",
      body: JSON.stringify({ image: 123 }),
    });

    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Campo image inválido.");
    expect(mockedUser.update).not.toHaveBeenCalled();
  });

  it("PATCH → deve atualizar nome e/ou image quando dados válidos", async () => {
    mockedAuth.api.getSession.mockResolvedValueOnce({
      user: { id: "user-1" },
    });

    const updatedUser = {
      id: "user-1",
      name: "Novo Nome",
      email: "teste@example.com",
      image: "https://example.com/avatar.png",
    };

    mockedUser.update.mockResolvedValueOnce(updatedUser as never);

    const req = new Request("http://localhost/api/account/me", {
      method: "PATCH",
      body: JSON.stringify({
        name: "  Novo Nome  ",
        image: "https://example.com/avatar.png",
      }),
    });

    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(updatedUser);
    expect(mockedUser.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        name: "Novo Nome",
        image: "https://example.com/avatar.png",
      },
      select: { id: true, name: true, email: true, image: true },
    });
  });
});
