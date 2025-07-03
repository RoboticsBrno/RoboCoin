import { createItemAction } from '@/actions/item-actions';
import { BaseForm, FormGroup, FormInput, FormLabel, FormSubmit } from '@/components/Form';

export default function Page() {

	return (
		<div className="container mt-10">
			<h1 className="text-2xl font-bold mb-4">Vytvoření nového předmětu</h1>
			<BaseForm action={createItemAction}>
				<FormGroup>
					<FormLabel htmlFor="name">Název předmětu</FormLabel>
					<FormInput name="name" id="name" type="text" required />
				</FormGroup>
				<FormGroup>
					<FormLabel htmlFor="description">Popis</FormLabel>
					<FormInput name="description" id="description" type="text" required />
				</FormGroup>
				<FormGroup>
					<FormLabel htmlFor="value">Hodnota</FormLabel>
					<FormInput name="value" id="value" type="number" required />
				</FormGroup>
				<FormSubmit>
					Vytvořit předmět
				</FormSubmit>
			</BaseForm>
		</div>
	);
}
