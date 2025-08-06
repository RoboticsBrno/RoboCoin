import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
	}

	const item = await prisma.item.findUnique({
		where: {
			id: id,
		},
		include: {
			user: true,
		},
	});

	if (!item) {
		return NextResponse.json({ error: "Item not found" }, { status: 404 });
	}

	return NextResponse.json(item);
}
