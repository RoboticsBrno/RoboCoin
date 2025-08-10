import React from "react";

interface FormContainerProps {
	children: React.ReactNode;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	className?: string;
}

export default function FormContainer({
	children,
	onSubmit,
	className = "",
}: FormContainerProps) {
	return (
		<div className={`flex items-center justify-center bg-gray-900 ${className}`}>
			<div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
				<form className="space-y-6" onSubmit={onSubmit}>
					{children}
				</form>
			</div>
		</div>
	);
}
