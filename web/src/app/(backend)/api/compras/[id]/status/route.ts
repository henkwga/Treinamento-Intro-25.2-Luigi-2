import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { handleError } from "@/utils/http";
import { sendEmail } from "@/utils/email";

type Status =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;
    const userEmail = session?.user?.email ?? null;
    const userName = session?.user?.name ?? "";

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário não autenticado",
        },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Body JSON inválido",
        },
        { status: 400 }
      );
    }

    const { status } = body as { status?: Status };

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Status obrigatório",
        },
        { status: 400 }
      );
    }

    const allowed: Status[] = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status inválido",
        },
        { status: 400 }
      );
    }

    const found = await prisma.compra.findFirst({
      where: { id, userId },
    });

    if (!found) {
      return NextResponse.json(
        {
          success: false,
          message: "Pedido não encontrado",
        },
        { status: 404 }
      );
    }

    if (found.status !== "pending" && status !== found.status) {
      return NextResponse.json(
        {
          success: false,
          message: "Transição de status inválida",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.compra.update({
      where: { id },
      data: { status },
      include: { itens: { include: { produto: true } } },
    });

    if (userEmail && status !== found.status) {
      let subject = "";
      let bodyEmail = "";

      if (status === "paid") {
        subject = "Pagamento confirmado";
        bodyEmail = `Olá, ${userName || "tudo bem"}!\n\nSeu pagamento foi confirmado com sucesso.\nNúmero do pedido: ${updated.id}.`;
      } else if (status === "shipped") {
        subject = "Seu pedido foi enviado";
        bodyEmail = `Olá, ${userName || "tudo bem"}!\n\nSeu pedido ${updated.id} foi enviado. Em breve você receberá mais atualizações.`;
      } else if (status === "delivered") {
        subject = "Seu pedido foi entregue com sucesso";
        bodyEmail = `Olá, ${userName || "tudo bem"}!\n\nSua compra ${updated.id} foi entregue com sucesso. Esperamos que você curta os discos!`;
      }

      if (subject && bodyEmail) {
        await sendEmail(userEmail, subject, bodyEmail);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "atualizar status da compra");
  }
}
