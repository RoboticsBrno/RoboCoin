/**
 * @swagger
 * /api/admin/circulation:
 *   get:
 *     summary: Get total currency in circulation
 *     description: "Calculates the sum of all users' balances in the current camp."
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The total amount of currency in circulation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *       400:
 *         description: Camp not specified, invalid session
 *       401:
 *         description: Unauthorized
 */
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!session.camp_id) {
		return NextResponse.json({ error: "Camp not specified, invalid session" }, { status: 400 });
	}
	const campId = session.camp_id;

	const campUsers = await prisma.user_camp.findMany({
		where: {
			camp: campId,
			is_admin: false,
			is_org: false,
		},
		select: {
			user: true,
		}
	})

	const campUserIds = campUsers.map(user => user.user);

	const balances = await prisma.balance.findMany({
		where: {
			camp: campId,
			user: {
				in: campUserIds
			}
		},
		select: {
			amount: true,
		},
	});

	const totalBalance = balances.reduce((acc, curr) => acc + curr.amount, 0);

	return NextResponse.json({ total: totalBalance }, { status: 200 });
}
