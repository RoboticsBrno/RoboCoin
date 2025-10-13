/**
 * @swagger
 * /api/manager/add-managers:
 *   post:
 *     summary: Add or remove managers to a camp
 *     tags: [Manager]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - camp_url
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               camp_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Managers updated successfully
 *       400:
 *         description: Missing camp_url or userIds
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Camp not found
 *       500:
 *         description: Internal server error
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const data = await req.json();


	const { userIds, camp_url } = data;

	if (!camp_url || !userIds) {
		return NextResponse.json({ error: "Missing camp_url or userIds" }, { status: 400 });
	}

	const camp = await prisma.camp.findUnique({
		where: { name_url: camp_url },
	});

	if (!camp) {
		return NextResponse.json({ error: "Camp not found" }, { status: 404 });
	}

	const currentManagerId = parseInt(session.user.id, 10);
	if (!userIds.includes(currentManagerId)) {
		userIds.push(currentManagerId);
	}


	const currentManagers = await prisma.user_camp.findMany({
		where: {
			camp: camp.id,
			user_user_camp_userTouser: {
				is_manager: true,
			},
		},
		select: { user: true },
	});

	const currentManagerIds = currentManagers.map(m => m.user);

	const toAdd: { id: number }[] = userIds
		.map((id: string) => ({ id: parseInt(id, 10) }))
		.filter((idObj: { id: number }) => !currentManagerIds.includes(idObj.id));
	const toRemove = await prisma.user_camp.findMany({
		where: {
			camp: camp.id,
			user: {
				notIn: userIds.map((id: string) => parseInt(id, 10)),
			},
			user_user_camp_userTouser: {
				is_manager: true,
			},
		},
		select: { user: true },
	});

	try {
		await prisma.$transaction(async (prisma) => {
			if (toAdd.length > 0) {
				await prisma.user_camp.createMany({
					data: toAdd.map(a => ({
						user: a.id,
						camp: camp.id,
						is_admin: true,
						is_org: true
					})),
					skipDuplicates: true,
				});
			}

			if (toRemove.length > 0) {
				await prisma.user_camp.deleteMany({
					where: {
						camp: camp.id,
						user: {
							in: toRemove.map(r => r.user),
						},
					},
				});
			}
		});
	} catch (error) {
		console.error("Error updating managers:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}

	return NextResponse.json({ message: "Managers updated successfully" });

}

