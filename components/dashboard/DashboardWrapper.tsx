import DashboardTopBar from "./DashboardTopBar";
import { getSupabaseServerClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";

export default async function DashboardPage() {
    const supabase = await getSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: pages } = await supabase
        .from("pages")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })

    return (
        <>
            <div className="flex h-screen flex-col">
                <DashboardTopBar userEmail={user.email || ""} />
                <div className="flex flex-1 overflow-hidden">
                    <DashboardSidebar initialPages={pages || []} />
                    <main className="flex flex-1 items-center justify-center">
                        <AnimatedPageWrapper>
                            <div className="text-center">
                                <h1 className="text-4xl mt-32 font-semibold text-muted-foreground">Select a page or create a new one</h1>
                            </div>
                        </AnimatedPageWrapper>
                    </main>
                </div>
            </div>
        </>
    )
}