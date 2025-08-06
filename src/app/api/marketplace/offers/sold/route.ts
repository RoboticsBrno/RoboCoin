import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const items = await prisma.item.findMany({
		where: {
			on_marketplace: false,
			transaction_transaction_itemToitem: {
				some: {
					receiver: parseInt(session.user.id),
				},
			},
		},
		include: {
			user: true,
		},
	});

	return NextResponse.json(items);
}
