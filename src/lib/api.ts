import { Prisma } from "#/prisma";

export type InventoryItem = Prisma.inventoryGetPayload<{
	include: { item_inventory_itemToitem: true };
}>;

export type ItemWithUser = Prisma.itemGetPayload<{
	include: { user: true };
}> | null;

export type UserSelect = Prisma.userGetPayload<{
	select: {
		id: true;
		name: true;
		login: true;
		user_camp_user_camp_userTouser: {
			where: { camp: number };
			select: {
				is_org: true;
				is_admin: true;
			};
		};
	};
}>;

export type UserItems = Record<string, Record<string, boolean>>;
export type ImportItem = string;
