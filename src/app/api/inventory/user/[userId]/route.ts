import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { userId: string } }
) {
	const session = await getServerSession(authOptions);

	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	params = await params;
	const userId = parseInt(params.userId, 10);

	if (isNaN(userId)) {
		return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
	}

	try {
		const inventory = await prisma.inventory.findMany({
			where: { user: userId },
			select: {
				item: true, // We only need the IDs of the items they have
			},
		});

		// Return a simple array of item IDs for easy lookup on the client
		const ownedItemIds = inventory.map((inv) => inv.item);
		return NextResponse.json(ownedItemIds);
	} catch (error) {
		console.error("Failed to fetch user inventory:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user inventory" },
			{ status: 500 }
		);
	}
}
