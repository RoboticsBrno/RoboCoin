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
		balance: number;
	}

	interface User {
		id: string;
		name: string;
		login: string;
		is_org: boolean;
		is_admin: boolean;
		is_manager: boolean;
		balance: number;
		camp_url?: string | null;
		camp_id?: number | null;
		user_camps?: string[];
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		name: string;
		login: string;
		is_org: boolean;
		is_admin: boolean;
		is_manager: boolean;
		balance: number;
		camp_url?: string | null;
		camp_id?: number | null;
		user_camps?: string[];
	}
}

export type BalanceResponse = {
	balance: number;
};

export type Camp = {
	id: number;
	name: string;
	name_url: string;
	currency?: string | null;
	description?: string | null;
};

export type CampDetails = Camp & {
	is_admin: boolean;
	is_org: boolean;
};

export type CampUpdateResponse = {
	message: string;
};

export type Balance = {
	id: number;
	user: number;
	amount: number;
	camp: number | null;
};

export type CreateCampRequest = Omit<Camp, "id">;

export type CreateCampResponse = {
	user: number;
	balance: Balance;
};

export type ItemOwnersResponse = number[];

export type InventoryWithUserAndItem = {
	userLogin: string;
	itemTitle: string;
	quantity: number;
};

export type AssignItemRequest = {
	userId: number;
	itemId: number;
	quantity?: number;
};

export type SyncAchievementRequest = {
	itemId: number;
	userIds: number[];
};

export type SyncAchievementResponse = {
	success: boolean;
};

export type SyncUserInventoryRequest = {
	userId: number;
	itemIds: number[];
};

export type SyncUserInventoryResponse = {
	success: boolean;
};

export type UserInventoryResponse = number[];

export type Item = {
	id: number;
	title: string;
	description: string | null;
	price: number;
	on_marketplace: boolean;
	from_marketplace: boolean;
	owner: number;
	camp: number;
	created_at: Date | null;
	updated_at: Date | null;
};

export type CreateItemRequest = {
	title: string;
	description?: string;
	price?: number;
	on_marketplace?: boolean;
};

export type AddManagersRequest = {
	userIds: number[];
	camp_url: string;
};

export type AddManagersResponse = {
	message: string;
};

export type UpdateAdminsRequest = {
	camp_url: string;
	userIds: number[];
};

export type UpdateAdminsResponse = {
	success: boolean;
};

export type User = {
	id: number;
	login: string;
	name: string;
	is_manager: boolean;
};

export type ManagerSignupRequest = {
	login: string;
	name: string;
	password: string;
	is_manager?: boolean;
};

export type ManagerSignupResponse = {
	user: User;
};

export type UpdateUsersInCampRequest = {
	userIds: number[];
	camp_url: string;
};

export type UpdateUsersInCampResponse = {
	message: string;
};

export type BuyItemRequest = {
	id: number;
};

export type BuyItemResponse = {
	success: boolean;
};

export type CreateMarketplaceItemRequest = {
	title: string;
	description?: string;
	price?: number;
};

export type SignupRequest = {
	login: string;
	name: string;
	password: string;
	isOrg?: boolean;
	isAdmin?: boolean;
};

export type SignupResponse = {
	user: User;
	balance: Balance;
};

export type UpdateUserItemsResponse = {
	message: string;
};

export type TransferBalanceRequest = {
	to: number;
	amount: number;
	description?: string;
};

export type TransferBalanceResponse = {
	success: boolean;
};

export type UpdateUserRequest = {
	id: number;
	login?: string;
	name?: string;
	password?: string;
	isOrg?: boolean;
	isAdmin?: boolean;
};

export type DeleteUserRequest = {
	id: string;
};

export type DeleteUserResponse = {
	message: string;
};

export type Achievement = {
	id: number;
	title: string;
	description: string | null;
	price: number;
	quantity: number;
};
