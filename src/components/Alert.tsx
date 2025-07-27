"use client";

import React, { useState } from 'react';

// Define the styles for each alert variant
const variants = {
	primary: 'bg-blue-900 border-blue-700 text-blue-200',
	secondary: 'bg-gray-700 border-gray-600 text-gray-200',
	success: 'bg-green-900 border-green-700 text-green-200',
	danger: 'bg-red-900 border-red-700 text-red-200',
	warning: 'bg-yellow-900 border-yellow-700 text-yellow-200',
	info: 'bg-sky-900 border-sky-700 text-sky-200',
};

interface AlertProps {
	variant?: keyof typeof variants;
	message: string;
	icon?: React.ReactNode; // The new icon prop
	isOpen?: boolean;
	onClose?: () => void;
}

export default function Alert({ variant = 'info', message, icon, isOpen: defaultOpen = true, onClose }: AlertProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const handleClose = () => {
		setIsOpen(false);
		if (onClose) {
			onClose();
		}
	};

	if (!isOpen) {
		return null;
	}

	const variantClasses = variants[variant];

	return (
		<div
			className={`relative p-4 my-4 border-l-4 rounded-md shadow-lg ${variantClasses}`}
			role="alert"
		>
			<div className="flex items-start">
				{/* Render the icon if it's provided */}
				{icon && <div className="flex-shrink-0 mr-3">{icon}</div>}

				<div className="flex-grow">
					<p className="text-md font-medium">{message}</p>
				</div>

				<div className="ml-auto pl-3">
					<div className="-mx-1.5 -my-1.5">
						<button
							type="button"
							onClick={handleClose}
							className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses}`}
						>
							<span className="sr-only">Dismiss</span>
							<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
