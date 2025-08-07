import { Prisma } from "../../generated/prisma";

export type InventoryItem = Prisma.inventoryGetPayload<{
	include: { item_inventory_itemToitem: true }
}>;

export type ItemWithUser = Prisma.itemGetPayload<{
	include: { user: true }
}> | null;

export type UserSelect = Prisma.userGetPayload<{
	select: {
		id: true;
		name: true;
		login: true;
		is_admin: true;
		is_org: true;
	};
}>;
