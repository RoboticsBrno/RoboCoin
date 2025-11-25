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
 *             $ref: '#/components/schemas/AddManagersRequest'
 *     responses:
 *       200:
 *         description: Managers updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddManagersResponse'
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
import { AddManagersRequest, AddManagersResponse } from "@/types";

export async function POST(
	req: NextRequest
): Promise<NextResponse<AddManagersResponse | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userIds, camp_url }: AddManagersRequest = await req.json();

	if (!camp_url || !userIds) {
		return NextResponse.json(
			{ error: "Missing camp_url or userIds" },
			{ status: 400 }
		);
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

	const currentManagerIds = currentManagers.map((m) => m.user);

	const toAdd = userIds.filter(
		(id: number) => !currentManagerIds.includes(id)
	);
	const toRemove = currentManagerIds.filter(
		(id: number) => !userIds.includes(id)
	);

	try {
		await prisma.$transaction(async (prisma) => {
			if (toAdd.length > 0) {
				await prisma.user_camp.createMany({
					data: toAdd.map((id) => ({
						user: id,
						camp: camp.id,
						is_admin: true,
						is_org: true,
					})),
					skipDuplicates: true,
				});
			}

			if (toRemove.length > 0) {
				await prisma.user_camp.deleteMany({
					where: {
						camp: camp.id,
						user: {
							in: toRemove,
						},
					},
				});
			}
		});
	} catch (error) {
		console.error("Error updating managers:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}

	return NextResponse.json({ message: "Managers updated successfully" });
}
