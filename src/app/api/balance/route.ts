import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const balance = await prisma.balance.findUnique({
		where: { user: session.user.id },
	});

	return NextResponse.json({ balance: balance?.amount || 0 });
}

export async function PUT(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const items = await prisma.inventory.findMany({
		where: { user: parseInt(session.user.id) },
		include: {
			item_inventory_itemToitem: true,
		},
	});

	let balance = 0;
	for (const item of items) {
		if (item.item_inventory_itemToitem.on_marketplace) {
			balance += item.item_inventory_itemToitem.price * item.quantity;
		}
	}

	console.log("Calculated balance:", balance);
}
