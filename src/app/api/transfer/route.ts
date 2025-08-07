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

	const fromId = session.user.id;
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
			await transferBalance(tx, fromId, toId, parsedAmount, description);
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
