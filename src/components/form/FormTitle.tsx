import React from "react";

interface FormTitleProps {
	children: React.ReactNode;
}

export default function FormTitle({ children }: FormTitleProps) {
	return (
		<h1 className="text-3xl font-bold text-center text-white">
			{children}
		</h1>
	);
}
