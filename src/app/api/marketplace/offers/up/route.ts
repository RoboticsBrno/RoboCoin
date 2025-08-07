import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const items = await prisma.item.findMany({
		where: {
			on_marketplace: true,
			owner: parseInt(session.user.id),
			transaction_transaction_itemToitem: {
				none: {},
			},
		},
	});

	return NextResponse.json(items);
}
