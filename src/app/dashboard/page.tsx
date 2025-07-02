import { Item } from "@/types/item";
import { User } from "@/types/user";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { users } from "@/mock/users";
import { items } from "@/mock/items";
import { ChevronRight, Gift, Coins } from "lucide-react";

function UserCard({ user }: { user: User }) {
	return (
		<div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-white/20 mb-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
						{user.name.charAt(0)}
					</div>
					<div>
						<h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
							{user.name}
						</h3>
						<p className="text-gray-500">ID: {user.id}</p>
					</div>
				</div>
				<Button variant="primary" size="sm" className="group-hover:scale-110">
					<Link href={`/users/${user.id}`}>
						<div className="flex items-center gap-2">
							Detail
							<ChevronRight className="text-sm" />
						</div>
					</Link>
				</Button>
			</div>
		</div>
	);
}

function ItemCard({ item }: { item: Item }) {
	return (
		<div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-white/20 mb-3">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<Gift className="text-purple-500" />
						<h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
							{item.name}
						</h3>
					</div>
					<p className="text-gray-600 mb-3 leading-relaxed">{item.description}</p>
					<div className="flex items-center gap-4 text-sm text-gray-500">
						<span>ID: {item.id}</span>
						<div className="flex items-center gap-1 text-yellow-600 font-semibold">
							<Coins className="text-sm" />
							{item.value} bodů
						</div>
					</div>
				</div>
				<Button variant="primary" size="sm" className="ml-4 group-hover:scale-110">
					<Link href={`/items/${item.id}`}>
						<div className="flex items-center gap-2">
							Detail
							<ChevronRight className="text-sm" />
						</div>
					</Link>
				</Button>
			</div>
		</div>
	);
}

export default function Page() {

	return (
		<div className="container mt-10 flex max-md:flex-col">
			<div className="min-md:w-1/2 mi-md:pr-5">
				{users.map(user => (
					<UserCard user={user} key={user.id} />
				))}
			</div>

			<div className="min-md:w-1/2 min-md:pl-5">
				{items.map(item => (
					<ItemCard item={item} key={item.id} />
				))}
			</div>
		</div>
	);
}
