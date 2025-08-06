import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/transactions";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	try {
		const transactions = await getTransactions(parseInt(session.user.id));
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
