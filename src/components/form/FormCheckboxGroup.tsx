import React from "react";
import { useFormContext } from "react-hook-form";
import FormCheckbox from "./FormCheckbox";

interface Option {
	value: string | number;
	label: string;
}

interface FormCheckboxGroupProps {
	label: string;
	name: string;
	options: Option[];
}

export default function FormCheckboxGroup({
	label,
	name,
	options,
}: FormCheckboxGroupProps) {
	const {
		formState: { errors },
	} = useFormContext();
	const error = errors[name]?.message as string | undefined;

	return (
		<fieldset>
			<legend className="block text-sm font-medium text-gray-300 mb-2">
				{label}
			</legend>
			<div className="grid grid-cols-2 gap-4">
				{options.map((option) => (
					<FormCheckbox
						key={option.value}
						id={`${name}-${option.value}`}
						label={option.label}
						name={name}
						value={option.value}
						showError={false}
					/>
				))}
			</div>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</fieldset>
	);
}
