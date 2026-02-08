import { AuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

interface UpdateData {
	balance?: number;
	camp_url?: string;
	camp_id?: number;
	user?: {
		is_admin: boolean;
		is_org: boolean;
	};
	user_camps?: string[];
}

export const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				login: { label: "Login", type: "text" },
				password: { label: "Password", type: "password" },
				camp: { label: "Camp", type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.login || !credentials?.password) {
					console.error("Byly poskytnuty neplatné přihlašovací údaje.");
					throw new Error("Neplatné přihlašovací údaje");
				}

				let user;
				let camp;
				let camp_user;
				if (credentials.camp === "null" || !credentials.camp) {
					user = await prisma.user.findFirst({
						where: { login: credentials.login },
					});
				} else {
					camp = await prisma.camp.findUnique({
						where: { name_url: credentials.camp },
					});
					user = await prisma.user.findFirst({
						where: {
							login: credentials.login,
							user_camp_user_camp_userTouser: {
								some: {
									camp: camp?.id,
								},
							},
						},
					});

					camp_user = await prisma.user_camp.findFirst({
						where: {
							user: user?.id,
							camp: camp?.id,
						},
					});
					if (!camp_user) {
						console.error(
							"Uživatel tábora nenalezen pro uživatele:",
							user?.id,
							"and camp:",
							camp?.id
						);
						throw new Error("Uživatel tábora nenalezen");
					}
				}

				if (!user) {
					console.error(
						"Uživatel nenalezen pro přihlašovací jméno:",
						credentials.login
					);
					throw new Error("Uživatel nenalezen");
				}

				if (
					(credentials.camp === "null" || !credentials.camp) &&
					!user.is_manager
				) {
					throw new Error("Uživatel není manažer");
				}

				const users_camps = await prisma.user_camp.findMany({
					where: {
						user: user.id,
					},
					select: {
						camp_user_camp_campTocamp: {
							select: { name_url: true },
						},
					},
				});

				const user_camps_list = users_camps.map(
					(uc) => uc.camp_user_camp_campTocamp.name_url
				);

				const isValid = bcrypt.compareSync(
					credentials.password,
					user.password
				);

				if (!isValid) {
					console.error(
						"Neplatné heslo pro uživatele:",
						credentials.login
					);
					throw new Error("Neplatné heslo");
				}

				let balance = null;
				if (credentials.camp && camp) {
					balance = await prisma.balance.findFirst({
						where: {
							user: user.id,
							camp: camp.id,
						},
					});
				}

				const result: User = {
					id: user.id.toString(),
					name: user.name,
					login: user.login,
					is_org: camp_user?.is_org || false,
					is_admin: camp_user?.is_admin || false,
					is_manager: user.is_manager || false,
					balance: balance?.amount,
					camp_url: credentials.camp || null,
					user_camps: user_camps_list || [],
					camp_id: camp?.id || null,
				};

				return result;
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 2 * 24 * 60 * 60, // 2 days
	},
	jwt: {
		secret: process.env.NEXTAUTH_SECRET,
	},
	callbacks: {
		async jwt({
			token,
			user,
			trigger,
			session,
		}: {
			token: JWT;
			user?: User;
			trigger?: "signIn" | "signUp" | "update" | "delete";
			session?: UpdateData;
		}) {
			if (user) {
				token.id = user.id;
				token.name = user.name;
				token.login = user.login;
				token.is_org = user.is_org;
				token.is_admin = user.is_admin;
				token.is_manager = user.is_manager;
				if (user.balance !== undefined) {
					token.balance = user.balance;
				}
				token.camp_url = user.camp_url;
				token.camp_id = user.camp_id;
				token.user_camps = user.user_camps;
			}
			if (trigger === "update" && session) {
				if (session.balance !== undefined) {
					token.balance = session.balance;
				}
				if (session.camp_url !== undefined) {
					token.camp_url = session.camp_url;
				}
				if (session.camp_id !== undefined) {
					token.camp_id = session.camp_id;
				}
				if (session.user && session.camp_id) {
					token.is_admin = session.user.is_admin;
					token.is_org = session.user.is_org;
				}

				if (session.user_camps !== undefined) {
					token.user_camps = session.user_camps;
				}
			}
			return token;
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			if (token) {
				session.user.id = token.id;
				session.user.name = token.name;
				session.user.login = token.login;
				session.user.is_org = token.is_org;
				session.user.is_admin = token.is_admin;
				session.user.is_manager = token.is_manager;
				session.user.balance = token.balance;
				session.camp_url = token.camp_url ?? null;
				session.camp_id = token.camp_id ?? null;
				session.user_camps = token.user_camps ?? [];
			}
			return session;
		},
	},
};
