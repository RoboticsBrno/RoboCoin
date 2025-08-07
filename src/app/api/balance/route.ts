import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const balance = await prisma.balance.findUnique({
		where: { user: session.user.id },
		select: { amount: true },
	});

	return NextResponse.json({ balance: balance?.amount || 0 });
}
