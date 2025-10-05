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
		include: { managers: true },
	});

	if (!camp) {
		return NextResponse.json({ error: "Camp not found" }, { status: 404 });
	}

	const currentManagerIds = camp.managers.map(m => m.id);
	const newManagerIds = userIds.map((id: string) => parseInt(id, 10));

	const ownId = parseInt(session.user.id, 10);
	if (!newManagerIds.includes(ownId)) {
		newManagerIds.push(ownId);
	}

	const managersToAdd = newManagerIds.filter(id => !currentManagerIds.includes(id));
	const managersToRemove = currentManagerIds.filter(id => !newManagerIds.includes(id));

	await prisma.camp.update({
		where: { id: camp.id },
		data: {
			managers: {
				connect: managersToAdd.map(id => ({ id })),
				disconnect: managersToRemove.map(id => ({ id }))
			}
		}
	});

	return NextResponse.json({ success: true });
}
