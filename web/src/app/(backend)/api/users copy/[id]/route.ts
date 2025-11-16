import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { blockForbiddenRequests, returnInvalidDataErrors, zodErrorHandler } from "@/utils/api";
import type { AllowedRoutes } from "@/types";

const allowedRoles: AllowedRoutes = {
  GET: ["ADMIN", "SUPER_ADMIN"],
  PATCH: ["SUPER_ADMIN"],   // ajuste se quiser permitir ADMIN também
  DELETE: ["SUPER_ADMIN"],
};

// schema de atualização parcial
const userUpdateSchema = z.object({
  name: z.string().min(2, "Nome muito curto").optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
}).strict();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const forbidden = await blockForbiddenRequests(_req, allowedRoles.GET);
    if (forbidden) return forbidden;

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const forbidden = await blockForbiddenRequests(req, allowedRoles.PATCH);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ message: "Nada para atualizar" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const forbidden = await blockForbiddenRequests(req, allowedRoles.DELETE);
    if (forbidden) return forbidden;

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true }, { status: 200 }); // ou 204 sem body
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}
