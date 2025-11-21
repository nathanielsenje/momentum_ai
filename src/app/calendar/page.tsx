import { CalendarClientPage } from "./client-page";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarPage() {
    return (
        <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <CalendarClientPage />
        </React.Suspense>
    );
}
