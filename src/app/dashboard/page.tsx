import { Item as ItemType } from "@/types/item";
import { User as UserType } from "@/types/user";
import Button from "react-bootstrap/esm/Button";
import Link from "next/link";
import { users } from "@/mock/users";
import { items } from "@/mock/items";

function UserCard({ user: { id, name } }: { user: UserType }) {
	return (
		<div className="mb-3 border-1 border-neutral-400 rounded-md px-3 py-2 flex items-center justify-between">
			<div className="info">
				<h2 className="mb-1">{name}</h2>
				<p className="mb-0">User ID: {id}</p>
			</div>

			<div className="actions">
				<Button variant="primary" className="mt-2">
					<Link href={`/users/${id}`}>
						Detail
					</Link>
				</Button>
			</div>
		</div>
	);
}

function ItemCard({ item: { id, name, value, description } }: { item: ItemType }) {
	return (
		<div className="mb-3 border-1 border-neutral-400 rounded-md px-3 py-2 flex justify-between items-center">
			<div className="info">
				<h2 className="mb-1">{name}</h2>
				<p className="mb-1">{description}</p>
				<p className="mb-0">Item ID: {id}</p>
				<p className="mb-0">Value: {value}</p>
			</div>

			<div className="actions">
				<Button variant="primary" className="mt-2">
					<Link href={`/items/${id}`}>
						Detail
					</Link>
				</Button>
			</div>
		</div>
	);
}

export default function Page() {

	return (
		<div className="container mt-10 flex ">
			<div className="w-1/2 pr-5">
				{users.map(user => (
					<UserCard user={user} key={user.id} />
				))}
			</div>

			<div className="w-1/2 pl-5">
				{items.map(item => (
					<ItemCard item={item} key={item.id} />
				))}
			</div>
		</div>
	);
}
