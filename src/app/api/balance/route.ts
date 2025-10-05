import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const searchParams = req.nextUrl.searchParams;
	const campName = searchParams.get("camp");

	if (!session.camp_id && !campName) {
		return NextResponse.json(
			{ balance: 0 },
			{ status: 200 }
		);
	}

	let campId = session.camp_id;
	if (campName && !session.camp_id) {
		const camp = await prisma.camp.findUnique({
			where: { name_url: campName },
			select: { id: true },
		});
		if (camp) {
			campId = camp.id;
		}
	}

	const balance = await prisma.balance.findFirst({
		where: {
			user: Number(session.user.id),
			camp: campId || -1,
		},
		select: { amount: true },
	});

	return NextResponse.json({ balance: balance?.amount || 0 });
}
