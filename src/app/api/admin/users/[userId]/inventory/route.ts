
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * @swagger
 * /api/admin/users/{userId}/inventory:
 *   get:
 *     summary: Get a user's inventory
 *     description: Retrieves all items in a specific user's inventory for a specific camp. Administrator access is required.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: camp_url
 *         required: true
 *         description: The URL name of the camp.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of the user's inventory items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request (e.g., invalid user ID or missing camp_url).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Camp not found.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user.is_admin) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 403,
        });
    }

    const userId = Number(awaitedParams.userId);
    if (isNaN(userId)) {
        return new NextResponse(JSON.stringify({ error: "Invalid user ID" }), {
            status: 400,
        });
    }

    const { searchParams } = new URL(request.url);
    const camp_url = searchParams.get("camp_url");

    if (!camp_url) {
        return new NextResponse(JSON.stringify({ error: "Camp URL is required" }), {
            status: 400,
        });
    }

    try {
        const camp = await prisma.camp.findUnique({
            where: { name_url: camp_url },
        });

        if (!camp) {
            return new NextResponse(JSON.stringify({ error: "Camp not found" }), {
                status: 404,
            });
        }

        const inventory = await prisma.inventory.findMany({
            where: {
                user: userId,
                camp: camp.id,
                item_inventory_itemToitem: {
                    from_marketplace: true,
                    owner: userId,
                },
            },
            include: {
                item_inventory_itemToitem: true,
            },
        });

        const items = inventory.map((inv) => inv.item_inventory_itemToitem);

        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal server error" }),
            {
                status: 500,
            }
        );
    }
}
