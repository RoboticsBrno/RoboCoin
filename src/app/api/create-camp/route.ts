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
 *             type: object
 *             required:
 *               - name
 *               - name_url
 *             properties:
 *               name:
 *                 type: string
 *               name_url:
 *                 type: string
 *               description:
 *                 type: string
 *               currency:
 *                 type: string
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
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
	const { name, name_url, description, currency } = await req.json();

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
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
		return NextResponse.json({ error }, { status: 500 });
	}
}
