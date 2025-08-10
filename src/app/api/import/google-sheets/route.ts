import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Papa from "papaparse";
import { ImportItem, UserItems } from "@/lib/api";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user || !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await req.json();
	const { sheetKey, sheetName } = body;

	const csv = await fetch(`https://docs.google.com/spreadsheets/d/${sheetKey}/export?format=csv&gid=${sheetName}`);

	if (!csv.ok) {
		return NextResponse.json({ error: "Failed to fetch CSV" }, { status: 500 });
	}

	const csvText = await csv.text();
	const parsedData = Papa.parse(csvText, {
		header: true,
		skipEmptyLines: true,
	});

	if (parsedData.errors.length > 0) {
		console.error("CSV parsing errors:", parsedData.errors);
		return NextResponse.json({ error: "Error parsing CSV data" }, { status: 400 });
	}

	const data = parsedData.data;

	const items: ImportItem[] = getItems(data);
	const userItems: UserItems = getUserItems(data);

	await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay for demonstration

	let response: { items: ImportItem[], userItems: UserItems } = { items: [], userItems: {} };

	if (body.importItems) {
		response['items'] = items;
	}

	if (body.importUserItems) {
		response['userItems'] = userItems;
	}

	console.log("Response data:", response);

	return NextResponse.json(response, { status: 200 });
}

const firstItemCol = 'Lekce 1';
const usernameCol = 'Uživatelské jméno';

function getItems(data: any[]) {
	const item = data[0];
	if (!item) {
		return [];
	}

	const keys = Object.keys(item);
	const index = keys.indexOf(firstItemCol);
	if (index === -1) {
		return [];
	}

	const items = keys.slice(index);

	return items;
}

function getUserItems(data: any[]) {
	const items = getItems(data);

	const usersWithItems: UserItems = {};

	for (const row of data) {
		const username = row[usernameCol];
		if (!username) continue; // Skip rows without a username

		if (!usersWithItems[username]) {
			usersWithItems[username] = {};
		}

		for (const item of items) {
			if (row[item] === 'TRUE') {
				usersWithItems[username][item] = true;
			}
			else if (row[item] === 'FALSE') {
				usersWithItems[username][item] = false;
			}
		}
	}

	return usersWithItems;
}
