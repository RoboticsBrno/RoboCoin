export type Item = {
	id: string;
	name: string;
	price: number;
	description: string;
}

export type AcquiredItem = {
	id: string;
	item: Item;
	time: string;
}
