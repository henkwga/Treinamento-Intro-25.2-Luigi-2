import { NextResponse } from "next/server";
import { ZodError, type ZodIssue } from "zod";

export type IssueDTO = {
  path: string;
  message: string;
};

export function toIssues(error: ZodError | ZodIssue[]): IssueDTO[] {
  const issues = Array.isArray(error) ? error : error.issues;

  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}


export function badRequest(
  messageOrIssues: string | ZodError | ZodIssue[],
) {
  if (typeof messageOrIssues === "string") {
    return NextResponse.json(
      {
        success: false,
        message: messageOrIssues,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Dados inválidos",
      issues: toIssues(messageOrIssues),
    },
    { status: 400 },
  );
}

/**
 * Função utilitária para centralizar tratamento de erros nas rotas.
 *
 * @param error  erro capturado no catch
 * @param action texto da ação para montar a msg de erro genérica
 *               ex: "criar produto", "listar compras"
 */
export function handleError(error: unknown, action: string) {

  console.error(error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: `Dados inválidos ao ${action}`,
        issues: toIssues(error),
      },
      { status: 400 },
    );
  }

  if (
    error instanceof Error &&
    (
      error.name === "AuthError" ||
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("não autenticado") ||
      error.message.toLowerCase().includes("not authenticated")
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Não autorizado",
      },
      { status: 401 },
    );
  }

  const fallbackMessage =
    error instanceof Error && error.message
      ? error.message
      : `Erro ao ${action}`;

  return NextResponse.json(
    {
      success: false,
      message: fallbackMessage,
    },
    { status: 500 },
  );
}
