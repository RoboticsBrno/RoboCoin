import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const searchParams = req.nextUrl.searchParams;
	const campUrl = searchParams.get('camp_url');

	let users;
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

		users = await getAllManagersInCamp(camp.id);
	} else {
		users = await getAllManagers();
	}

	return NextResponse.json(users);

}

async function getAllManagersInCamp(campId: number) {
	const managers = await prisma.user.findMany({
		where: {
			is_manager: true,
			user_camp_user_camp_userTouser: {
				some: {
					camp: campId,
				},
			},
		},
		select: {
			id: true,
			name: true,
			login: true,
		}
	});

	return managers;
}

async function getAllManagers() {
	const managers = await prisma.user.findMany({
		where: {
			is_manager: true,
		},
		select: {
			id: true,
			name: true,
			login: true,
		}
	});

	return managers;
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	if (!session.user?.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userIds, camp_url } = await req.json();

	if (!Array.isArray(userIds) || userIds.length === 0) {
		return NextResponse.json(
			{ error: "Please provide a non-empty array of user IDs." },
			{ status: 400 }
		);
	}

	if (!camp_url || typeof camp_url !== "string") {
		return NextResponse.json(
			{ error: "Please provide a valid camp URL." },
			{ status: 400 }
		);
	}

	const camp = await prisma.camp.findUnique({
		where: { name_url: camp_url },
	});

	if (!camp) {
		return NextResponse.json({ error: "Camp not found." }, { status: 404 });
	}

	const userIdsInt = userIds.map((id: string) => parseInt(id, 10));

	const users_in_camp = await prisma.user_camp.findMany({
		where: { camp: camp.id, NOT: { user: parseInt(session.user.id) } },
		select: { user: true },
	});

	const existingUserIds = users_in_camp.map((uc) => uc.user);

	const toAddUserIds = userIdsInt.filter((id) => !existingUserIds.includes(id));

	const toRemoveUserIds = existingUserIds.filter((id) => !userIdsInt.includes(id));

	await prisma.$transaction(async (prisma) => {
		if (toAddUserIds.length > 0) {
			const createData = toAddUserIds.map((userId) => ({
				user: userId,
				camp: camp.id,
			}));
			await prisma.user_camp.createMany({ data: createData });

			await prisma.balance.createMany({
				data: toAddUserIds.map((userId) => ({
					user: userId,
					camp: camp.id,
					amount: 0,
				}))
			});
		}

		if (toRemoveUserIds.length > 0) {
			await prisma.user_camp.deleteMany({
				where: {
					user: { in: toRemoveUserIds },
					camp: camp.id,
				},
			});

			await prisma.balance.deleteMany({
				where: {
					user: { in: toRemoveUserIds },
					camp: camp.id,
				}
			});

			await prisma.item.deleteMany({
				where: {
					owner: { in: toRemoveUserIds },
					camp: camp.id,
				}
			});
		}
	});

	return NextResponse.json({ message: "Users updated successfully" });
}
