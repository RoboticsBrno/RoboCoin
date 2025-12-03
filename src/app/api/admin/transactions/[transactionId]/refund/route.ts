import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * @swagger
 * /api/admin/transactions/{transactionId}/refund:
 *   post:
 *     summary: Refund a transaction
 *     description: Refunds a specific transaction, reversing the balance transfer and returning any associated item. Administrator access is required.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         description: The ID of the transaction to refund.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The transaction was refunded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request (e.g., invalid transaction ID, transaction already refunded).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Transaction not found.
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ transactionId: string }> }
) {
	const awaitedParams = await params;
	const session = await getServerSession(authOptions);
	if (!session || !session.user.is_admin) {
		return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
			status: 403,
		});
	}

	const transactionId = Number(awaitedParams.transactionId);
	if (isNaN(transactionId)) {
		return new NextResponse(
			JSON.stringify({ error: "Invalid transaction ID" }),
			{
				status: 400,
			}
		);
	}

	try {
		const originalTransaction = await prisma.transaction.findUnique({
			where: { id: transactionId },
		});

		if (!originalTransaction) {
			return new NextResponse(
				JSON.stringify({ error: "Transaction not found" }),
				{
					status: 404,
				}
			);
		}

		if (
			originalTransaction.description?.startsWith("Refund of transaction")
		) {
			return new NextResponse(
				JSON.stringify({
					error: "This transaction is already a refund.",
				}),
				{
					status: 400,
				}
			);
		}

		const existingRefund = await prisma.transaction.findFirst({
			where: {
				description: `Refund of transaction #${transactionId}`,
			},
		});

		if (existingRefund) {
			return new NextResponse(
				JSON.stringify({ error: "Transaction already refunded" }),
				{
					status: 400,
				}
			);
		}

		const { sender, receiver, amount, item, camp } = originalTransaction;

		if (item) {
			const buyerInventory = await prisma.inventory.findFirst({
				where: {
					user: receiver,
					item: item,
					camp: camp,
				},
			});

			if (!buyerInventory || buyerInventory.quantity < 1) {
				return new NextResponse(
					JSON.stringify({
						error: "Buyer no longer has the item. Refund cannot be processed.",
					}),
					{
						status: 400,
					}
				);
			}
		}

		await prisma.$transaction(async (tx) => {
			await tx.transaction.create({
				data: {
					sender: receiver,
					receiver: sender,
					amount: amount,
					item: item,
					camp: camp,
					description: `Refund of transaction #${transactionId}`,
					transaction_type: originalTransaction.transaction_type,
				},
			});

			await tx.balance.update({
				where: { user_camp: { user: receiver, camp: camp } },
				data: { amount: { decrement: amount } },
			});
			await tx.balance.update({
				where: { user_camp: { user: sender, camp: camp } },
				data: { amount: { increment: amount } },
			});

			if (item) {
				await tx.inventory.update({
					where: {
						id: (await tx.inventory.findFirst({
							where: { user: receiver, item: item, camp: camp },
						}))!.id,
					},
					data: { quantity: { decrement: 1 } },
				});

				const sellerInventory = await tx.inventory.findFirst({
					where: { user: sender, item: item, camp: camp },
				});

				if (sellerInventory) {
					await tx.inventory.update({
						where: { id: sellerInventory.id },
						data: { quantity: { increment: 1 } },
					});
				} else {
					await tx.inventory.create({
						data: {
							user: sender,
							item: item,
							camp: camp,
							quantity: 1,
						},
					});
				}
			}
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error refunding transaction:", error);
		return new NextResponse(
			JSON.stringify({
				error: "Internal server error while processing refund.",
			}),
			{
				status: 500,
			}
		);
	}
}
