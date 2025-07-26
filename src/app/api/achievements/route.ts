import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const achievements = await prisma.inventory.findMany({
		where: { user: parseInt(session.user.id) },
		include: {
			item_inventory_itemToitem: true,
		},
	});

	return NextResponse.json(achievements);
}
