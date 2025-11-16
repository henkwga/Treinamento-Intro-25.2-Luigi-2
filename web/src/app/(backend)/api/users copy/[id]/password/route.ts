import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { blockForbiddenRequests, returnInvalidDataErrors, zodErrorHandler } from "@/utils/api";
import type { AllowedRoutes } from "@/types";

const allowedRoles: AllowedRoutes = {
  PATCH: ["ADMIN", "SUPER_ADMIN"],
};

const changePasswordSchema = z.object({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres")
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const forbidden = await blockForbiddenRequests(req, allowedRoles.PATCH);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);

    const { password } = parsed.data;

    return NextResponse.json({ message: "Senha atualizada" }, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}
