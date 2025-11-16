import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { blockForbiddenRequests, returnInvalidDataErrors, zodErrorHandler } from "@/utils/api";
import type { AllowedRoutes } from "@/types";

const allowedRoles: AllowedRoutes = {
  PATCH: ["ADMIN", "SUPER_ADMIN"],
};

const changeEmailSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const forbidden = await blockForbiddenRequests(req, allowedRoles.PATCH);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = changeEmailSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existing) {
      return NextResponse.json({ message: "E-mail já cadastrado" }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { email: parsed.data.email },
      select: { id: true, name: true, email: true, updatedAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}
