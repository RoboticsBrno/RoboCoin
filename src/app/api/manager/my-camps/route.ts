/**
 * @swagger
 * /api/manager/my-camps:
 *   get:
 *     summary: Get all camps for the current manager
 *     tags: [Manager]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of camps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Camp'
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Update admins of a camp
 *     tags: [Manager]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdminsRequest'
 *     responses:
 *       200:
 *         description: Admins updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateAdminsResponse'
 *       400:
 *         description: Missing camp_url or userIds
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Camp not found
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Camp, UpdateAdminsRequest, UpdateAdminsResponse } from "@/types";

export async function GET(): Promise<NextResponse<Camp[] | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const camps = await prisma.camp.findMany({
		where: {
			user_camp_user_camp_campTocamp: {
				some: {
					user: parseInt(session.user.id, 10),
				},
			},
		},
	});

	return NextResponse.json(camps);
}

export async function POST(
	req: NextRequest
): Promise<NextResponse<UpdateAdminsResponse | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { camp_url, userIds }: UpdateAdminsRequest = await req.json();

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

	const currentAdmins = await prisma.user_camp.findMany({
		where: {
			camp: camp.id,
			is_admin: true,
		},
	});

	const currentAdminIds = currentAdmins.map((uc) => uc.user);
	const newAdminIds = userIds;

	const ownId = parseInt(session.user.id, 10);
	if (!newAdminIds.includes(ownId)) {
		newAdminIds.push(ownId);
	}

	const adminsToAdd = newAdminIds.filter(
		(id: number) => !currentAdminIds.includes(id)
	);
	const adminsToRemove = currentAdminIds.filter(
		(id: number) => !newAdminIds.includes(id)
	);

	for (const userId of adminsToAdd) {
		await prisma.user_camp.upsert({
			where: {
				user_camp: {
					user: userId,
					camp: camp.id,
				},
			},
			create: {
				user: userId,
				camp: camp.id,
				is_admin: true,
				is_org: false,
			},
			update: {
				is_admin: true,
			},
		});
	}

	for (const userId of adminsToRemove) {
		await prisma.user_camp.update({
			where: {
				user_camp: {
					user: userId,
					camp: camp.id,
				},
			},
			data: {
				is_admin: false,
			},
		});
	}

	return NextResponse.json({ success: true });
}
