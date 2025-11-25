import React from "react";
import { useFormContext } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	name: string;
}

export default function FormFileInput({
	label,
	name,
	...props
}: FormInputProps) {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext();
	const error = errors[name]?.message as string | undefined;

	const fileList = watch(name) as FileList | null;
	const fileName = fileList && fileList.length > 0 ? fileList[0].name : null;
	const inputId = props.id || name;

	return (
		<>
			<label
				htmlFor={inputId}
				className="block text-sm font-medium text-gray-300"
			>
				{label}
			</label>
			<label
				htmlFor={inputId}
				className="block w-full cursor-pointer px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm"
			>
				{fileName || "Klikněte pro výběr souboru"}
			</label>
			<input
				type="file"
				id={inputId}
				className="hidden"
				{...register(name)}
				{...props}
			/>
			{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
		</>
	);
}
