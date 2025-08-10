"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormContainer from "@/components/form/FormContainer";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormCheckbox from "@/components/form/FormCheckbox";
import FormSubmit from "@/components/form/FormSubmit";
import FormTitle from "@/components/form/FormTitle";

const importSchema = z.object({
	sheetKey: z.string().min(1, { message: "Sheet key is required" }),
	sheetName: z.string().min(1, { message: "Sheet name is required" }),
	importUserItems: z.boolean(),
	importItems: z.boolean(),
});

export type ImportSchema = z.infer<typeof importSchema>;

interface ImportFormProps {
	onFormSubmit: (data: ImportSchema) => Promise<void>;
	isSubmitting: boolean;
}

export default function ImportForm({
	onFormSubmit,
	isSubmitting,
}: ImportFormProps) {
	const methods = useForm<ImportSchema>({
		resolver: zodResolver(importSchema),
		defaultValues: {
			sheetKey: "",
			sheetName: "",
			importUserItems: true,
			importItems: true,
		},
	});

	const { handleSubmit } = methods;

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Import data</FormTitle>
				<FormGroup>
					<FormInput
						name="sheetKey"
						label="Google Sheets Key"
						required
					/>
				</FormGroup>
				<FormGroup>
					<FormInput name="sheetName" label="Sheet Name" required />
				</FormGroup>
				<FormGroup>
					<FormCheckbox
						name="importUserItems"
						label="Import User Items"
						defaultChecked={true}
					/>
				</FormGroup>
				<FormGroup>
					<FormCheckbox
						name="importItems"
						label="Import Items"
						defaultChecked={true}
					/>
				</FormGroup>
				<FormSubmit isLoading={isSubmitting}>Try Import</FormSubmit>
			</FormContainer>
		</FormProvider>
	);
}
