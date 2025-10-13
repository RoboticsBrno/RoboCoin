/**
 * @swagger
 * /api/transfer:
 *   post:
 *     summary: Transfer balance to another user
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - amount
 *             properties:
 *               to:
 *                 type: integer
 *                 description: The ID of the user to transfer to
 *               amount:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to transfer balance
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { transferBalance } from "@/lib/balance";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { to, amount, description } = await req.json();

	if (!to || !amount) {
		return NextResponse.json(
			{ error: "Recipient and amount are required" },
			{ status: 400 }
		);
	}

	const parsedAmount = parseInt(String(amount), 10);
	if (isNaN(parsedAmount) || parsedAmount <= 0) {
		return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
	}

	const fromId = parseInt(session.user.id);
	const toId = parseInt(String(to), 10);

	if (isNaN(toId)) {
		return NextResponse.json(
			{ error: "Invalid recipient" },
			{ status: 400 }
		);
	}

	if (fromId === toId) {
		return NextResponse.json(
			{ error: "Cannot transfer to yourself" },
			{ status: 400 }
		);
	}

	try {
		await prisma.$transaction(async (tx) => {
			await transferBalance(tx, fromId, toId, parsedAmount, description, session.camp_id || -1);
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to transfer balance:", error);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		return NextResponse.json(
			{ error: "Failed to transfer balance" },
			{ status: 500 }
		);
	}
}
