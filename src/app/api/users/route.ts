import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { UserSelect } from "@/lib/api";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const users: UserSelect[] = await prisma.user.findMany({
		where: {
			deleted: false,
		},
		select: {
			id: true,
			name: true,
			login: true,
			is_admin: true,
			is_org: true,
		},
	});

	return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id, login, name, password, isOrg, isAdmin } = await req.json();

	if (!id) {
		return NextResponse.json(
			{ error: "User ID is required" },
			{ status: 400 }
		);
	}

	const data: any = {
		login,
		name,
		is_org: isOrg,
		is_admin: isAdmin,
	};

	if (password) {
		data.password = await bcrypt.hash(password, 10);
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				name: true,
				login: true,
				is_admin: true,
				is_org: true,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id } = await req.json();

	if (!id) {
		return NextResponse.json(
			{ error: "User ID is required" },
			{ status: 400 }
		);
	}

	try {
		await prisma.user.update({
			where: { id: parseInt(id, 10) },
			data: { deleted: true }, // Soft delete by marking as deleted
		});

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}
