import Card from '@/components/card/Card';

export default function Item({
	title,
	description,
	price,
	href,
	type,
	user }: {
		title: string;
		description: string;
		price: number,
		href?: string,
		type?: 'bought' | 'offered' | 'up',
		user?: string
	}) {
	return (
		<Card href={href}>
			<h3 className="text-lg font-semibold">{title}</h3>
			<p className="text-sm text-gray-500">{description}</p>
			<p className="text-lg font-bold mt-2">${price.toFixed(2)}</p>
			{type === 'bought' && (
				<h5 className="text-sm text-gray-400 mt-2">Bought by: {user || "Unknown"}</h5>
			)}
			{type === 'offered' && (
				<h5 className="text-sm text-gray-400 mt-2">Offered by: {user || "Unknown"}</h5>
			)}
			{type === 'up' && (
				<h5 className="text-sm text-gray-400 mt-2">Available for purchase</h5>
			)}
		</Card>
	);

}
