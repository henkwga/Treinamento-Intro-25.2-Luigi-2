  // padronização da desgraca do json

export function normalizeCoverPath(p: string) {
  if (!p) return "/icons/under-construction.png";
  p = p.replace(/^public\//, "");
  p = p.replace(/^assets\/imgs\/albuns\//, "albuns/");
  p = p.replace(/^assets\/imgs\//, "");
  if (!p.startsWith("/")) p = "/" + p;
  return p;
}
