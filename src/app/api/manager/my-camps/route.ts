import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const camps = await prisma.camp.findMany({
		where: {
			user_camp_user_camp_campTocamp: {
				some: {
					user: parseInt(session.user.id, 10),
				},
			},
		}
	});

	return NextResponse.json(camps);
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.is_manager) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { camp_url, userIds } = await req.json();

	if (!camp_url || !userIds) {
		return NextResponse.json({ error: "Missing camp_url or userIds" }, { status: 400 });
	}

	const camp = await prisma.camp.findUnique({
		where: { name_url: camp_url },
	});

	if (!camp) {
		return NextResponse.json({ error: "Camp not found" }, { status: 404 });
	}

	const currentAdmins = await prisma.user_camp.findMany({
		where: {
			camp: camp.id,
			is_admin: true,
		}
	});

	const currentAdminIds = currentAdmins.map(uc => uc.user);
	const newAdminIds = userIds.map((id: string) => parseInt(id, 10));

	const ownId = parseInt(session.user.id, 10);
	if (!newAdminIds.includes(ownId)) {
		newAdminIds.push(ownId);
	}

	const adminsToAdd = newAdminIds.filter((id: number) => !currentAdminIds.includes(id));
	const adminsToRemove = currentAdminIds.filter((id: number) => !newAdminIds.includes(id));

	for (const userId of adminsToAdd) {
		await prisma.user_camp.upsert({
			where: {
				user_camp: {
					user: userId,
					camp: camp.id
				}
			},
			create: {
				user: userId,
				camp: camp.id,
				is_admin: true,
				is_org: false,
			},
			update: {
				is_admin: true,
			}
		});
	}

	for (const userId of adminsToRemove) {
		await prisma.user_camp.update({
			where: {
				user_camp: {
					user: userId,
					camp: camp.id
				}
			},
			data: {
				is_admin: false,
			}
		});
	}

	return NextResponse.json({ success: true });
}