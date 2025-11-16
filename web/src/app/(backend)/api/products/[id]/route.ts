import { NextRequest } from "next/server";
import { productCreateSchema, productPatchSchema } from "@/schemas/product";
import { badRequest } from "@/utils/http";

export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  const body = await _req.json();
  const parsed = productCreateSchema.safeParse(body); 
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })));
  }
  const updated = { id: params.id, ...parsed.data };
  return Response.json(updated);
}

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const body = await _req.json();
  const parsed = productPatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })));
  }
  const updated = { id: params.id, ...parsed.data };
  return Response.json(updated);
}
