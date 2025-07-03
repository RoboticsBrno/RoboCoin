"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
	isLoggedIn: false,
	setIsLoggedIn: (value: boolean) => { console.warn("setIsLoggedIn function not initialized, Value:", value); },
	isAdmin: false,
});

export function AuthProvider({ children, initialIsLoggedIn = false, initialIsAdmin = false }: { children: React.ReactNode; initialIsLoggedIn?: boolean; initialIsAdmin?: boolean }) {
	const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
	const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

	useEffect(() => {
		const cookieMatch = document.cookie.match(/(?:^|;\s*)ID=([^;]+)/);
		if (cookieMatch && !isLoggedIn) {
			setIsLoggedIn(true);
			setIsAdmin(true);
		}
	}, [isLoggedIn]);

	return (
		<AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isAdmin }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}

