"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadSession() {
    try {
      const res = await authClient.getSession();
      setSession(res);
    } catch (err) {
      console.error("Erro ao carregar sessão:", err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession(); // apenas carrega — sem listener
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    refresh: loadSession, // permite recarregar quando você quiser
  };
}
