import "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name: string;
			login: string;
			is_org: boolean;
			is_admin: boolean;
			balance: number;
		};
	}
}
