import { NextRequest, NextResponse } from "next/server";
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

/**
 * @swagger
 * /api/admin/users/{userId}/balance:
 *   put:
 *     summary: Update a user's balance
 *     description: "Updates a user's balance by adding, subtracting, or setting a new value. Administrator access is required."
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [add, subtract, set]
 *                 description: The type of balance update.
 *               amount:
 *                 type: integer
 *                 description: The amount to update.
 *               campUrl:
 *                 type: string
 *                 description: The URL of the camp.
 *     responses:
 *       200:
 *         description: The updated balance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Balance'
 *       400:
 *         description: Bad request (e.g., invalid input).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Camp not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userId } = await params;
	const numericUserId = parseInt(userId, 10);
	if (isNaN(numericUserId)) {
		return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
	}

	const { type, amount, campUrl } = JSON.parse(await req.json());

	if (!["add", "subtract", "set"].includes(type)) {
		return NextResponse.json(
			{ error: "Invalid type specified" },
			{ status: 400 }
		);
	}
	if (
		amount === undefined ||
		typeof amount !== "number" ||
		!Number.isInteger(amount) ||
		amount < 0
	) {
		return NextResponse.json(
			{ error: "Invalid amount: must be a non-negative integer." },
			{ status: 400 }
		);
	}
	if (!campUrl) {
		return NextResponse.json(
			{ error: "campUrl is required" },
			{ status: 400 }
		);
	}

	try {
		const camp = await prisma.camp.findUnique({
			where: { name_url: campUrl },
			select: { id: true },
		});

		if (!camp) {
			return NextResponse.json(
				{ error: "Camp not found" },
				{ status: 404 }
			);
		}

		const currentBalance = await prisma.balance.findFirst({
			where: {
				user: numericUserId,
				camp: camp.id,
			},
		});

		let newAmount: number;

		if (type === "set") {
			newAmount = amount;
		} else if (type === "add") {
			newAmount = (currentBalance?.amount || 0) + amount;
		} else {
			newAmount = (currentBalance?.amount || 0) - amount;
		}

		if (newAmount < 0) {
			return NextResponse.json(
				{ error: "Resulting balance cannot be negative." },
				{ status: 400 }
			);
		}

		const updatedBalance = await prisma.balance.upsert({
			where: {
				user_camp: {
					user: numericUserId,
					camp: camp.id,
				},
			},
			update: {
				amount: newAmount,
			},
			create: {
				user: numericUserId,
				camp: camp.id,
				amount: newAmount,
			},
			select: {
				amount: true,
			},
		});

		return NextResponse.json(updatedBalance, { status: 200 });
	} catch (error) {
		console.error("Error updating balance:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
