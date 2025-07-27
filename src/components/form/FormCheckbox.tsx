import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	name: string;
	showError?: boolean;
}

export default function FormCheckbox({ label, name, showError = true, ...props }: FormCheckboxProps) {
	const { register, formState: { errors } } = useFormContext();
	const error = errors[name]?.message as string | undefined;

	return (
		<div className="flex items-start">
			<div className="flex items-center h-5">
				<input
					id={props.id || name}
					type="checkbox"
					className="h-4 w-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-offset-gray-800"
					{...register(name)}
					{...props}
				/>
			</div>
			<div className="ml-3 text-sm">
				<label htmlFor={props.id || name} className="font-medium text-gray-300">
					{label}
				</label>
				{error && showError && <p className="text-red-500">{error}</p>}
			</div>
		</div>
	);
}
