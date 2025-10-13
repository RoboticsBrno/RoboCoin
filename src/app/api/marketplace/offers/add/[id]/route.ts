/**
 * @swagger
 * /api/marketplace/offers/add/{id}:
 *   post:
 *     summary: Add an item to the marketplace
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the item to add to the marketplace
 *     responses:
 *       200:
 *         description: Offer added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Offer added"
 *       401:
 *         description: Unauthorized
 */
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}
	const url = new URL(request.url);
	const pathSegments = url.pathname.split("/");
	const idString = pathSegments[pathSegments.length - 1];

	const id = parseInt(idString);
	await prisma.item.update({
		where: { id },
		data: {
			on_marketplace: true,
		},
	});

	return NextResponse.json({ message: "Offer added" });
}
