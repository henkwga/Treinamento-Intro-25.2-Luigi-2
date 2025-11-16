import { NextResponse } from "next/server";
import type { ZodError, ZodIssue } from "zod";

export type ValidationIssue = {
  message: string;
  path: string;
  code: string;
};

export function toIssues(error: ZodError): ValidationIssue[] {
  return error.issues.map((i: ZodIssue) => ({
    message: i.message,
    path: i.path.join("."),
    code: i.code,
  }));
}

export function badRequest(issues: ValidationIssue[]) {
  return NextResponse.json(
    {
      message: "Invalid request",
      issues,
    },
    { status: 400 }
  );
}
