"use client"

import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { CalendarRange } from "lucide-react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { toast } from "sonner";

const CalendarWrapper: FC = () => {
    return (
        <DashboardLayout>
            <header className="mb-6">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <CalendarRange className="h-5 w-5 text-muted-foreground" /> Calendar
                </h1>
                <p className="text-sm text-muted-foreground mt-1">View your schedule and upcoming items.</p>
            </header>

            <section className="grid gap-6 md:grid-cols-3 animate-fade-in">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Monthly view</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CalendarUI />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center justify-between"><span>Weekly planning</span><span className="text-muted-foreground">Tomorrow</span></li>
                            <li className="flex items-center justify-between"><span>Design review</span><span className="text-muted-foreground">Fri</span></li>
                            <li className="flex items-center justify-between"><span>Retro</span><span className="text-muted-foreground">Mon</span></li>
                        </ul>
                        <div className="mt-4">
                            <Button onClick={() => toast("Connect Supabase to add events.")}>Add event</Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </DashboardLayout>
    )
}

export default CalendarWrapper