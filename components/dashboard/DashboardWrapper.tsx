import { FC } from "react";
import DashboardTopBar from "./DashboardTopBar";

const DashboardWrapper: FC = () => {
    return (
        <>
            <div className="flex h-screen flex-col">
                <DashboardTopBar userEmail="abcd@gmail.com" />
                <div className="flex flex-1 overflow-hidden">
                    <main className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold text-muted-foreground">Select a page or create a new one</h1>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default DashboardWrapper