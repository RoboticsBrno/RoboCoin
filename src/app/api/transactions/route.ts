import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { getTransactions, TransactionWithUsers } from "@/lib/transactions";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	try {
		const transactions: TransactionWithUsers[] = await getTransactions(session.user.id);
		console.log("Fetched transactions:", transactions);
		return NextResponse.json(transactions);
	} catch (error) {
		console.error("Failed to fetch transactions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch transactions" },
			{ status: 500 }
		);
	}
}
