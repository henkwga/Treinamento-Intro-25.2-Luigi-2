import CadastroForm from "./_components/CadastroForm";

export default function CadastroPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,_#ffb347_0%,_#ffcc33_60%,_#ffa622_100%)] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[url('/clean-gray-paper.png')] mix-blend-overlay opacity-40" />

      <section className="relative z-10 w-full max-w-xl bg-black/20 backdrop-blur-xl border border-black/20 shadow-xl rounded-3xl p-10">
        <h1 className="text-4xl font-extrabold text-center text-[#5c2a08] tracking-wide drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]">
          Criar conta na Discoshop
        </h1>
        <p className="mt-1 text-sm text-center text-black/55">
          Cadastre-se para salvar seus pedidos e acompanhar suas compras.
        </p>

        <div className="mt-8">
          <CadastroForm />
        </div>
      </section>
    </main>
  );
}
