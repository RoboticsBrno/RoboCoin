import "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name: string;
			login: string;
			is_org: boolean;
			is_admin: boolean;
			is_manager: boolean;
			balance: number;
		};
		camp_url: string | null;
		camp_id: number | null;
		user_camps: string[];
	}
}
