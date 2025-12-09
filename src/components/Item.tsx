import Card from "@/components/card/Card";
import Button from "@/components/Button";
import { useCurrencySymbol } from "@/hooks/useCurrencySymbol";

export default function Item({
	title,
	description,
	price,
	href,
	type,
	user,
	onRemove,
	onAdd,
	onBuy,
}: {
	title: string;
	description: string | null;
	price: number;
	href?: string;
	type?: "bought" | "offered" | "up";
	user?: string;
	onRemove?: () => void;
	onAdd?: () => void;
	onBuy?: () => void;
}) {
	const campCurrency = useCurrencySymbol();

	return (
		<Card href={href}>
			<h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
			<p className="text-gray-400 mb-4">
				{description || "Popis není k dispozici"}
			</p>
			<p className="text-green-400 font-bold">
				{price} {campCurrency}
			</p>
			{type === "bought" && (
				<h5 className="text-sm text-gray-400 mt-2">
					Koupil: {user || "Neznámý"}
				</h5>
			)}
			{type === "offered" && (
				<h5 className="text-sm text-gray-400 mt-2">
					Nabízí: {user || "Neznámý"}
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
			{onBuy !== undefined && (
				<Button onClick={onBuy} className="mt-4 w-full">
					Koupit
				</Button>
			)}
		</Card>
	);
}
