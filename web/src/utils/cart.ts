// src/utils/cart.ts
export type CartLine = { id: string; qty: number };

const GUEST_KEY = "cart";

export function getCartKey(ownerId: string | null) {
  return ownerId ? `cart:${ownerId}` : GUEST_KEY;
}

export function readCart(ownerId: string | null): CartLine[] {
  if (typeof window === "undefined") return [];
  const key = getCartKey(ownerId);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l) => l && typeof l.id === "string" && typeof l.qty === "number",
    );
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[], ownerId: string | null) {
  if (typeof window === "undefined") return;
  const key = getCartKey(ownerId);
  localStorage.setItem(key, JSON.stringify(lines));
}
