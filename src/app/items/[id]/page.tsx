'use client';

import { BackBtn } from '@/components/BackBtn';
import { DragDrop2ColForItem } from '@/components/DragDrop2Col';
import { useItem } from '@/utils/ItemContext';
import Link from 'next/link';
import Button from 'react-bootstrap/esm/Button';
import { Item } from '@/types/item';

export default function Page() {
	const item: Item = useItem();

	return (
		<div className="container mt-10">

			<BackBtn />
			<h1 className="text-2xl font-bold mb-2">{item.name}</h1>
			<p className="mb-2">Description: {item.description}</p>
			<p className="mb-2">Value: {item.value}</p>
			<p className="mb-0">Item ID: {item.id}</p>
			<Button variant='primary' className='mt-1 mb-1'>
				<Link href={`/items/${item.id}/edit`}>
					Upravit předmět
				</Link>
			</Button>

			<DragDrop2ColForItem item={item} />
		</div>
	);
}
