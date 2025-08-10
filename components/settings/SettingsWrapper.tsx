"use client"

import { useTheme } from "next-themes";
import { FC } from "react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { toast } from "sonner";

const SettingsWrapper: FC = () => {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <DashboardLayout>
            <header className="mb-6">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" /> Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your workspace preferences.</p>
            </header>

            <section className="grid gap-6 md:grid-cols-2 animate-fade-in">
                <Card>
                    <CardHeader>
                        <CardTitle>Workspace</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ws-name">Workspace name</Label>
                            <Input id="ws-name" placeholder="Acme Inc." />
                        </div>
                        <Button onClick={() => toast("Connect Supabase to save settings.")}>Save</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="pref-dark">Dark mode</Label>
                            <Switch
                                id="pref-dark"
                                className="transition-colors duration-300 ease-in-out"
                                checked={resolvedTheme === "dark"}
                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            />
                        </div>
                    </CardContent>
                </Card>
            </section>
        </DashboardLayout>
    )
}

export default SettingsWrapper