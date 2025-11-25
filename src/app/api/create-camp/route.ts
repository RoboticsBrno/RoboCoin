/**
 * @swagger
 * /api/create-camp:
 *   post:
 *     summary: Create a new camp
 *     tags: [Camps]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampRequest'
 *     responses:
 *       201:
 *         description: Camp created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateCampResponse'
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Camp already exists
 *       500:
 *         description: Error creating camp
 */
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { CreateCampRequest, CreateCampResponse } from "@/types";

export async function POST(
	req: NextRequest
): Promise<NextResponse<CreateCampResponse | { error: string }>> {
	const { name, name_url, description, currency }: CreateCampRequest =
		await req.json();

	const existingCamp = await prisma.camp.findUnique({
		where: { name_url },
	});
	if (existingCamp) {
		return NextResponse.json(
			{
				error: "Camp already exists, use different name URL",
			},
			{
				status: 409,
			}
		);
	}

	try {
		const camp = await prisma.camp.create({
			data: {
				name,
				name_url,
				description,
				currency,
			},
		});

		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		const user = Number(session.user.id);

		await prisma.user_camp.create({
			data: {
				user,
				camp: camp.id,
				is_org: true,
				is_admin: true,
			},
		});

		const balance = await prisma.balance.create({
			data: {
				user,
				camp: camp.id,
			},
		});
		return NextResponse.json({ user, balance }, { status: 201 });
	} catch (error) {
		console.error("Error creating camp:", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}
