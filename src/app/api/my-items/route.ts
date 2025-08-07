import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { item } from "../../../../generated/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;

	try {
		const items: item[] = await prisma.item.findMany({
			where: {
				owner: userId,
				from_marketplace: true,
				on_marketplace: false,
			},
		});

		return NextResponse.json(items);
	} catch (error) {
		console.error("Failed to fetch user items:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user items" },
			{ status: 500 }
		);
	}
}
