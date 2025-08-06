import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = parseInt(session.user.id);

	try {
		const items = await prisma.item.findMany({
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
