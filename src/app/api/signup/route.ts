/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - name
 *               - password
 *             properties:
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
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 balance:
 *                   $ref: '#/components/schemas/Balance'
 *       409:
 *         description: User already exists
 *       500:
 *         description: Error creating user
 */
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
	const { login, name, password, isOrg, isAdmin } = await req.json();

	const hashedPassword = await bcrypt.hash(password, 10);

	const existingUser = await prisma.user.findUnique({
		where: { login },
	});
	if (existingUser) {
		return NextResponse.json(
			{
				error: "User already exists, use different login",
			},
			{
				status: 409,
			}
		);
	}

	let is_org = false;
	let is_admin = false;
	const session = await getServerSession(authOptions);
	if (session?.user.is_admin) {
		is_org = isOrg || false;
		is_admin = isAdmin || false;
	}

	try {
		const user = await prisma.user.create({
			data: {
				login,
				name,
				password: hashedPassword,
			},
		});

		const camp_id = session?.camp_id || -1;

		await prisma.user_camp.create({
			data: {
				user: user.id,
				camp: camp_id,
				is_org,
				is_admin,
			},
		});

		const balance = await prisma.balance.create({
			data: {
				user: user.id,
				amount: 0,
				camp: camp_id,
			},
		});

		return NextResponse.json({ user, balance }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Error creating user" },
			{ status: 500 }
		);
	}
}
