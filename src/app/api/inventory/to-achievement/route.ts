import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { itemId, userIds } = await req.json();
	const parsedItemId = parseInt(itemId, 10);
	const desiredUserIds = new Set(userIds.map((id: string | number) => parseInt(id.toString(), 10)));

	if (!parsedItemId) {
		return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
	}

	try {
		await prisma.$transaction(async (tx) => {
			const item = await tx.item.findUnique({ where: { id: parsedItemId } });
			if (!item) throw new Error("Item not found");

			const currentInventory = await tx.inventory.findMany({
				where: { item: parsedItemId },
				select: { user: true },
			});
			const currentUserIds = new Set(currentInventory.map(inv => inv.user));

			const usersToAdd = [...desiredUserIds].filter(id => !currentUserIds.has(id));
			const usersToRemove = [...currentUserIds].filter(id => !desiredUserIds.has(id));

			if (usersToRemove.length > 0) {
				await tx.inventory.deleteMany({
					where: {
						item: parsedItemId,
						user: { in: usersToRemove },
					},
				});
			}

			if (usersToAdd.length > 0) {
				await tx.inventory.createMany({
					data: usersToAdd.map(userId => ({
						user: userId,
						item: parsedItemId,
						quantity: 1,
					})),
				});
			}
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Failed to synchronize item owners:", error);
		return NextResponse.json({ error: "Failed to synchronize item owners" }, { status: 500 });
	}
}
