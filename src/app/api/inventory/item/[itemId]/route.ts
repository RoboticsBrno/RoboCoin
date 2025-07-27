import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { itemId: string } }
) {
	const session = await getServerSession(authOptions);

	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const itemId = parseInt(params.itemId, 10);

	if (isNaN(itemId)) {
		return NextResponse.json({ error: "Invalid Item ID" }, { status: 400 });
	}

	try {
		const inventory = await prisma.inventory.findMany({
			where: { item: itemId },
			select: {
				user: true,
			},
		});

		const ownerIds = inventory.map(inv => inv.user);
		return NextResponse.json(ownerIds);

	} catch (error) {
		console.error("Failed to fetch item owners:", error);
		return NextResponse.json({ error: "Failed to fetch item owners" }, { status: 500 });
	}
}
