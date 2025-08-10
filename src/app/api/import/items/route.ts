import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const itemSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	price: z.string().transform(Number),
});

const itemsSchema = z.array(itemSchema);

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	try {
		const body = await req.json();
		const items = itemsSchema.parse(body);

		const createdItems = await prisma.$transaction(
			items.map((item) =>
				prisma.item.create({
					data: {
						title: item.name,
						description: item.description,
						price: item.price,
						from_marketplace: false,
						on_marketplace: false,
						owner: parseInt(session.user.id),
					},
				})
			)
		);

		return NextResponse.json(createdItems, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.issues }, { status: 400 });
		}
		console.error("Item creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
