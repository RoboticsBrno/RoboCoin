import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { BalanceResponse } from "@/types";

/**
 * @swagger
 * /api/balance:
 *   get:
 *     summary: Get balance for current user for a specific camp
 *     tags: [Balance]
 *     parameters:
 *       - in: query
 *         name: camp
 *         schema:
 *           type: string
 *         description: The camp name to filter the balance
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with user balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BalanceResponse'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
export async function GET(
    req: NextRequest
): Promise<NextResponse<BalanceResponse | { error: string }>> {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const campName = searchParams.get("camp");

    if (!session.camp_id && !campName) {
        return NextResponse.json({ balance: 0 }, { status: 200 });
    }

    let campId = session.camp_id;
    if (campName && !session.camp_id) {
        const camp = await prisma.camp.findUnique({
            where: { name_url: campName },
            select: { id: true },
        });
        if (camp) {
            campId = camp.id;
        }
    }

    const balance = await prisma.balance.findFirst({
        where: {
            user: Number(session.user.id),
            camp: campId || -1,
        },
        select: { amount: true },
    });

    return NextResponse.json({ balance: balance?.amount || 0 });
}
