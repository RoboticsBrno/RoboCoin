import Card from "@/components/card/Card";
import Button from "@/components/Button";

export default function Item({
	title,
	description,
	price,
	href,
	type,
	user,
	onRemove,
	onAdd,
}: {
	title: string;
	description: string | null;
	price: number;
	href?: string;
	type?: "bought" | "offered" | "up";
	user?: string;
	onRemove?: () => void;
	onAdd?: () => void;
}) {
	return (
		<Card href={href}>
			<h3 className="text-lg font-semibold">{title}</h3>
			<p className="text-sm text-gray-500">{description}</p>
			<p className="text-lg font-bold mt-2">${price.toFixed(2)}</p>
			{type === "bought" && (
				<h5 className="text-sm text-gray-400 mt-2">
					Koupil: {user || "Neznámý"}
				</h5>
			)}
			{type === "offered" && (
				<h5 className="text-sm text-gray-400 mt-2">
					Nabídl: {user || "Neznámý"}
				</h5>
			)}
			{type === "up" && (
				<h5 className="text-sm text-gray-400 mt-2">
					K dispozici k nákupu
				</h5>
			)}
			{onRemove && (
				<Button onClick={onRemove} className="mt-4 w-full">
					Odebrat z tržiště
				</Button>
			)}
			{onAdd && (
				<Button onClick={onAdd} className="mt-4 w-full">
					Přidat na tržiště
				</Button>
			)}
		</Card>
	);
}
