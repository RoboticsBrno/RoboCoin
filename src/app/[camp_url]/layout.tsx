"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { fetcher, FetchError } from "@/lib/fetch";
import { CampDetails } from "@/types";

export default function CampLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, update, status } = useSession();
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isSessionReady, setIsSessionReady] = useState(false);

    const campUrl = params.camp_url as string;

    const updateSessionWithCampData = useCallback(async () => {
        try {
            const campData = await fetcher<CampDetails>(
                `/api/camps/${campUrl}`
            );

            await update({
                camp_url: campData.name_url,
                camp_id: campData.id,
                user: {
                    ...session?.user,
                    balance: session?.user.balance || undefined,
                    is_admin: campData.is_admin,
                    is_org: campData.is_org,
                },
            });
            setIsSessionReady(true);
        } catch (error) {
            if (error instanceof FetchError) {
                router.push("/unauthorized");
            } else {
                console.error("Error updating session with camp data:", error);
            }
        }
    }, [campUrl, router, session?.user, update]);

    useEffect(() => {
        const checkSession = async () => {
            if (status === "loading") return;

            if (session && campUrl && session.camp_url !== campUrl) {
                await updateSessionWithCampData();
            } else if (session) {
                setIsSessionReady(true);
            }
        };

        checkSession();
    }, [session, campUrl, status, updateSessionWithCampData]);

    if (pathname.includes("login") || pathname.includes("signup")) {
        return <>{children}</>;
    }

    if (!isSessionReady) {
        return <Loader />;
    }

    return <>{children}</>;
}
