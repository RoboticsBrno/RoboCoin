/**
 * @swagger
 * /api/camps/{camp_url}:
 *   get:
 *     summary: Get camp details by camp_url
 *     tags: [Camps]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: camp_url
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL name of the camp
 *     responses:
 *       200:
 *         description: Camp details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampDetails'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Camp not found
 *       500:
 *         description: Failed to fetch camp
 *   put:
 *     summary: Update a camp
 *     tags: [Camps]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: camp_url
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL name of the camp to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Camp'
 *     responses:
 *       200:
 *         description: Camp updated
 *       400:
 *         description: Missing name_url
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Camp not found
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ camp_url: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	const resolvedParams = await params;

	try {
		const camp = await prisma.camp.findUnique({
			where: { name_url: resolvedParams.camp_url },
		});

		if (!camp) {
			return NextResponse.json({ error: "Camp not found" }, { status: 404 });
		}

		const campUser = await prisma.user_camp.findFirst({
			where: {
				user: parseInt(session.user.id),
				camp: camp.id,
			}
		});

		if (!campUser) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		return NextResponse.json({ ...camp, is_admin: !!campUser?.is_admin, is_org: !!campUser?.is_org });
	} catch (error) {
		console.error("Failed to fetch camp:", error);
		return NextResponse.json(
			{ error: "Failed to fetch camp" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ camp_url: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	const resolvedParams = await params;

	const data: { name: string, name_url: string, description: string, currency: string } = await req.json();

	if (!data.name_url) {
		return NextResponse.json({ error: "Missing name_url" }, { status: 400 });
	}

	const camp = await prisma.camp.findUnique({
		where: { name_url: resolvedParams.camp_url },
	});

	if (!camp) {
		return NextResponse.json({ error: "Camp not found" }, { status: 404 });
	}

	await prisma.camp.update({
		where: { id: camp.id },
		data,
	});

	return NextResponse.json({ message: "Camp updated" });
}
