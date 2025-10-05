"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

interface RoleContextType {
	is_org: boolean;
	is_admin: boolean;
}

const RoleContext = createContext<RoleContextType>({
	is_org: false,
	is_admin: false,
});

export const useRole = () => useContext(RoleContext);

export default function RoleProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session } = useSession();

	const is_org = session?.user?.is_org || false;
	const is_admin = session?.user?.is_admin || false;

	return (
		<RoleContext.Provider value={{ is_org, is_admin }}>
			{children}
		</RoleContext.Provider>
	);
}
