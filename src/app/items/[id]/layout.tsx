import { items } from '@/mock/items';
import { ItemProvider } from '@/utils/ItemContext';
import Link from 'next/link';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/esm/Button';
import { Item } from '@/types/item';

export default async function Layout({
	params,
	children,
}: {
	params: Promise<{ id: string }>;
	children: React.ReactNode;
}) {
	const { id } = await params;
	const item: Item | undefined = items.find(item => item.id === id);

	if (!item) {
		return (
			<div className='container mt-10'>
				<Alert variant="danger">Předmět s ID {id} nebyl nalezen.</Alert>
				<Button variant='secondary' size='lg'>
					<Link href="/dashboard">Zpět na přehled</Link>
				</Button>
			</div>
		);
	}

	return (
		<ItemProvider item={item}>
			{children}
		</ItemProvider>
	);
}
