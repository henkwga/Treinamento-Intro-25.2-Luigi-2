import {describe, it, expect, vi, beforeEach, type Mock} from "vitest";

import type { NextRequest } from "next/server";
import { PUT, PATCH } from "@/backend/api/products/[id]/route";

vi.mock("@/utils/http", () => ({
  badRequest: vi.fn((errors) => {
    return new Response(
      JSON.stringify({
        success: false,
        errors,
      }),
      { status: 400 },
    );
  }),
}));

const { badRequest } = await import("@/utils/http");
const badRequestMock = badRequest as unknown as Mock;

describe("API /api/products/[id] – validação (erros)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PUT → deve retornar 400 e chamar badRequest quando o body for inválido", async () => {
    const req = new Request("http://localhost/api/products/123", {
      method: "PUT",
      body: JSON.stringify({}),
    });

    const nextReq = req as unknown as NextRequest;

    const res = await PUT(nextReq, { params: { id: "123" } });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(badRequestMock).toHaveBeenCalledTimes(1);
  });

  it("PATCH → deve retornar 400 e chamar badRequest quando o body for inválido", async () => {
    const req = new Request("http://localhost/api/products/123", {
      method: "PATCH",
      body: JSON.stringify({ preco: "dez reais" }),
    });

    const nextReq = req as unknown as NextRequest;

    const res = await PATCH(nextReq, { params: { id: "123" } });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(badRequestMock).toHaveBeenCalledTimes(1);
  });
});
