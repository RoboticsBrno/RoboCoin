import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				login: { label: "Login", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.login || !credentials?.password) {
					throw new Error("Invalid credentials");
				}

				const user = await prisma.user.findUnique({
					where: { login: credentials.login },
				});

				if (!user) {
					throw new Error("User not found");
				}

				const isValid = bcrypt.compareSync(credentials.password, user.password);

				if (!isValid) {
					throw new Error("Invalid password");
				}

				const balance = await prisma.balance.findUnique({
					where: { userId: user.id },
				});

				return { id: user.id.toString(), name: user.name, login: user.login, is_org: user.is_org, is_admin: user.is_admin, balance: balance?.amount || 0 };
			},
		}),
	],
	session: {
		strategy: "jwt", // Ensure JWT strategy is used
		maxAge: 2 * 24 * 60 * 60, // 2 days
	},
	jwt: {
		secret: process.env.NEXTAUTH_SECRET,
	},
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			// Initial sign-in
			if (user) {
				token.id = user.id;
				token.login = user.login;
				token.is_org = user.is_org;
				token.is_admin = user.is_admin;
				token.balance = user.balance;
			}

			// Handle session updates, specifically for balance
			if (trigger === "update" && session?.balance) {
				token.balance = session.balance;
			}

			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.login = token.login;
				session.user.is_org = token.is_org;
				session.user.is_admin = token.is_admin;
				session.user.balance = token.balance;
			}
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };