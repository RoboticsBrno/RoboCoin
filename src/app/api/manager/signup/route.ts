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
 *             $ref: '#/components/schemas/ManagerSignupRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ManagerSignupResponse'
 *       409:
 *         description: User already exists
 *       500:
 *         description: Error creating user
 */
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { ManagerSignupRequest, ManagerSignupResponse, User } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<ManagerSignupResponse | { error: string }>> {
	const { login, name, password, is_manager }: ManagerSignupRequest = await req.json();

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

        const responseUser: User = {
            id: user.id,
            login: user.login,
            name: user.name,
            is_manager: user.is_manager,
        }

		return NextResponse.json({ user: responseUser }, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Error creating user" },
			{ status: 500 }
		);
	}
}