export type Item = {
	id: number;
	name: string;
	price: number;
	description: string;
}

export type AcquiredItem = {
	id: number;
	item: Item;
	time: string;
}
