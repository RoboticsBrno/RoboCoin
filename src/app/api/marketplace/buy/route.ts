import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id: itemId } = await req.json();

	if (!itemId || isNaN(parseInt(itemId))) {
		return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
	}

	const buyerId = parseInt(session.user.id);

	try {
		const item = await prisma.item.findUnique({
			where: { id: parseInt(itemId) },
		});

		if (!item) {
			return NextResponse.json(
				{ error: "Item not found" },
				{ status: 404 }
			);
		}

		if (!item.on_marketplace) {
			return NextResponse.json(
				{ error: "Item is not for sale" },
				{ status: 400 }
			);
		}

		const buyerBalance = await prisma.balance.findUnique({
			where: { user: buyerId },
		});

		if (!buyerBalance || buyerBalance.amount < item.price) {
			return NextResponse.json(
				{ error: "Insufficient funds" },
				{ status: 400 }
			);
		}

		await prisma.$transaction(async (tx) => {
			console.log("Starting transaction for item purchase");
			console.log(
				`Buyer ID: ${buyerId}, Seller ID: ${item.owner}, Item ID: ${item.id}, Item Price: ${item.price}`
			);
			await tx.balance.update({
				where: { user: buyerId },
				data: { amount: { decrement: item.price } },
			});

			await tx.balance.update({
				where: { user: item.owner },
				data: { amount: { increment: item.price } },
			});

			await tx.item.update({
				where: { id: item.id },
				data: { owner: buyerId, on_marketplace: false },
			});

			await tx.transaction.create({
				data: {
					sender: buyerId,
					receiver: item.owner,
					item: item.id,
					amount: item.price,
					description: `Purchase of ${item.title}`,
				},
			});
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Transaction failed:", error);
		return NextResponse.json(
			{ error: "Transaction failed" },
			{ status: 500 }
		);
	}
}
