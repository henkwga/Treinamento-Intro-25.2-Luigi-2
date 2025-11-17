"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const GoogleAuthButton = dynamic(() => import("@/components/auth/GoogleLoginButton"));
const CredentialsButton = dynamic(() => import("@/components/auth/CredentialsButton"));
const ValidatedInput = dynamic(() => import("@/components/base/input/ValidatedInput"));
import RequiredTag from "@/components/base/input/RequiredTag";

export default function LoginForm() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => setLoading(false), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(result.error?.message || "Erro desconhecido");
      }
    } catch (error) {
      toast.error("Erro: " + String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-left">

      <form onSubmit={handleSubmit} className="space-y-5">

        <ValidatedInput
          title="E-mail"
          placeholder="seuemail@exemplo.com"
          name="email"
          type="email"
          value={email}
          setValue={setEmail}
          required
          labelClassName="text-sm font-semibold text-black/80"
          inputClassName="w-full rounded-xl bg-white/70 border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/20 shadow-sm"
        >
          <RequiredTag />
        </ValidatedInput>

        <ValidatedInput
          title="Senha"
          placeholder="••••••••"
          name="password"
          type="password"
          value={password}
          setValue={setPassword}
          overrideValidate={(v) => v.length >= 6}
          required
          labelClassName="text-sm font-semibold text-black/80"
          inputClassName="w-full rounded-xl bg-white/70 border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/20 shadow-sm"
        >
          <RequiredTag />
        </ValidatedInput>

        <CredentialsButton
          disabled={loading}
          className="w-full rounded-full bg-[#ffd100] hover:bg-[#ffcc00] px-6 py-3 text-sm font-semibold text-black shadow-md transition"
        >
          Entrar
        </CredentialsButton>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-grow h-px bg-black/20" />
        <span className="text-black/40 text-xs font-medium">ou</span>
        <div className="flex-grow h-px bg-black/20" />
      </div>

      <GoogleAuthButton
        disabled={loading}
        text="Entrar com Google"
      />

      <Link
        href="/cadastro"
        className="block text-center mt-6 text-sm text-black/70 hover:text-black underline underline-offset-4 transition"
      >
        Ainda não tem uma conta? Cadastre-se
      </Link>
    </div>
  );
}
