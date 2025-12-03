import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * @swagger
 * /api/admin/users/{userId}/balance:
 *   get:
 *     summary: Get a user's balance
 *     description: Retrieves the balance for a specific user within a specific camp. Administrator access is required.
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
 *         description: The user's balance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Balance'
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
		return new NextResponse(
			JSON.stringify({ error: "Camp URL is required" }),
			{
				status: 400,
			}
		);
	}

	try {
		const camp = await prisma.camp.findUnique({
			where: { name_url: camp_url },
		});

		if (!camp) {
			return new NextResponse(
				JSON.stringify({ error: "Camp not found" }),
				{
					status: 404,
				}
			);
		}

		const balance = await prisma.balance.findFirst({
			where: {
				user: userId,
				camp: camp.id,
			},
		});

		return NextResponse.json(balance || { amount: 0 });
	} catch (error) {
		console.error("Error fetching balance:", error);
		return new NextResponse(
			JSON.stringify({ error: "Internal server error" }),
			{
				status: 500,
			}
		);
	}
}
