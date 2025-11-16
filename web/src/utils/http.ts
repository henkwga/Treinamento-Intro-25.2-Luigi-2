import { NextResponse } from "next/server";
import type { ZodError, ZodIssue } from "zod";

export function badRequest(issues: any) {
  return NextResponse.json(
    {
      message: "Invalid request",
      issues,
    },
    { status: 400 }
  );
}

export function toIssues(error: ZodError | any) {
  if (!error?.issues) return error;

  return error.issues.map((i: ZodIssue) => ({
    message: i.message,
    path: i.path.join("."),
    code: i.code,
  }));
}
