import LandingPagesNav from "@/components/base/nav/InitialNav";
import { headers } from "next/headers";
import { auth } from "@/auth";
import DiscoshopHero from "./_components/DiscoshopHero";

export default async function DiscoshopPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLogged = !!session?.user;

  return (
    <div className="min-h-screen">
      <LandingPagesNav isLogged={isLogged} />
      <DiscoshopHero />
    </div>
  );
}
