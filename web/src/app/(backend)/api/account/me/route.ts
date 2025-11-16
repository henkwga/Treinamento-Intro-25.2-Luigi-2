import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, image } = body as { name?: string; image?: string | null };

  let trimmedName = name;
  if (typeof trimmedName === "string") trimmedName = trimmedName.trim();
  if (trimmedName && trimmedName.length < 2) {
    return NextResponse.json({ error: "Nome muito curto." }, { status: 400 });
  }
  if (image !== undefined && image !== null && typeof image !== "string") {
    return NextResponse.json({ error: "Campo image inválido." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(trimmedName !== undefined ? { name: trimmedName } : {}),
      ...(image !== undefined ? { image } : {}),
    },
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json(updated);
}
