
import React from 'react';

const variants = {
	primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
	secondary: 'bg-gray-600 text-white hover:bg-gray-700',
	success: 'bg-green-600 text-white hover:bg-green-700',
	danger: 'bg-red-600 text-white hover:bg-red-700',
	warning: 'bg-yellow-500 text-black hover:bg-yellow-600',
	info: 'bg-blue-500 text-white hover:bg-blue-600',
};

const sizes = {
	sm: 'px-2 py-1 text-sm',
	md: 'px-4 py-2 text-base',
	lg: 'px-6 py-3 text-lg',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
	const variantClasses = variants[variant];
	const sizeClasses = sizes[size];

	return (
		<button
			className={`rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses} ${sizeClasses} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
