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
