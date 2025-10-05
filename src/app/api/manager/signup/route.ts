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
