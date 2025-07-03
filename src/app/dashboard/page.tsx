import { Item } from "@/types/item";
import { User, UserInfo } from "@/types/user";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ChevronRight, Gift, Coins } from "lucide-react";
import { getAllItems, getAllUsers } from "@/lib/endpoints";
import { cookies } from "next/headers";
import { COOKIE_TOKEN } from "@/config";

function UserCard({ user }: { user: User }) {
	return (
		<Link href={`/users/${user.id}`}>
			<div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-white/20 mb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
							{user.name.charAt(0)}
						</div>
						<div>
							<h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-0">
								{user.name}
							</h3>
						</div>
					</div>
					<Button variant="primary" size="sm" className="group-hover:scale-110">
						<div className="flex items-center gap-2">
							Detail
							<ChevronRight className="text-sm" />
						</div>
					</Button>
				</div>
			</div>
		</Link>
	);
}

function ItemCard({ item }: { item: Item }) {
	return (
					<Link href={`/items/${item.id}`}>
		<div className="group bg-white/90 w-full backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-white/20 mb-3">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<Gift className="text-purple-500" />
						<h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
							{item.name}
						</h3>
					</div>
					<p className="text-gray-600 mb-3 leading-relaxed">{item.description}</p>
					<div className="flex items-center text-sm text-gray-500">
						<div className="flex items-center  text-yellow-600 font-semibold">
							<Coins className="text-sm" />
							{item.price} bodů
						</div>
					</div>
				</div>
				<Button variant="primary" size="sm" className="ml-4 group-hover:scale-110">
						<div className="flex items-center gap-2">
							Detail
							<ChevronRight className="text-sm" />
						</div>
				</Button>
			</div>
		</div>
					</Link>
	);
}

export default async function Page() {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_TOKEN)?.value;

	let users: User[] = [];
	try {
		users = await getAllUsers(token);
		console.log("Fetched users:", users);
	} catch (error) {
		console.error("Error fetching users:", error);
		return (
			<div className="container flex justify-center mt-10">
				<div className="text-red-500">Chyba při načítání uživatelů.</div>
			</div>
		);
	}

	let items: Item[] = [];
	try {
		items = await getAllItems(token);
		console.log("Fetched items:", items);
	} catch (error) {
		console.error("Error fetching items:", error);
		return (
			<div className="container flex justify-center mt-10">
				<div className="text-red-500">Chyba při načítání položek.</div>
			</div>
		);
	}

	return (
		<div className="container mt-10 flex max-md:flex-col">
			<div className="min-md:w-1/2 mi-md:pr-5">
				{users.map(user => (
					<UserCard user={user} key={user.id} />
				))}
			</div>

			<div className="min-md:w-1/2 min-md:pl-5 flex flex-col items-end">
				<Button variant="success" size="lg" className="">
					<Link href="/items/create" className="flex items-center gap-2">
						<Gift className="text-lg" />
						Přidat nový předmět
					</Link>
				</Button>
				<div className="w-full mt-4">
					{items.map(item => (
						<ItemCard item={item} key={item.id} />
					))}
				</div>

			</div>
		</div>
	);
}
