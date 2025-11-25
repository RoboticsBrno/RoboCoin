/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get transactions for the current user
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TransactionWithUsers'
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch transactions
 */
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { getTransactions, TransactionWithUsers } from "@/lib/transactions";
import { authOptions } from "@/lib/auth";

export async function GET(): Promise<
	NextResponse<TransactionWithUsers[] | { error: string }>
> {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	try {
		const transactions: TransactionWithUsers[] = await getTransactions(
			parseInt(session.user.id)
		);

		return NextResponse.json(transactions);
	} catch (error) {
		console.error("Failed to fetch transactions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch transactions" },
			{ status: 500 }
		);
	}
}
