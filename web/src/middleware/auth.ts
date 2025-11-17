import { NextResponse } from "next/server";
import { auth } from "@/auth";

type AuthSuccess = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export async function authMiddleware(
  req: Request
): Promise<NextResponse | AuthSuccess> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Usuário não autenticado",
      },
      { status: 401 }
    );
  }

  return { user: session.user };
}
