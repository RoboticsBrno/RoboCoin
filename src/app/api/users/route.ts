/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users, optionally filtered by camp
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: camp_url
 *         schema:
 *           type: string
 *         description: The URL name of the camp to filter users by
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
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *               login:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               isOrg:
 *                 type: boolean
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to update user
 *   delete:
 *     summary: Delete a user from a camp
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: User ID is required
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to delete user
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const searchParams = req.nextUrl.searchParams;
	const campUrl = searchParams.get('camp_url');

	let users: any[] = [];

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

		users = await prisma.user.findMany({
			where: {
				user_camp_user_camp_userTouser: {
					some: {
						camp: camp.id,
					},
				},
			},
			select: {
				id: true,
				name: true,
				login: true,
				user_camp_user_camp_userTouser: {
					where: { camp: camp.id },
					select: {
						is_org: true,
						is_admin: true,
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		});
	} else {
		const managedCamps = await prisma.user_camp.findMany({
			where: {
				user: parseInt(session.user.id),
				is_admin: true,
			},
			select: {
				camp: true,
			},
		});

		const managedCampIds = managedCamps.map(uc => uc.camp);

		users = await prisma.user.findMany({
			where: {
				user_camp_user_camp_userTouser: {
					some: {
						camp: {
							in: managedCampIds,
						},
					},
				},
			},
			select: {
				id: true,
				name: true,
				login: true,
			},
			orderBy: {
				name: "asc",
			},
		});
	}

	return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id, login, name, password, isOrg, isAdmin } = await req.json();
	const camp = session.camp_id;

	if (!id) {
		return NextResponse.json(
			{ error: "User ID is required" },
			{ status: 400 }
		);
	}

	if (!camp) {
		return NextResponse.json(
			{ error: "Camp context is required" },
			{ status: 400 }
		);
	}

	const data: any = {
		login,
		name,
	}
	const permissions: any = {
		is_org: isOrg,
		is_admin: isAdmin,
	};

	if (password) {
		data.password = password;
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				name: true,
				login: true,
			},
		});

		await prisma.user_camp.updateMany({
			where: { user: id, camp },
			data: permissions,
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id } = await req.json();

	if (!id) {
		return NextResponse.json(
			{ error: "User ID is required" },
			{ status: 400 }
		);
	}

	try {
		await prisma.user_camp.delete({
			where: { user_camp: { user: parseInt(id), camp: session.camp_id || -1 } },
		});

		await prisma.balance.deleteMany({
			where: { user: parseInt(id), camp: session.camp_id || -1 },
		});

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Failed to delete user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}
