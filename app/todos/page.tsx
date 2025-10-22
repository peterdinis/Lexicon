import { getSupabaseServerClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import TodoWrapper from "@/components/todos/TodosWrapper";

export default async function TodosPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  return <TodoWrapper />;
}