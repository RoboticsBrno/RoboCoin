import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { InventoryItem } from "@/lib/api";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const achievements: InventoryItem[] = await prisma.inventory.findMany({
		where: { user: session.user.id },
		include: {
			item_inventory_itemToitem: true,
		},
	});

	return NextResponse.json(achievements);
}
