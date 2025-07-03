import { updateItemAction } from '@/actions/item-actions';
import { cookies } from 'next/headers';
import { getItem } from '@/lib/endpoints';
import { COOKIE_TOKEN } from '@/config';
import { Item } from '@/types/item';
import { FormGroup, FormLabel, FormInput, FormSubmit, BaseForm } from '@/components/Form';

export default async function EditItem({ params }: { params: Promise<{ id: number }> }) {
	const { id } = await params;

	let item: Item;
	const cookieStore = await cookies();
	try {
		item = await getItem(id, cookieStore.get(COOKIE_TOKEN)?.value || '');
	} catch (error) {
		console.error('Error fetching item:', error);
		return <div className="text-red-500">Chyba při načítání předmětu.</div>;
	}

	return (
		<div className="container mt-10">
			<h1 className="text-2xl font-bold mb-4">Úprava předmětu "{item.name}"</h1>
			<BaseForm action={updateItemAction}>
				<input type="hidden" name="id" value={id} />
				<FormGroup>
					<FormLabel htmlFor="name">Název předmětu</FormLabel>
					<FormInput name="name" id="name" type="text" defaultValue={item.name} required />
				</FormGroup>
				<FormGroup>
					<FormLabel htmlFor="description">Popis</FormLabel>
					<FormInput name="description" id="description" type="text" defaultValue={item.description} required />
				</FormGroup>
				<FormGroup>
					<FormLabel htmlFor="value">Hodnota</FormLabel>
					<FormInput name="value" id="value" type="number" defaultValue={item.price} required />
				</FormGroup>
				<FormSubmit>
					Uložit změny
				</FormSubmit>
			</BaseForm>
		</div>
	);
}
