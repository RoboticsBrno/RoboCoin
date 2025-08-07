import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ItemWithUser } from "@/lib/api";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const resolvedParams = await params;
	const id = parseInt(resolvedParams.id);

	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
	}

	const item: ItemWithUser = await prisma.item.findUnique({
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
