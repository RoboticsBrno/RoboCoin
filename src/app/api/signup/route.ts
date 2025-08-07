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
				is_org,
				is_admin,
			},
		});

		const balance = await prisma.balance.create({
			data: {
				user: user.id,
				amount: 0,
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
