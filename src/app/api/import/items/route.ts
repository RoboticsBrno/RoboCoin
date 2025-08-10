import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.string().transform(Number),
});

const itemsSchema = z.array(itemSchema);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const items = itemsSchema.parse(body);

        const createdItems = await prisma.$transaction(
            items.map((item) =>
                prisma.item.create({
                    data: {
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        is_available: true,
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
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
