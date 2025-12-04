/**
 * @swagger
 * /api/admin/extremes:
 *   get:
 *     summary: Get wealthiest and poorest users
 *     description: "Retrieves the top 5 wealthiest and top 5 poorest users in the current camp."
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the wealthiest and poorest users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wealthiest:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       balance:
 *                         type: number
 *                       id:
 *                         type: integer
 *                       login:
 *                         type: string
 *                       name:
 *                         type: string
 *                 poorest:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       balance:
 *                         type: number
 *                       id:
 *                         type: integer
 *                       login:
 *                         type: string
 *                       name:
 *                         type: string
 *       400:
 *         description: Camp not specified, invalid session
 *       401:
 *         description: Unauthorized
 */
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserExtremes } from "@/types";
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

	const wealthiest = await prisma.balance.findMany({
		where: {
			camp: campId,
			user_balance_userTouser: {
				user_camp_user_camp_userTouser: {
					none: {
						OR: [
							{ is_admin: true },
							{ is_org: true }
						],
					}
				}
			}
		},
		select: {
			amount: true,
			user_balance_userTouser: {
				select: {
					id: true,
					login: true,
					name: true,
				}
			}
		},
		orderBy: {
			amount: 'desc'
		},
		take: 5
	});
	const poorest = await prisma.balance.findMany({
		where: {
			camp: campId,
			user_balance_userTouser: {
				user_camp_user_camp_userTouser: {
					none: {
						OR: [
							{ is_admin: true },
							{ is_org: true }
						],
					}
				}
			}
		},
		select: {
			amount: true,
			user_balance_userTouser: {
				select: {
					id: true,
					login: true,
					name: true,
				}
			}
		},
		orderBy: {
			amount: 'asc'
		},
		take: 5
	});


	const wealthiestData: UserExtremes[] = wealthiest.map((item) => {
		return {
			balance: item.amount,
			id: item.user_balance_userTouser.id,
			login: item.user_balance_userTouser.login,
			name: item.user_balance_userTouser.name
		}
	});

	const poorestData: UserExtremes[] = poorest.map((item) => {
		return {
			balance: item.amount,
			id: item.user_balance_userTouser.id,
			login: item.user_balance_userTouser.login,
			name: item.user_balance_userTouser.name
		}
	});

	return NextResponse.json({ wealthiest: wealthiestData, poorest: poorestData }, { status: 200 });
}
