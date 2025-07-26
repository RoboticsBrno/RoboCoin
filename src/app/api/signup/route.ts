import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { login, name, password } = await req.json();

	const hashedPassword = await bcrypt.hash(password, 10);

	const existingUser = await prisma.user.findUnique({
		where: { login },
	});
	if (existingUser) {
		return new NextResponse("User already exists, use different login", {
			status: 409,
		});
	}

	try {
		const user = await prisma.user.create({
			data: {
				login,
				name,
				password: hashedPassword,
				is_org: false,
				is_admin: false,
			},
		});
		return NextResponse.json(user);
	} catch (error) {
		return new NextResponse("Error creating user", { status: 500 });
	}
}
