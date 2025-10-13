/**
 * @swagger
 * /api/manager/signup:
 *   post:
 *     summary: Sign up a new manager
 *     tags: [Manager]
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
 *               is_manager:
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
 *       409:
 *         description: User already exists
 *       500:
 *         description: Error creating user
 */
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { login, name, password, is_manager } = await req.json();

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

	try {
		const user = await prisma.user.create({
			data: {
				login,
				name,
				password: hashedPassword,
				is_manager,
			},
		});

		return NextResponse.json({ user }, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Error creating user" },
			{ status: 500 }
		);
	}
}
