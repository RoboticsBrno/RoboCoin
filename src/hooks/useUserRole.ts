"use client";

import { useRole } from "@/app/RoleProvider";

export const useUserRole = () => {
    return useRole();
};
