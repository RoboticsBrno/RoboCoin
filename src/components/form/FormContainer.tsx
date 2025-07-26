import React from "react";
import {
	useForm,
	FormProvider,
	FieldValues,
	SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface FormContainerProps<T extends FieldValues> {
	children: React.ReactNode;
	onSubmit: SubmitHandler<T>;
	schema: z.ZodSchema<T>;
}

export default function FormContainer<T extends FieldValues>({
	children,
	onSubmit,
	schema,
}: FormContainerProps<T>) {
	const methods = useForm<T>({ resolver: zodResolver(schema) });
	const {
		formState: { isSubmitting },
	} = methods;

	return (
		<FormProvider {...methods}>
			<div className="flex items-center justify-center min-h-screen bg-gray-900">
				<div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
					<form
						className="space-y-6"
						onSubmit={methods.handleSubmit(onSubmit)}
					>
						{React.Children.map(children, (child) => {
							if (
								React.isValidElement(child) &&
								(child.type as any).displayName === "FormSubmit"
							) {
								return React.cloneElement(child, {
									isLoading: isSubmitting,
								});
							}
							return child;
						})}
					</form>
				</div>
			</div>
		</FormProvider>
	);
}
