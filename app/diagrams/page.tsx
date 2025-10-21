import { DiagramList } from "@/components/diagrams/DiagramsList";
import { createServerClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function DiagramsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Diagrams</h1>
        <p className="text-muted-foreground">
          Create and manage your flowcharts and diagrams
        </p>
      </div>
      <a className="pt-5 font-bold text-xl" href="/dashboard">
        Go back to dashboard
      </a>
      <div className="mt-5">
        <DiagramList initialDiagrams={[]} />
      </div>
    </div>
  );
}
