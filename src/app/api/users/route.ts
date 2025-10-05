import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { UserSelect } from "@/lib/api";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const searchParams = req.nextUrl.searchParams;
	const campUrl = searchParams.get('camp_url');

	let users: any[] = [];

	if (campUrl) {
		const camp = await prisma.camp.findUnique({
			where: { name_url: campUrl },
			select: { id: true },
		});

		if (!camp) {
			return NextResponse.json(
				{ error: "Camp not found" },
				{ status: 404 }
			);
		}

		users = await prisma.user.findMany({
			where: {
				user_camp_user_camp_userTouser: {
					some: {
						camp: camp.id,
					},
				},
			},
			select: {
				id: true,
				name: true,
				login: true,
				user_camp_user_camp_userTouser: {
					where: { camp: camp.id },
					select: {
						is_org: true,
						is_admin: true,
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		});
	} else {
		users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				login: true,
			},
			orderBy: {
				name: "asc",
			},
		});
	}

	return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id, login, name, password, isOrg, isAdmin } = await req.json();
	const camp = session.camp_id;

	if (!id) {
		return NextResponse.json(
			{ error: "User ID is required" },
			{ status: 400 }
		);
	}

	if (!camp) {
		return NextResponse.json(
			{ error: "Camp context is required" },
			{ status: 400 }
		);
	}

	const data: any = {
		login,
		name,
	}
	const permissions: any = {
		is_org: isOrg,
		is_admin: isAdmin,
	};

	if (password) {
		data.password = password;
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				name: true,
				login: true,
			},
		});

		await prisma.user_camp.updateMany({
			where: { user: id, camp },
			data: permissions,
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
		await prisma.user_camp.delete({
			where: { user_camp: { user: parseInt(id), camp: session.camp_id || -1 } },
		});

		await prisma.balance.deleteMany({
			where: { user: parseInt(id), camp: session.camp_id || -1 },
		});

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Failed to delete user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}
