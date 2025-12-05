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
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponse'
 *       409:
 *         description: User already exists
 *       500:
 *         description: Error creating user
 */
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { SignupRequest, SignupResponse, User, Balance } from "@/types";

export async function POST(
	req: NextRequest
): Promise<NextResponse<SignupResponse | { error: string }>> {
	const { login, name, password, isOrg, isAdmin, camp_url }: SignupRequest =
		await req.json();

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

	if (!camp_url) {
		return NextResponse.json(
			{ error: "Camp URL is required" },
			{ status: 400 }
		);
	}
	const camp = await prisma.camp.findUnique({
		where: { name_url: camp_url },
	});

	if (!camp) {
		return NextResponse.json({ error: "Camp not found" }, { status: 404 });
	}
	const camp_id = camp.id;

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

		await prisma.user_camp.create({
			data: {
				user: user.id,
				camp: camp_id,
				is_org,
				is_admin,
			},
		});

		const balance: Balance = await prisma.balance.create({
			data: {
				user: user.id,
				amount: 100,
				camp: camp_id,
			},
		});

		const responseUser: User = {
			id: user.id,
			login: user.login,
			name: user.name,
			is_manager: user.is_manager,
		};

		return NextResponse.json(
			{ user: responseUser, balance },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Error creating user" },
			{ status: 500 }
		);
	}
}
