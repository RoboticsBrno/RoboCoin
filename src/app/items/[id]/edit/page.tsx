'use client';

import { BaseForm, FormGroup, FormInput, FormLabel, FormSubmit, FormTitle } from '@/components/Form';
import { Item } from '@/types/item';
import { useItem } from '@/utils/ItemContext';

export default function EditItem() {
	const item: Item = useItem();

	const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const updatedItem = {
			id: item.id,
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			value: parseFloat(formData.get('value') as string),
		};

		console.log('Updated Item:', updatedItem);
		window.location.href = `/items/${item.id}`;
	}

	return (
		<div className="container mt-10">
			<h1 className="text-2xl font-bold mb-4">Úprava předmětu "{item.name}"</h1>
			<BaseForm onSubmit={handleSave}>
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
					<FormInput name="value" id="value" type="number" defaultValue={item.value} required />
				</FormGroup>

				<FormSubmit className="mt-4" variant="primary">
					Uložit změny
				</FormSubmit>
			</BaseForm>
		</div>
	);
}
