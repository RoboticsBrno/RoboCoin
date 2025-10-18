/**
 * @swagger
 * /api/manager/users:
 *   get:
 *     summary: Get all managers, optionally filtered by camp
 *     tags: [Manager]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: camp_url
 *         schema:
 *           type: string
 *         description: The URL name of the camp to filter managers by
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Camp not found
 *   post:
 *     summary: Add or remove users from a camp
 *     tags: [Manager]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUsersInCampRequest'
 *     responses:
 *       200:
 *         description: Users updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUsersInCampResponse'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Camp not found
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { UpdateUsersInCampRequest, UpdateUsersInCampResponse, User } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse<User[] | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const searchParams = req.nextUrl.searchParams;
	const campUrl = searchParams.get('camp_url');

	let users: User[];
	if (campUrl) {
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

		users = await getAllManagersInCamp(camp.id);
	} else {
		users = await getAllManagers();
	}

	return NextResponse.json(users);

}

async function getAllManagersInCamp(campId: number): Promise<User[]> {
	const managers = await prisma.user.findMany({
		where: {
			is_manager: true,
			user_camp_user_camp_userTouser: {
				some: {
					camp: campId,
				},
			},
		},
		select: {
			id: true,
			name: true,
			login: true,
            is_manager: true,
		}
	});

	return managers;
}

async function getAllManagers(): Promise<User[]> {
	const managers = await prisma.user.findMany({
		where: {
			is_manager: true,
		},
		select: {
			id: true,
			name: true,
			login: true,
            is_manager: true,
		}
	});

	return managers;
}

export async function POST(req: NextRequest): Promise<NextResponse<UpdateUsersInCampResponse | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	if (!session.user?.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userIds, camp_url }: UpdateUsersInCampRequest = await req.json();

	if (!Array.isArray(userIds) || userIds.length === 0) {
		return NextResponse.json(
			{ error: "Please provide a non-empty array of user IDs." },
			{ status: 400 }
		);
	}

	if (!camp_url || typeof camp_url !== "string") {
		return NextResponse.json(
			{ error: "Please provide a valid camp URL." },
			{ status: 400 }
		);
	}

	const camp = await prisma.camp.findUnique({
		where: { name_url: camp_url },
	});

	if (!camp) {
		return NextResponse.json({ error: "Camp not found." }, { status: 404 });
	}

	const userIdsInt = userIds.map((id: number) => id);

	const users_in_camp = await prisma.user_camp.findMany({
		where: { camp: camp.id, NOT: { user: parseInt(session.user.id) } },
		select: { user: true },
	});

	const existingUserIds = users_in_camp.map((uc) => uc.user);

	const toAddUserIds = userIdsInt.filter((id) => !existingUserIds.includes(id));

	const toRemoveUserIds = existingUserIds.filter((id) => !userIdsInt.includes(id));

	await prisma.$transaction(async (prisma) => {
		if (toAddUserIds.length > 0) {
			const createData = toAddUserIds.map((userId) => ({
				user: userId,
				camp: camp.id,
			}));
			await prisma.user_camp.createMany({ data: createData });

			await prisma.balance.createMany({
				data: toAddUserIds.map((userId) => ({
					user: userId,
					camp: camp.id,
					amount: 0,
				}))
			});
		}

		if (toRemoveUserIds.length > 0) {
			await prisma.user_camp.deleteMany({
				where: {
					user: { in: toRemoveUserIds },
					camp: camp.id,
				},
			});

			await prisma.balance.deleteMany({
				where: {
					user: { in: toRemoveUserIds },
					camp: camp.id,
				}
			});

			await prisma.item.deleteMany({
				where: {
					owner: { in: toRemoveUserIds },
					camp: camp.id,
				}
			});
		}
	});

	return NextResponse.json({ message: "Users updated successfully" });
}