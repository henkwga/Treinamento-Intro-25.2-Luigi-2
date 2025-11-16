"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import PasswordRequirement from "./PasswordRequirement";
import RequiredTag from "@/components/base/input/RequiredTag";
import {
  hasLowercase,
  hasMinLength,
  hasNumber,
  hasUppercase,
  validatePassword,
  validateConfirmPassword,
} from "@/utils";

import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

import dynamic from "next/dynamic";

const GoogleAuthButton = dynamic(
  () => import("@/components/auth/GoogleLoginButton"),
);
const CredentialsButton = dynamic(
  () => import("@/components/auth/CredentialsButton"),
);
const ValidatedInput = dynamic(
  () => import("@/components/base/input/ValidatedInput"),
);

export default function CadastroForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      if (!validatePassword(password)) {
        toast.error("A senha não atende aos requisitos mínimos");
        return;
      }

      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/",
      });

      if (result.error) {
        if (
          result.error.message?.includes("already exists") ||
          result.error.message?.includes("duplicate")
        ) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error(result.error.message || "Erro inesperado");
        }
      } else {
        toast.success(`Bem-vindo(a), ${name}!`);
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      toast.error((error as any).message ?? "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-left">
      <GoogleAuthButton
        disabled={loading}
        text="Cadastrar com Google"
      />

      <div className="flex items-center gap-4 py-6">
        <div className="flex-grow h-px bg-black/15" />
        <span className="text-xs text-black/45 font-medium">ou</span>
        <div className="flex-grow h-px bg-black/15" />
      </div>

      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <ValidatedInput
          title="Nome completo"
          placeholder="Maria da Discoshop"
          name="name"
          type="text"
          value={name}
          setValue={setName}
          required
          labelClassName="text-sm font-semibold text-[#5c2a08]"
          inputClassName="w-full rounded-xl bg-white/70 border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/20 shadow-sm"
        >
          <RequiredTag />
        </ValidatedInput>

        <ValidatedInput
          title="E-mail"
          placeholder="seuemail@exemplo.com"
          name="email"
          type="email"
          value={email}
          setValue={setEmail}
          required
          labelClassName="text-sm font-semibold text-[#5c2a08]"
          inputClassName="w-full rounded-xl bg-white/70 border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/20 shadow-sm"
        >
          <RequiredTag />
        </ValidatedInput>

        <ValidatedInput
          title="Senha"
          placeholder="Crie uma senha"
          name="password"
          type="password"
          value={password}
          setValue={setPassword}
          overrideValidate={validatePassword}
          required
          labelClassName="text-sm font-semibold text-[#5c2a08]"
          inputClassName="w-full rounded-xl bg-white/70 border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/20 shadow-sm"
        >
          <RequiredTag />
        </ValidatedInput>

        <ValidatedInput
          title="Confirmar senha"
          placeholder="Repita a senha"
          name="confirmPassword"
          type="password"
          dependencies={[password]}
          value={confirmPassword}
          setValue={setConfirmPassword}
          overrideValidate={(val) =>
            validateConfirmPassword(val, password)
          }
          required
          labelClassName="text-sm font-semibold text-[#5c2a08]"
          inputClassName="w-full rounded-xl bg-white/70 border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/20 shadow-sm"
        >
          <RequiredTag />
        </ValidatedInput>

        <div className="mt-1 text-xs text-black/70 space-y-1">
          <p className="font-semibold">Sua senha deve ter pelo menos:</p>
          <PasswordRequirement
            text="1 letra maiúscula"
            validateFunction={() => hasUppercase(password)}
          />
          <PasswordRequirement
            text="1 letra minúscula"
            validateFunction={() => hasLowercase(password)}
          />
          <PasswordRequirement
            text="1 número"
            validateFunction={() => hasNumber(password)}
          />
          <PasswordRequirement
            text="8 caracteres"
            validateFunction={() => hasMinLength(password)}
          />
        </div>

        <CredentialsButton
          disabled={loading}
          className="mt-4 w-full rounded-full bg-[#ffd100] hover:bg-[#ffcc00] px-6 py-3 text-sm font-semibold text-black shadow-md transition disabled:opacity-60"
        >
          Cadastrar
        </CredentialsButton>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="text-[#5c2a08] hover:text-black underline underline-offset-4 transition"
        >
          Já tem uma conta? Faça login
        </Link>
      </div>
    </div>
  );
}
